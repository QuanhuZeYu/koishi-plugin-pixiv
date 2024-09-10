import { Context, Schema, Session } from "koishi";
import {} from "@satorijs/element"

import { Argv, h } from "koishi";
import Data from "../Data/_index";
import chrome from "../chrome/_index";
import fs from 'fs'

async function randomTJPic(av:Argv,ms:string) {
    let message
    const logger = Data.baseData.getLogger()
    const ss = av.session
    logger.info("正在随机获取图片")
    message = <message>
        <quote id={ss.messageId}/>
        {'你在此地不要走动'}
    </message>;
    await ss.send(message)
    message = []
    try {
        const [picBuffers, artInfo] = await chrome.browser.getRandomTJPic()
        logger.info(`图片获取成功: 数量${picBuffers?.length}`)
        for(const  pic of picBuffers) {
            // message.push(h.image(pic, 'image/png'))
            message.push(<img src={'data:image/png;base64,' + pic.toString('base64')}/>)
        }
        message.push(artInfo)
        message.join('')
        message = 
        <message>
            {message}
        </message>
        await ss.send(message)
    } catch (e) {
        logger.warn(`获取失败，失败信息: ${e}`)
        ss.send("获取失败，请联系管理员查看控制台")
    }
}

export default randomTJPic