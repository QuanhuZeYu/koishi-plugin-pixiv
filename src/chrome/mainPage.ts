import axios from "axios";
import fs from 'fs'
import type * as p_ from 'puppeteer-core'

import Data from "../Data/_index";
import type { Context } from "koishi";
import baseData from "../Data/baseData";

/**
 * 运行页面初始化
 * 如果config指示未登录则不进行初始化
 */
async function pupterBrowserInit(ctx: Context) {
	// [[4]]
	const logger = Data.baseData.getLogger();
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

async function getRandomTJPic() {
    const logger = Data.baseData.getLogger();
    const page = baseData.getCurPage();

    try {
        // Step 1: 查找显示为 '推荐作品' 的块
        logger.info("正在查找推荐作品");
        await page.bringToFront()  // 设置为活动页
        // 浏览器 JS 代码
        // 查找推荐块逻辑+推荐块中放作品的图片元素 -> 返回图片列表url
        const imgSelector = await page.evaluate(() => {
            // 寻找推荐作品块
            const sections = Array.from(document.querySelectorAll("section"));
            const tuijianSections = sections.filter((section) =>
                section.textContent.includes("推荐作品")
            );
            // 合法性检查
            if (tuijianSections?.length < 1) {
                return [];
            }
            // 寻找所有推荐块下所有li元素
            const listItems = Array.from(tuijianSections[0].querySelectorAll("li"));
            const imgSrcs = [];
            // 从每个li下寻找找到的第一个img
            listItems.forEach((li) => {
                const img = li.querySelector("img");
                if (img) {
                    imgSrcs.push(img.src);
                }
            });
            // 合法性检查
            if(imgSrcs.length < 3) {
                logger.info(`img 块总数小于3，可能不在<img>中，尝试<a>`)
            }
            // 寻找每个li下第一个a元素
            listItems.forEach((li) => {
                const a = li.querySelector("a");
                if (a) {
                    imgSrcs.push(a.href);
                }
            });

            return imgSrcs;
        });
        // 合法性检查
        if (!imgSelector || imgSelector.length === 0) {
            logger.warn('未找到 "推荐作品" 块或其中的图片！');
            await page.goto("https://www.pixiv.net/");
            return null;
        }
        // 随机选择
        const randomIndex = getRandomInt(0, imgSelector.length - 1);
        const imgUrl = imgSelector[randomIndex];  // 选择到的图片链接
        logger.info(`随机选择的第${randomIndex}张图片: ${imgUrl}`);

        // Step 2: 查找并点击图片
        const imageHandle = await page.$(`img[src="${imgUrl}"]`)
        if (imageHandle) {
            logger.info("准备点击图片元素");
            await clickElementSafe(page,imageHandle)

            // Step 3: 等待图片请求响应
            const urlPrefix = "https://www.pixiv.net/ajax/user/";
            await waitUrlPrefix(page, urlPrefix)
            logger.info("请求响应成功，开始查找大图 URL");
            // 获取原始图像 url 浏览器 JS 代码
            const bigPicURL = await page.evaluate(() => {
                // 查找 main 块 -> 寻找 main 下的 img 元素
                const main = document.querySelector("main");
                if (!main) {
                    console.warn("未找到 <main> 元素");
                    return null;
                }

                const img = main.querySelector("img");
                if (!img) {
                    console.warn("未找到 <img> 元素");
                    return null;
                }

                return img.src;
            });

            if (bigPicURL) {
                logger.info(`大图 URL 获取成功: ${bigPicURL}`);
                // Step 4: 下载图片
                const picBuffer = await downloadPixivImg(bigPicURL)
                return picBuffer
            } else {
                logger.warn("未找到大图 URL");
                return null;
            }
        } else {
            logger.warn("无法找到要点击的图片元素");
            await page.goto("https://www.pixiv.net/");
            return null;
        }
    } catch (error) {
        logger.error(`发生错误: ${error}`);
        throw error;
    } finally {
        logger.info("正在返回主页");
        await page.goto("https://www.pixiv.net/");
        logger.info("已返回主页");
        Data.baseData.setCurPage(page)
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
    // Step 3: 等待图片请求响应
    const logger = Data.baseData.getLogger()
    logger.info(`等待请求响应，匹配 URL 前缀：${url}`);
    await page.waitForResponse((response) => {
        const urlMatches = response.url().startsWith(url);
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
