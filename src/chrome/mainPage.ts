import axios from "axios";
import fs from 'fs'
import type * as p_ from 'puppeteer-core'

import Data from "../Data/_index";
import { sleep, type Context } from "koishi";
import baseData from "../Data/baseData";
import { resolve } from "path";
import chrome from "./_index";

/**
 * 运行页面初始化
 * 如果config指示未登录则不进行初始化
 */
async function pupterBrowserInit(ctx: Context) {
	// [[4]]
	const logger = ctx.logger
	if (ctx.config.ensureLogin === false) {
		logger.warn("当前状态为未登录，将不会进行页面初始化");
		return;
	}
	const puppeteer = Data.baseData.getPuppeteer();
    const pages = await puppeteer.browser.pages();
    let myPage:p_.Page
    for(const page of pages) {
        if (page.url() === 'about:blank' || page.url().includes('pixiv.net')) {
            myPage = page as any
            break
        }
    }
    if(!myPage) {
        myPage = await puppeteer.browser.newPage() as any
        await myPage.goto('https://www.pixiv.net/')
    }
    await myPage.bringToFront()  // 设置为活动页
	await myPage.goto("https://www.pixiv.net/");
	// 启用请求拦截功能
	await myPage.setRequestInterception(true);
	myPage.on("request", async (request) => {
		const domain = new URL(request.url()).hostname; // 获取url的域名
		if (domain === "www.pixiv.net") {
			let header = Data.baseData.getPixivNetHeader() || {};
			header = {
				...header,
				...request.headers(),
			};
			Data.baseData.setPixivNetHeader(header);
		} else if (domain === "i.pximg.net") {
			let header = Data.baseData.getIpximgNetHeader() || {};
			header = {
				...header,
				...request.headers(),
			};
			Data.baseData.setIpximgNetHeader(header);
		}
		request.continue();
	});
	// 拦截逻辑定义完成
	baseData.setCurPage(myPage as any);
}

async function getRandomTJPic(): Promise<Buffer[]> {
    const logger = Data.baseData.getLogger();
    const page = baseData.getCurPage();

    try {
        // Step 1: 查找显示为 '推荐作品' 的块
        logger.info("正在查找推荐作品");
        await page.bringToFront();  // 设置为活动页

        // 浏览器 JS 代码
        // 查找推荐块逻辑+推荐块中放作品的图片元素 -> 返回图片列表url
        const imgSelector: string[] = await page.evaluate(Data.baseData.getCTX().config.HTMLSelector.推荐作品URLs选择器);
        
        // 合法性检查
        if (!imgSelector || imgSelector.length === 0) {
            logger.warn('未找到 "推荐作品" 块或其中的图片！');
            return [];  // 返回一个空的 Buffer 数组而不是 null
        }

        // 随机选择
        const randomIndex = getRandomInt(0, imgSelector.length - 1);
        const imgURL: string = imgSelector[randomIndex];  // 选择到的图片链接
        logger.info(`随机选择的第${randomIndex}张图片: ${imgURL}`);

        // 寻找对应 Element 并点击
        const imgElement = await page.$(`img[src="${imgURL}"]`);
        if (!imgElement) {
            logger.warn("未找到对应的图片元素");
            return [];
        }
        
        logger.info("等待网页跳转完成，并且等待选择器找到");
        try {
            await chrome.waitFunc.waitNav(page)
            logger.info(`等待网页跳转完成: ${Data.baseData.getCTX().config.等待NAV超时时间}ms`);
            await page.waitForSelector('main section figure img');
            logger.info("选择器找到，开始解析图片URL");
        } catch (error) {
            logger.warn(`等待超时，尝试跳过等待继续执行逻辑: ${error}`);
        }
        try {await imgElement.click();} catch (e) {logger.warn('展开全部时发生错误:',e)} finally {logger.info('展开全部逻辑已执行完毕')}
        logger.info("等待图片加载已结束");

        // 从浏览器中获取大图URL 先查看有没有查看全部div，有则先点击它
        await page.evaluate(Data.baseData.getCTX().config.HTMLSelector.主图像查看全部按钮选择点击)
        const bigPicURLs: string[] = await page.evaluate(Data.baseData.getCTX().config.HTMLSelector.主图像URLs选择器);
        logger.info(`从浏览器中获取到的图片链接: ${bigPicURLs}`);

        const pics: Buffer[] = [];
        for (const url of bigPicURLs) {
            try {
                const pic = await downloadPixivImg(url);
                pics.push(pic);
            } catch (error) {
                logger.warn(`下载图片失败: ${url}, 错误: ${error}`);
            }
        }

        return pics;
    } catch (error) {
        logger.error(`发生错误: ${error}`);
        return [];  // 在 catch 块中明确返回空数组
    } finally {
        logger.info("正在返回主页");
        await page.goto("https://www.pixiv.net/");
        Data.baseData.setCurPage(page);
    }
}

const browser = {
	pupterBrowserInit,
	getRandomTJPic,
};

export default browser;

// region 工具函数
function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 传入需要等待的url前缀，当有该前缀的url返回了status === 200的response，则返回
 * @param url 
 */
async function waitUrlPrefix(page:p_.Page,url:string) {
    await page.waitForResponse((response) => {
        const urlMatches = response.url().startsWith(url);
        const statusMatches = response.status() === 200;
        // logger.info(`检测到响应: ${response.url()}, 状态码: ${response.status()}`);
        return urlMatches && statusMatches;
    });
}

async function waitUrlEndWith(page:p_.Page,str:string) {
    await page.waitForResponse((response) => {
        const urlMatches = response.url().endsWith(str);
        const statusMatches = response.status() === 200;
        // logger.info(`检测到响应: ${response.url()}, 状态码: ${response.status()}`);
        return urlMatches && statusMatches;
    });
}

async function waitUrlInclude(page:p_.Page, str:string) {
    await page.waitForResponse((response) => {
        const urlMatches = response.url().includes(str);
        const statusMatches = response.status() === 200;
        // logger.info(`检测到响应: ${response.url()}, 状态码: ${response.status()}`);
        return urlMatches && statusMatches;
   });
}

async function downloadPixivImg(picUrl:string) {
    const logger = Data.baseData.getLogger()
    try {
        const bigPicBuffer = await axios.get(picUrl, {
            responseType: "arraybuffer",
            headers: {
                ...Data.baseData.getIpximgNetHeader(),
                accept: "*/*",
                referer: 'https://www.pixiv.net/',
                origin: 'https://www.pixiv.net',
            },
        });
        logger.info("图片下载成功");
        return Buffer.from(bigPicBuffer.data)
    } catch (axiosError) {
        logger.error(`下载图片时发生错误: `);
        logger.error(axiosError)
        throw axiosError;
    }
}

async function clickElementSafe(page:p_.Page,e:p_.ElementHandle) {
    await page.bringToFront()
    await e.focus()
    await e.click()
}

async function onCtxFetch(page: p_.Page, url: string) {
    const picUrl = url;
    
    // 2. 使用 fetch 在页面上下文中获取图像数据
    const imageBuffer = await page.evaluate(async (picUrl) => {
      const response = await fetch(picUrl);
      if (!response.ok) {
        throw new Error('无法请求图像');
      }
      const arrayBuffer = await response.arrayBuffer();
      return Array.from(new Uint8Array(arrayBuffer)); // 转换成可以序列化的数组
    }, picUrl); // 将 picUrl 作为参数传入
    
    // 3. 将 Uint8Array 转换为 Buffer
    return Buffer.from(imageBuffer);
}

async function freshPixiv(page: p_.Page) {
    if(!page.url().includes('pixiv.net')) {
        page.goto('https://www.pixiv.net/')
    }
    await page.bringToFront()
    await page.reload()
    sleep(1000)
}

//#endregion