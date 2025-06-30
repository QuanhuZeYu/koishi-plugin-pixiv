import { Fields } from ".";
import { h } from 'koishi';

export default class 指令管理器 {
    constructor(ctx) {
        ctx.command(`qz-pixiv/pixiv推荐作品`)
            .action(async (argv, message) => {
                await Fields.pixiv.B寻找推荐作品();
                await this.A发送随机推荐作品(argv.session);
            });
    }

    async A发送随机推荐作品(session) {
        const arts = await Fields.pixiv.B寻找推荐作品();
        const index = this.getRandomInt(0, arts.length - 1);
        const pid = arts[index].pid;
        // 3. 使用PixivPuppeteer类获取图片资源
        const picInfo = await Fields.pixiv.A根据PID获取图片(pid); // base64数组
        //Fields.logger.info(picInfo);
        //console.log(session);

        const message = h(`message`, [
            h(`quote`, { id: session.event.message.id,name: session.event.user.username}),
            h(``, [
                // 遍历base64s数组生成img标签
                ...picInfo.base64.map(base64 => 
                    h('img', { src: base64})
                ),
                h(``, `作品PID: ${picInfo.pid}\n`),
                h(``, `画师: ${picInfo.artisan}\n`),
                h(``, `画师ID: ${picInfo.uid}\n`),
            ])
        ])
        Fields.pixiv.C刷新主页();
        session.send(message);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }


    /**
     * 
     * @param {import("koishi").Session} session 
     */
    Z是群聊吗(session) {
        return session.event.subtype === "group";
    }
    
    /**
     * 
     * @param {import("koishi").Session} session 
     */
    Z是私聊吗(session) {
        return session.event.subtype === "private";
    }
}