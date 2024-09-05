import { Context } from "koishi";
import chrome from "../chrome/_index";

function init(ctx:Context) {
    chrome.browser.pupterBrowserInit()
}

export default init