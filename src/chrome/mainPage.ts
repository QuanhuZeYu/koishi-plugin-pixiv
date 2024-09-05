import type Puppeteer from "@seidko/koishi-plugin-puppeteer"
import Data from "../Data/_index"

async function pupterBrowserPreInit() {  // [[4]]
    const puppeteer = Data.baseData.getPuppeteer()
    moidfiyPuppeteerConfig(puppeteer)  // [[5]]
}

async function pupterBrowserInit() {
    const browser_i = await Data.baseData.getPuppeteer().browser as any
    Data.baseData.setGlobalBrowser(browser_i)
    // test
    const logger = Data.baseData.getLogger()
    const p = Data.baseData.getPuppeteer()
    const browser = Data.baseData.getGlobalBrowser()
    const testPage = await browser.newPage()
    const res = await testPage.goto("https://pixiv.net/")
}

async function moidfiyPuppeteerConfig(p:Puppeteer) {  // [[5]]
    const logger = Data.baseData.getLogger()
    const browser = p.browser
    let config = await p.config
    logger.info("puppeteer config:",config)
}

const browser = {
    pupterBrowserPreInit,pupterBrowserInit
}

export default browser