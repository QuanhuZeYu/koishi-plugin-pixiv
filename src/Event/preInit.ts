import { Context } from "koishi";
import Data from "../Data/_index";
import chrome from "../chrome/_index";

async function preInit(ctx:Context) {  // [[2]]
    Data.baseData.inintAllBaseData(ctx)  // 初始化全部基础资源 [[3]]
    chrome.browser.pupterBrowserPreInit()  // [[4]]
}

export default preInit