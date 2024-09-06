import { Context } from "koishi";
import chrome from "../chrome/_index";

function init(ctx:Context) {
    chrome.browser.pupterBrowserInit(ctx)  // [[4]]
}

export default init