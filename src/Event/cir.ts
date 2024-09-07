import { Context } from "koishi";
import Data from "../Data/_index";

/**
 * 可被反复触发的事件 服务修改时->尝试获取新的puppeteer
 * @param ctx 
 */
async function cycle(ctx:Context) {
    const logger = Data.baseData.getLogger()
    logger.info("正在尝试获取新的puppeteer")
    if(ctx?.puppeteer) {
        Data.baseData.initPuppeteer(ctx)
    } else {
        logger.warn('未找到puppeteer服务!')
        throw 'puppeteer服务获取失败'
    }  // 获取puppeteer服务逻辑
    
}

export default cycle