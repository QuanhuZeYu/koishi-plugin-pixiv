import { Context, Schema } from 'koishi';

export const name = 'qz-dev';

export const inject = [
    'puppeteer',
    'database'
];

export const Config = Schema.object({
    test: Schema.string(),
})


import PixivPuppeteer from "./PixivPuppeteer.js";
import 指令管理器 from "./指令管理器.js"
import 今日推荐存储 from "./今日推荐存储.js"
/**
 * @type {{
 *      pixiv: PixivPuppeteer,
 *      commandManager: 指令管理器,
 *      A推荐存储: 今日推荐存储,
 *      logger: Object
 * }}
 */
export const Fields = {
    pixiv: undefined,
    commandManager: undefined,
    A推荐存储: undefined,
    logger: undefined
}

export function apply(ctx) {
    Fields.logger = ctx.logger(name);
    Fields.pixiv = new PixivPuppeteer(ctx);
    Fields.commandManager = new 指令管理器(ctx);
    Fields.A推荐存储 = new 今日推荐存储(ctx);
}