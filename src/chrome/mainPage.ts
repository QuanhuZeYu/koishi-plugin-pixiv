import axios from "axios";

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
	let myPage = await puppeteer.browser.newPage();
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
				accept: "*/*",
				referer: 'https://www.pixiv.net/',
                origin: 'https://www.pixiv.net'
			};
			Data.baseData.setPixivNetHeader(header);
		} else if (domain === "i.pximg.net") {
			let header = Data.baseData.getIpximgNetHeader() || {};
			header = {
				...header,
				...request.headers(),
				accept: "*/*",
				referer: 'https://www.pixiv.net/',
                origin: 'https://www.pixiv.net'
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

    logger.info("正在随机获取图片");

    try {
        // Step 1: 查找显示为 '推荐作品' 的块
        logger.info("正在查找推荐作品");

        const imgSelector = await page.evaluate(() => {
            const sections = Array.from(document.querySelectorAll("section"));
            const tuijianSections = sections.filter((section) =>
                section.textContent.includes("推荐作品")
            );

            if (tuijianSections.length === 0) {
                return [];
            }

            const listItems = Array.from(tuijianSections[0].querySelectorAll("li"));
            const imgSrcs = [];

            listItems.forEach((li) => {
                const img = li.querySelector("img");
                if (img) {
                    imgSrcs.push(img.src);
                }
            });

            return imgSrcs;
        });

        if (!imgSelector || imgSelector.length === 0) {
            logger.warn('未找到 "推荐作品" 块或其中的图片！');
            await page.goto("https://www.pixiv.net/");
            return null;
        }

        const randomIndex = getRandomInt(0, imgSelector.length - 1);
        const imgUrl = imgSelector[randomIndex];

        logger.info(`随机选择的第${randomIndex}张图片: ${imgUrl}`);

        // Step 2: 查找并点击图片
        const imageHandle = await page.$(`img[src="${imgUrl}"]`);
        if (imageHandle) {
            logger.info("准备点击图片元素");
            await imageHandle.click();

            // Step 3: 等待图片请求响应
            const urlPrefix = "https://i.pximg.net/c/";
            logger.info(`等待请求响应，匹配 URL 前缀：${urlPrefix}`);
            await page.waitForResponse((response) => {
                const urlMatches = response.url().startsWith(urlPrefix);
                const statusMatches = response.status() === 200;
                // logger.info(`检测到响应: ${response.url()}, 状态码: ${response.status()}`);
                return urlMatches && statusMatches;
            });

            logger.info("请求响应成功，开始查找大图 URL");

            const bigPicURL = await page.evaluate(() => {
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
                try {
                    const bigPicBuffer = await axios.get(bigPicURL, {
                        responseType: "arraybuffer",
                        headers: {
							...Data.baseData.getPixivNetHeader(),
							Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
						},
                    });
                    logger.info("图片下载成功");
                    return bigPicBuffer;
                } catch (axiosError) {
                    logger.error(`下载图片时发生错误: ${axiosError}`);
                    throw axiosError;
                }
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
