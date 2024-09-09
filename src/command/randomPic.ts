import { Context, Schema, Session } from "koishi";
import {} from "@satorijs/element"

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
        logger.info(`图片获取成功: 数量${picBuffers?.length}`)
        const message = []
        for(const  pic of picBuffers) {
            ss.send(h.image(pic, 'image/png'))
        }
    } catch (e) {
        logger.warn(`获取失败，失败信息: ${e}`)
        ss.send("获取失败，请联系管理员查看控制台")
    }
}

export default randomTJPic