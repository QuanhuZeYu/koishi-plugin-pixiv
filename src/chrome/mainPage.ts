import Data from "../Data/_index"
import type { Context } from "koishi";
import baseData from "../Data/baseData";

/**
 * 运行页面初始化
 * 如果config指示未登录则不进行初始化
 */
async function pupterBrowserInit(ctx:Context) {  // [[4]]
    const logger = Data.baseData.getLogger()
    if(ctx.config.ensureLogin === false) {
        logger.warn("当前状态为未登录，将不会进行页面初始化")
        return
    }
    const puppeteer = Data.baseData.getPuppeteer()
    let myPage = await puppeteer.browser.newPage()
    await myPage.goto("https://www.pixiv.net/")
    baseData.setCurPage(myPage)
}

async function getRandowPic() {
    const page = baseData.getCurPage()
    // 查找显示为 '推荐作品' 的块
    const elementHandles = await page.evaluate("//*[contains(text(), '推荐作品')]");
}

const browser = {
    pupterBrowserInit,
}

export default browser