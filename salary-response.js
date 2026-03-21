function doneKeepOriginal() {
  $done({});
}

function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

const headers = $request.headers || {};
const payDate =
  headers["x-sr-paydate"] ||
  headers["X-SR-PAYDATE"] ||
  headers["X-Sr-Paydate"];

if (!payDate) {
  doneKeepOriginal();
} else {
  const url = `https://raw.githubusercontent.com/Horck/trlistdemo/main/${payDate}`;

  $httpClient.get(
    {
      url: url,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*"
      }
    },
    function (err, resp, data) {
      if (err || !resp || resp.status !== 200 || !data) {
        doneKeepOriginal();
        return;
      }

      // 防止拿到的不是 JSON
      const parsed = safeParseJSON(data);
      if (!parsed) {
        doneKeepOriginal();
        return;
      }

      $done({
        body: data,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      });
    }
  );
}
