import { Context } from "koishi";
import Data from "../Data/_index";
import { started } from "./preInit";

/**
 * 可被反复触发的事件 服务修改时->尝试获取新的puppeteer
 * @param ctx 
 */
async function cycle(ctx:Context) {
    if(!started) {return}  // 第一次启动时不需要
    const logger = ctx.logger
    logger.info("正在尝试获取新的puppeteer")
    Data.baseData.initPuppeteer(ctx)
    logger.info(`正在寻找合适的页面`)
    await selectSuitablePage()
    logger.info('重新获取logger')
    Data.baseData.setLogger(logger)
}

export default cycle

/**
 * 遍历当前浏览器页面，寻找合适的页面作为当前页面
 * 设置全局变量: setCurPage
 */
async function selectSuitablePage() {
    const logger = Data.baseData.getLogger()
    const pages = await Data.baseData.getPuppeteer().browser.pages()
    let myPage
    for(const page of pages) {
        if(page.url() === 'about:blank' || page.url().includes('pixiv.net')) {
            myPage = page
        }
    }
    if(myPage === undefined) {
        myPage = await Data.baseData.getPuppeteer().browser.newPage()
    }
    logger.info(`page设置完毕: ${myPage.url()}`)
    Data.baseData.setCurPage(myPage)
}