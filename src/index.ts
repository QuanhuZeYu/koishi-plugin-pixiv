import { Context, Schema } from "koishi";
import {  } from "koishi-plugin-puppeteer";
import Puppeteer from "koishi-plugin-puppeteer";
import Event from "./Event/_index";

export const name = "pixiv";
export const usage = "\
第一次使用本插件时请1.设置--user-data-dir参数关闭无头模式浏览器，登录完成后可打开无头模式"
export const inject = {
	required: ["puppeteer"],
};

export interface Config { }

export const Config: Schema<Config> = Schema.object({});

export function apply(ctx: Context) {
	Event.preInit(ctx)  // 线性流标记符号 [[1]]
	// Event.init(ctx)
}
