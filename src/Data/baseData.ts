// 全局资源

import type { Context } from "koishi"
import type Puppeteer from "@seidko/koishi-plugin-puppeteer"
import type * as _pOrigan from "puppeteer"
import path from "path"
import { name } from ".."

let logger:any
let koishiBaseDir:string
let myPluginDataDir:string
let puppeteer:Puppeteer
let globalBrowser:_pOrigan.Browser

// region 预初始化资源
function inintAllBaseData(ctx:Context) {  // [[4]]
    setLogger(ctx.logger)
    logger.info("正在初始化资源...")
    setKoishiBaseDir(ctx.baseDir)  // 获取koishi的Data目录
    logger.info(`获取Koishi插件的Data目录: ${koishiBaseDir}`)
    initMyPluginDataDir()  // 初始化插件的Data目录
    logger.info(`获取插件的Data目录: ${myPluginDataDir}`)
    setPuppeteer(ctx)  // 获取插件服务Puppeteer
    
    logger.info("资源初始化完毕")
}

function setLogger(_:any){
    logger = _
}

function getLogger() {
    return logger
}

function getKoishiBaseDir() {
    return koishiBaseDir
}

function setKoishiBaseDir(dir:string) {
    koishiBaseDir = dir
}

function getMyPluginDataDir() {
    return myPluginDataDir
}

function initMyPluginDataDir() {
    const baseDir = getKoishiBaseDir()
    myPluginDataDir = path.resolve(baseDir, "@QuanhuZeYu/pixiv")
}

function getPuppeteer() {
    return puppeteer
}

function setPuppeteer(ctx: Context) {
    puppeteer = ctx.puppeteer as any
}

// region 初始化资源
function setGlobalBrowser(browser: _pOrigan.Browser) {
    globalBrowser = browser
}

function getGlobalBrowser() {
    return globalBrowser
}


const baseData = {
    inintAllBaseData,
    getLogger,
    setLogger,
    getKoishiBaseDir,
    setKoishiBaseDir,
    getMyPluginDataDir,
    initMyPluginDataDir,
    getPuppeteer,
    setPuppeteer,

    setGlobalBrowser,
    getGlobalBrowser
}

export default baseData