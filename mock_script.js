const body = $request.body;

try {
    // 1. 解析 POST 请求体获取动态参数
    const reqData = JSON.parse(body || "{}");
    const dynamicDate = reqData.payDate;

    if (dynamicDate) {
        // 2. 根据动态参数拼接外部 Raw URL
        const mockDataUrl = `https://raw.githubusercontent.com/Horck/trlistdemo/main/${dynamicDate}`;

        // 3. 发起请求获取外部数据
        $httpClient.get(mockDataUrl, function (error, response, data) {
            // 4. 请求失败则不替换
            if (error || !response || response.status !== 200 || !data) {
                console.log(`获取外部数据失败或文件不存在: ${dynamicDate}`);
                $done({});
            } else {
                console.log(`成功获取数据并替换响应: ${dynamicDate}`);
                $done({
                    body: data,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    }
                });
            }
        });
    } else {
        // 请求体没有 payDate，不替换
        $done({});
    }
} catch (e) {
    console.log("解析请求体异常: " + e.message);
    $done({});
}
