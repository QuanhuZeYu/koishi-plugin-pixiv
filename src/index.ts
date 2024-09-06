import { Context, Schema } from "koishi";
import Event from "./Event/_index";
import { } from 'koishi-plugin-puppeteer'

export const name = "pixiv";
export const usage = "\
第一次使用本插件时请在puppeteer服务中设置args: `--user-data-dir=/path/to/custom-profile-dir` 否则无法记录登录信息\n\n\
且强烈推荐关闭无头模式，因为插件可能会打开很多页面，如果你开了无头模式可能会不知不觉吃掉很多内存和性能，关掉无头随时查看浏览器"
export const inject = {
	required: ["puppeteer"],
};

export interface Config { 
	// excutePath: string,
	ensureLogin: boolean
}

export const Config: Schema<Config> = Schema.object({
	// excutePath: Schema.string().description("puppeteer的chrome路径或者chromium路径").required(),
	ensureLogin: Schema.boolean().description("请在确认登录过pixiv后再打开此开关!").default(false)
});

export function apply(ctx: Context) {
	Event.preInit(ctx)
	Event.init(ctx)

	ctx.command('随机涩图 [message:text]')
		.usage('从p站的推荐作品中随机获取一张图片')
		
}
