import { } from "koishi-plugin-puppeteer"
import * as p_ from 'puppeteer-core'
import Data from "../Data/_index"

async function waitNav(page:p_.Page) {
    await page.waitForNavigation({timeout: Data.baseData.getCTX().config.等待NAV超时时间})
}

const waitFunc = {
    waitNav
}

export default waitFunc