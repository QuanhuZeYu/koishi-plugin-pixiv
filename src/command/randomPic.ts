import { Argv, h } from "koishi";
import Data from "../Data/_index";
import chrome from "../chrome/_index";

async function randomTJPic(av:Argv,ms:string) {
    const logger = Data.baseData.getLogger()
    const ss = av.session
    logger.info("正在随机获取图片")
    try {
        const picBuffer = await chrome.browser.getRandomTJPic()
        ss.send(h.image('image/png', picBuffer))
    } catch (e) {
        logger.warn(`获取失败，失败信息: ${e}`)
        ss.send("获取失败，请联系管理员查看控制台")
    }
}

export default randomTJPic