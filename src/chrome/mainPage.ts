import axios from "axios"

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
    // 启用请求拦截功能
    await myPage.setRequestInterception(true)
    myPage.on('request', async (request) => {
        const domain = new URL(request.url()).hostname  // 获取url的域名
        if(domain === 'www.pixiv.net') {
            let header = Data.baseData.getPixivNetHeader() || {}
            header = {
                ...header,
                ...request.headers(),
                accept: '*/*',
            }
        } 
        else if (domain === 'i.pximg.net') {
            let header = Data.baseData.getIpximgNetHeader() || {}
            header = {
                ...header,
                ...request.headers(),
                accept: '*/*',
            }
        }
        request.continue()
    })
    // 拦截逻辑定义完成
    baseData.setCurPage(myPage as any)
}

async function getRandomTJPic() {
    const logger = Data.baseData.getLogger()
    const page = baseData.getCurPage()
    // 查找显示为 '推荐作品' 的块
    logger.info("正在查找推荐作品")
    // 在单个 `page.evaluate` 调用中完成所有操作
    const imgSelector = await page.evaluate(() => {
        // 查找页面中所有的 <section> 元素
        const sections = Array.from(document.querySelectorAll('section'));

        // 过滤出包含 "推荐作品" 文本的 <section> 元素
        const tuijianSections = sections.filter(section => section.textContent.includes('推荐作品'));

        // 确保至少有一个符合条件的块
        if (tuijianSections.length === 0) {
            return []; // 如果没有找到则返回空数组
        }

        // 查找符合条件的块中的所有 <img> 元素
        const imgElements = Array.from(tuijianSections[0].querySelectorAll('img'));

        // 返回这些图片元素的 src 属性
        const srcs = imgElements.map(img => img.src)
        return srcs
    });
    // 确保找到了图片
    if (!imgSelector || imgSelector.length === 0) {
        console.error('未找到 "推荐作品" 块或其中的图片！');
    } else {
        // Step 2: 在 Node.js 中随机选择一个图片并获取 ElementHandle
        const randomIndex = getRandomInt(0, imgSelector.length - 1);
        const imgUrl = imgSelector[randomIndex];
        
        logger.info(`随机选择的第${randomIndex}张图片: ${imgUrl}`);

        // Step 3: 重新找到元素并点击
        const imageHandle = await page.$(`img[src="${imgUrl}"]`);
        if (imageHandle) {
            await imageHandle.click(); // 点击找到的图片元素
            // 等待页面导航到新的页面
            try{
                await page.waitForNavigation({ waitUntil: 'networkidle0' }); // 等待页面完全加载
            }catch(e){
                logger.warn(e)
                throw e
            } finally {
                await page.goto("https://www.pixiv.net/")
                logger.info("已返回主页")
            }
            const bigPicURL = await page.evaluate(()=>{
                const main = document.querySelector('main');
                const img = main.querySelector('img');
                return img.src
            })
            const bigPicBuffer = await axios.get(bigPicURL, { responseType: 'arraybuffer',headers:Data.baseData.getIpximgNetHeader() })
            return bigPicBuffer
        } else {
            logger.warn('无法找到要点击的图片元素');
        }
    }
    // 结束查找返回主页
    await page.goto("https://www.pixiv.net/")
    return
}

const browser = {
    pupterBrowserInit,getRandomTJPic
}

export default browser

// region 工具函数
function getRandomInt(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}