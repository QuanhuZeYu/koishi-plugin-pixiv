import { Context } from "koishi";
import Data from "../Data/_index";

export let started: boolean = false
async function preInit(ctx:Context) {  // [[2]]
    if(started) return
    Data.baseData.inintAllBaseData(ctx)  // 初始化全部基础资源 [[3]]

    started = true  // 标记为已启动，避免重复初始化资源
}

export default preInit