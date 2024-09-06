// 全局资源

import type { Context, Logger } from "koishi"
import type * as cjl  from "@cordisjs/logger"
import path from "path"
import { Config } from ".."
import p__ from 'koishi-plugin-puppeteer'
import * as p_ from 'puppeteer-core'

let ctx: Context
let logger:cjl.LoggerService
let koishiBaseDir:string
let myPluginDataDir:string
let myBrowserUserDataDir:string
let puppeteer:p__
let browserExecutePath: string

let controledPage:p_.Page
let pixivNetHeader:Record<string, string>
let iPximgNetHeader:Record<string, string>

// region 预初始化资源
/**
 * 预初始化 logger KoishiData目录 插件数据目录 浏览器UserDataDir  puppeteer
 * @param ctx 
 */
function inintAllBaseData(ctx:Context) {  // [[4]]
    setCTX(ctx)  // 初始化一次ctx
    setLogger(ctx.logger)  // 初始化logger
    logger.info("正在初始化资源...")
    initKoishiBaseDir(ctx.baseDir)  // 获取koishi的Data目录
    logger.info(`获取Koishi插件的Data目录: ${koishiBaseDir}`)
    initMyPluginDataDir()  // 初始化插件的Data目录
    logger.info(`获取插件的Data目录: ${myPluginDataDir}`)
    // initMyBrowserUserDataDir()  // 初始化插件的chromeUserData目录 -- 弃用
    // logger.info(`获取插件的chromeUserData目录: ${myBrowserUserDataDir}`)
    initPuppeteer(ctx)  // 初始化Puppeteer
    logger.info("资源初始化完毕")
    initBrowserExecutePath(ctx.config)
}

function setLogger(_:cjl.LoggerService){
    logger = _
}

function getLogger() {
    return logger
}

function getKoishiBaseDir() {
    return koishiBaseDir
}

function initKoishiBaseDir(dir:string) {
    koishiBaseDir = dir
}

function getMyPluginDataDir() {
    return myPluginDataDir
}

function initMyPluginDataDir() {
    const baseDir = getKoishiBaseDir()
    myPluginDataDir = path.resolve(baseDir, "data/@QuanhuZeYu/pixiv")
}

function initMyBrowserUserDataDir() {
    const userDataDir = path.resolve(myPluginDataDir, "chromeData")
    myBrowserUserDataDir = userDataDir
}

function getMyUserDataDir() {
    return myBrowserUserDataDir
}

function getPuppeteer() {
    return puppeteer
}

function initPuppeteer(ctx:Context) {
    puppeteer = ctx.puppeteer
}

function initBrowserExecutePath(path:string) {
    browserExecutePath = path
}

function getBrowserExecutePath() {
    return browserExecutePath
}


// region 循环获取资源
function setCTX(ctx_: Context) {
    ctx = ctx_
}

function getCTX() {
    return ctx
}
/**
 * 操作页面时，当函数结束记得调用此函数，将页面存入全局变量中
 * @param p 
 */
function setCurPage(p:p_.Page) {
    controledPage = p
}

function getCurPage() {
    return controledPage
}

function setPixivNetHeader(h:Record<string, string>) {
    pixivNetHeader = h
}

function getPixivNetHeader() {
    return pixivNetHeader
}

function setIpximgNetHeader(h:Record<string, string>) {
    iPximgNetHeader = h
}

function getIpximgNetHeader() {
    return iPximgNetHeader
}


const baseData = {
    inintAllBaseData,

    setLogger,
    initKoishiBaseDir,
    initMyPluginDataDir,
    initMyBrowserUserDataDir,
    initPuppeteer,
    setCTX,
    setCurPage,
    setPixivNetHeader,
    setIpximgNetHeader,

    getLogger,
    getKoishiBaseDir,
    getMyPluginDataDir,
    getMyUserDataDir,
    getPuppeteer,
    getCTX,
    getCurPage,
    getPixivNetHeader,
    getIpximgNetHeader,
}

export default baseData