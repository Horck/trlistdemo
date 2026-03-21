const body = $response.body;
console.log("CNPC Salary 脚本已触发！原始数据：" + body);

const url = "https://raw.githubusercontent.com/Horck/trlistdemo/main/20260218";

$httpClient.get(url, function (error, response, data) {
    if (error || !response || response.status !== 200 || !data) {
        console.log("CNPC Salary 获取替换数据失败");
        $done({});
        return;
    }

    console.log("CNPC Salary 数据替换成功！新数据：" + data);
    $done({ body: data });
});
