const TARGET_URL =
  /^https:\/\/app\.ehr\.cnpc\.com\.cn:8080\/gateway\/hrdmobile\/mobile\/api\/v1\/salary\/list\/detail(?:\?.*)?$/;
const DATA_BASE_URL = "https://raw.githubusercontent.com/Horck/trlistdemo/main";
const FETCH_TIMEOUT = 5000;

function log(message) {
  console.log(`[cnpc-salary-detail] ${message}`);
}

function doneWithOriginal(reason) {
  if (reason) {
    log(`keep original: ${reason}`);
  }
  $done({});
}

function isSuccessStatus(status) {
  const code = Number(status);
  return code >= 200 && code < 300;
}

function extractPayDateFromObject(value) {
  if (!value || typeof value !== "object") {
    return "";
  }

  if (typeof value.payDate === "string" && value.payDate.trim()) {
    return value.payDate.trim();
  }

  for (const key of Object.keys(value)) {
    const nested = value[key];
    if (nested && typeof nested === "object") {
      const result = extractPayDateFromObject(nested);
      if (result) {
        return result;
      }
    }
  }

  return "";
}

function extractPayDate(body) {
  if (!body || typeof body !== "string") {
    return "";
  }

  try {
    const parsed = JSON.parse(body);
    const fromJson = extractPayDateFromObject(parsed);
    if (fromJson) {
      return fromJson;
    }
  } catch (error) {}

  try {
    const params = new URLSearchParams(body);
    const fromForm = params.get("payDate");
    if (fromForm) {
      return String(fromForm).trim();
    }
  } catch (error) {}

  const jsonMatch = body.match(/"payDate"\s*:\s*"([^"]+)"/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1].trim();
  }

  const formMatch = body.match(/(?:^|&)payDate=([^&]+)/);
  if (formMatch && formMatch[1]) {
    try {
      return decodeURIComponent(formMatch[1]).trim();
    } catch (error) {
      return formMatch[1].trim();
    }
  }

  return "";
}

function fetchRemoteBody(url) {
  return new Promise((resolve, reject) => {
    $httpClient.get(
      {
        url,
        timeout: FETCH_TIMEOUT,
        headers: {
          "Cache-Control": "no-cache",
          Accept: "application/json,text/plain,*/*",
        },
      },
      (error, response, data) => {
        if (error) {
          reject(new Error(`fetch failed: ${error}`));
          return;
        }

        if (!response || !isSuccessStatus(response.status || response.statusCode)) {
          reject(
            new Error(
              `unexpected status: ${
                response ? response.status || response.statusCode : "no response"
              }`
            )
          );
          return;
        }

        if (typeof data !== "string" || !data.trim()) {
          reject(new Error("empty remote body"));
          return;
        }

        resolve(data);
      }
    );
  });
}

async function main() {
  if (typeof $request === "undefined" || typeof $response === "undefined") {
    doneWithOriginal("missing request or response context");
    return;
  }

  const method = String($request.method || "").toUpperCase();
  const requestUrl = $request.url || "";
  const responseStatus = $response.status || $response.statusCode;

  if (!TARGET_URL.test(requestUrl)) {
    doneWithOriginal("url not matched");
    return;
  }

  if (method !== "POST") {
    doneWithOriginal(`method not matched: ${method || "unknown"}`);
    return;
  }

  if (!isSuccessStatus(responseStatus)) {
    doneWithOriginal(`origin status is not 2xx: ${responseStatus}`);
    return;
  }

  const payDate = extractPayDate($request.body || "");
  if (!payDate) {
    doneWithOriginal("payDate not found in request body");
    return;
  }

  const remoteUrl = `${DATA_BASE_URL}/${encodeURIComponent(payDate)}`;
  log(`matched payDate=${payDate}, fetching ${remoteUrl}`);

  try {
    const remoteBody = await fetchRemoteBody(remoteUrl);
    log(`replace success for payDate=${payDate}`);
    $done({ body: remoteBody });
  } catch (error) {
    doneWithOriginal(error.message || String(error));
  }
}

main().catch((error) => {
  doneWithOriginal(error.message || String(error));
});
