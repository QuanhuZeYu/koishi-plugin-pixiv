# @quanhuzeyu/koishi-plugin-pixiv

[![npm](https://img.shields.io/npm/v/@quanhuzeyu/koishi-plugin-pixiv?style=flat-square)](https://www.npmjs.com/package/@quanhuzeyu/koishi-plugin-pixiv)

与pixiv相关的操作插件，无需获取cookies等复杂操作，获取账号下的每日推荐

## 可用指令

`随机涩图` : 从pixiv.net主页的推荐作品中随机挑选一张回复给指令发送者

### 更新日志

v0.1.19: 更新刷新逻辑，让刷新不再那么频繁；另测试了在网络不好的情况下是否能修复，可惜不行，遇到失败去试试换个网络吧

v0.1.14: 修复页面刷新逻辑，当页面刷新时如果网络过差会导致获取失败，使用了一个try循环重试。注意：由于是递归，可能会导致栈溢出

v0.1.12: 抽离选择器逻辑到配置文件中，日后不再维护获取相关逻辑

v0.1.11: 修改作品获取逻辑，提高图像获取成功率，并提高获取速度

v0.1.4: 修复插件在puppeteer重载时无法获取页面的问题，现在支持重载puppeteer后保持正常运行。同时增加了推荐作品获取逻辑，确保可以获取到推荐作品信息

v0.1.3: 尝试支持无头模式下的运行，初始化页面逻辑改为遍历当前浏览器所有页面，匹配url含有pixiv则会控制这个页面，如果有多个pixiv插件，有可能导致未知问题
