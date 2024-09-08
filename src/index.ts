import { Context, Schema } from "koishi";
import Event from "./Event/_index";
import { } from 'koishi-plugin-puppeteer'

import commands from "./command/_index";

export const name = "pixiv";
export const usage = "\
第一次使用本插件时请在puppeteer服务中设置args: `--user-data-dir=/path/to/custom-profile-dir` 否则无法记录登录信息\n\n\
且强烈推荐关闭无头模式，因为插件可能会打开很多页面，如果你开了无头模式可能会不知不觉吃掉很多内存和性能，关掉无头随时查看浏览器\n\n\
使用 `随机涩图` 即可随机获取一张p站推荐作品中的图片~~~"
export const inject = {
	required: ["puppeteer"],
};

export interface Config { 
	// excutePath: string,
	ensureLogin: boolean,
	等待NAV超时时间: number,
	HTMLSelector: object
}

export const Config: Schema<Config> = Schema.object({
	// excutePath: Schema.string().description("puppeteer的chrome路径或者chromium路径").required(),
	ensureLogin: Schema.boolean().description("请在确认登录过pixiv后再打开此开关!").default(false),
	等待NAV超时时间: Schema.number().description("等待NAV超时时间，单位ms").default(15000),
	HTMLSelector: Schema.object({
		推荐作品URLs选择器: Schema.string().description("如果你不知道这是什么请不要动它！！！推荐页面的图片选择器，编辑一段可以在浏览器运行的代码段，最后返回目标图片urls数组").default("const sections = Array.from(document.querySelectorAll('section'));const tuijianSections = sections.filter((section) =>section.textContent.includes('推荐作品'));const listItems = Array.from(tuijianSections[0].querySelectorAll('li'));const imgEs = [];for(const li of listItems) {const img = li.querySelector('img');if (img && img?.src) {if (img.src.includes('i.pximg.net')) {imgEs.push(img.src);}}} imgEs;"),
		主图像URLs选择器: Schema.string().description("如果你不知道这是什么请不要动它！！！这个选择器是选择点击进入作品后寻找大图的，最后返回原图像的URLs数组").default("const urls = []; Array.from(document.querySelector('main section figure').querySelectorAll('img')).forEach(img => urls.push(img.src)); urls;")
	})
});

export function apply(ctx: Context) {
	Event.preInit(ctx)
	Event.init(ctx)
	Event.cycle(ctx)

	ctx.command('随机涩图 [message:text]')
		.usage('从p站的推荐作品中随机获取一张图片')
		.action(async(av,ms)=>{
			await commands.randomTJPic(av,ms)
		})
}
