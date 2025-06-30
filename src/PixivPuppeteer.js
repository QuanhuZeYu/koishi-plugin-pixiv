import { Fields } from ".";

export default class PixivPuppeteer {
    constructor(ctx) {
        if (!ctx?.puppeteer?.browser) {
            throw new Error('Puppeteer browser instance is required');
        }
        this.browser = ctx.puppeteer.browser;
        this.page = null; // 初始化page属性

        // 注册卸载事件
        ctx.on('dispose', () => {
            this.closePage();
        });

        setTimeout(async () => {
            await this.createPage();
        }, 0);
    }

    /**
     * 创建一个新的浏览器页面
     */
    async createPage() {
        try {
            this.page = await this.browser.newPage();
            
            // 可以在这里设置一些默认的页面配置
            await this.page.setViewport({
                width: 1200,
                height: 1000,
                deviceScaleFactor: 1,
            });
            
            // 设置User-Agent等
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

            // 打开Pixiv首页（或其他目标页面）
            await this.page.goto('https://www.pixiv.net', {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            // 等待必要的元素加载（根据实际需要调整）
            await this.page.waitForSelector('body', { timeout: 5000 });
            
        } catch (error) {
            console.error('Failed to create new page:', error);
            throw error;
        }
    }

    /**
     * 关闭页面
     */
    async closePage() {
        if (this.page && !this.page.isClosed()) {
            await this.page.close();
            this.page = null;
        }
    }

    /**
     * 获取包含PID和对应元素的数组
     * @returns {Array<{pid: number, element: HTMLElement}>} 返回对象数组，每个对象包含pid和对应的HTML元素
     */
    async B寻找推荐作品() {
        const result = this.page.evaluate(() => {
            const sections = Array.from(document.querySelectorAll(`section`));
            const 推荐作品 = Array.from(sections).find(sec => {
                /**
                 * 递归查找包含"推荐作品"文本的节点
                 * @param {HTMLElement} node 
                 */
                const find推荐 = (node) => {
                    // 检查当前节点是否包含目标文本
                    if (node.textContent.trim() === "推荐作品") {
                        return true;
                    }
                    
                    // 递归检查子节点
                    if (node.hasChildNodes()) {
                        for (const child of node.childNodes) {
                            if (find推荐(child)) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
                
                return find推荐(sec);
            });
            //console.log(推荐作品);
            const 作品s = Array.from(推荐作品.querySelectorAll(`ul > li`)).filter(li => {
                const as = li.querySelectorAll(`a`);
                //console.log(as);
                for (const a of as) {
                    const sp = a.href.split("/");
                    for (const sl of sp) {
                        if (sl === "artworks") {
                            return true;
                        }
                    }
                }
                return false;
            });
            // 制作返回值
            const result = [];
            // 遍历所有作品
            for (const art of 作品s) {
                // 找到一个含有 artworks 的 href 
                const as = art.querySelectorAll(`a`);
                const a = Array.from(as).find(a => {
                    const href = a.href;
                    const sps = href.split(`/`);
                    for (const sp of sps) {
                        if (sp === "artworks") {
                            return true;
                        }
                    }
                    return false;
                });
                // 从href中提取pid
                const pid = a.href.split(`/`)[a.href.split(`/`).length - 1];
                result.push({
                    pid: pid,
                    element: art.innerHTML
                });
            }
            return result;
        });
        return result;
    }

    /**
     * 
     * @param {number} pid 
     * @returns {{
     *  base64:[string],
     *  pid:number,
     *  artisan:string,
     *  uid:number
     * }}
     */
    async A根据PID获取图片(pid) {
        const newPage = await this.browser.newPage();
        await newPage.goto(`https://www.pixiv.net/artworks/${pid}`, {
            timeout: 30000, // 超时时间（毫秒）
            waitUntil: 'domcontentloaded' // 等待条件
        });
        await newPage.waitForSelector(`section`);
        const imgs = await newPage.evaluate(() => {
            //console.log(`test`)
            const A作品区域1 = Array.from(document.querySelectorAll(`section`))[0];
            const A作品区域2 = Array.from(A作品区域1.querySelectorAll(`figure`))[0];
            const A作品s = A作品区域2.querySelectorAll(`img`);
            // 将所有作品保存为base64返回
            const result = Array.from(A作品s).map(img => {
                const canvas = document.createElement(`canvas`);
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext(`2d`);
                ctx.drawImage(img, 0, 0);
                return canvas.toDataURL(`image/png`);
            })
            // 寻找uid
            const 画师信息侧 = document.querySelectorAll(`aside`)[0];
            //console.log(画师信息侧);
            const 画师链接 = 画师信息侧.querySelector(`a`).href;
            console.log(`画师链接: ${画师链接}`);

            const 链接分割 = 画师链接.split("/");
            const uid = 链接分割[链接分割.length - 1];
            console.log(`画师UID: ${uid}`);
            // 寻找画师名称
            let 画师名称 = "";
            const 画师信息侧所有A标签 = Array.from(画师信息侧.querySelectorAll(`a`));
            for (const a of 画师信息侧所有A标签) { // 遍历寻找
                if (!a.href.includes("users")) continue; // 没有user信息不是我们要找的
                if (a.textContent === undefined || a.textContent === "" || a.textContent === null) continue; // 没有文本信息也不是我们要的
                画师名称 = a.textContent;
                break;
            }
            console.log(`画师名称: ${画师名称}`);
            return {
                base64: result,
                pid: undefined,
                artisan: 画师名称,
                uid: uid
            };
        });
        // 关闭这个标签页
        newPage.close();
        return {
            ...imgs,
            pid: pid
        };
    }


    async C刷新主页() {
        await this.page.reload({
            timeout: 30000,       // 超时时间（毫秒），默认30秒
            waitUntil: 'domcontentloaded'  // 等待选项
        });
    }












}