const RAW_BASE = "https://raw.githubusercontent.com/Horck/trlistdemo/main/";

function doneWithOriginal() {
  $done({ body: $response.body });
}

function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

function getPayDate() {
  const body = ($request && $request.body) ? $request.body : "";
  if (!body) return null;

  // 先按 JSON 解析
  const json = safeParseJSON(body);
  if (json && json.payDate) {
    return String(json.payDate);
  }

  // 再兼容 x-www-form-urlencoded
  try {
    const match = body.match(/(?:^|&)payDate=([^&]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  } catch (e) {}

  return null;
}

const payDate = getPayDate();

if (!payDate) {
  doneWithOriginal();
} else {
  const url = `${RAW_BASE}${payDate}`;

  $httpClient.get(
    {
      url,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*"
      }
    },
    (err, resp, data) => {
      // 请求不通 / 无内容 / 状态码异常 => 不替换
      if (err || !resp || resp.status !== 200 || !data) {
        doneWithOriginal();
        return;
      }

      // 可选：校验一下返回是不是 JSON，避免替换成错误页
      const parsed = safeParseJSON(data);
      if (!parsed) {
        doneWithOriginal();
        return;
      }

      $done({
        body: data
      });
    }
  );
}
