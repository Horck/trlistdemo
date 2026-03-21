const url = "https://raw.githubusercontent.com/Horck/trlistdemo/main/20260218";

$httpClient.get(url, function (error, response, data) {
    if (error || !response || response.status !== 200 || !data) {
        console.log("替换失败，保留原响应");
        $done({});
        return;
    }

    console.log("替换成功");
    $done({
        body: data,
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    });
});
