/**
 * Shadowrocket 脚本 - 拦截薪资详情并动态替换
 * 逻辑：匹配指定 payDate 时，尝试从 GitHub 获取 Mock 数据，失败则返回原数据。
 */

const requestUrl = $request.url;
const requestBody = $request.body;

// 1. 检查是否为目标 POST 请求
if (requestUrl.includes("salary/list/detail") && requestBody) {
    try {
        let bodyObj = JSON.parse(requestBody);
        let payDate = bodyObj.payDate; // 获取动态日期，如 20260218

        if (payDate) {
            console.log("检测到目标 payDate: " + payDate);
            
            // 构建 GitHub Raw URL
            const mockUrl = `https://raw.githubusercontent.com/Horck/trlistdemo/main/${payDate}`;

            // 发起异步请求获取 GitHub 数据
            $httpClient.get(mockUrl, function(error, response, data) {
                if (!error && response.status === 200) {
                    console.log(`成功从 GitHub 匹配到数据: ${payDate}`);
                    // 替换返回结果
                    $done({
                        body: data,
                        headers: { "Content-Type": "application/json;charset=UTF-8" }
                    });
                } else {
                    console.log(`GitHub 无匹配数据或请求失败 (状态码: ${response ? response.status : 'N/A'})，跳过替换`);
                    $done({}); // 走原始请求
                }
            });
        } else {
            $done({}); // 无 payDate 字段，不处理
        }
    } catch (e) {
        console.log("解析请求体失败: " + e);
        $done({});
    }
} else {
    $done({}); // 非目标接口，直接放行
}
