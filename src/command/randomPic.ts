import { Argv, h } from "koishi";
import Data from "../Data/_index";
import chrome from "../chrome/_index";
import fs from 'fs'

async function randomTJPic(av:Argv,ms:string) {
    const logger = Data.baseData.getLogger()
    const ss = av.session
    logger.info("正在随机获取图片")
    try {
        const picBuffers = await chrome.browser.getRandomTJPic()
        for(const [index, pic] of picBuffers.entries()) {
            await ss.send(h.image(pic, 'image/png'))
            fs.writeFileSync(`${Data.baseData.getMyPluginDataDir()}${index}.png`, pic)
        }
    } catch (e) {
        logger.warn(`获取失败，失败信息: ${e}`)
        ss.send("获取失败，请联系管理员查看控制台")
    }
}

export default randomTJPic