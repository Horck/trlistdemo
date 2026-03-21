function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

function getPayDate() {
  const body = $request.body || "";
  if (!body) return null;

  const json = safeParseJSON(body);
  if (json && json.payDate) return String(json.payDate);

  const match = body.match(/(?:^|&)payDate=([^&]+)/);
  if (match && match[1]) return decodeURIComponent(match[1]);

  return null;
}

const payDate = getPayDate();
const headers = $request.headers || {};

if (payDate) {
  headers["x-sr-paydate"] = payDate;
}

$done({ headers });
