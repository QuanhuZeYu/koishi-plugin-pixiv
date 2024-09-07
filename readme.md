# @quanhuzeyu/koishi-plugin-pixiv

[![npm](https://img.shields.io/npm/v/@quanhuzeyu/koishi-plugin-pixiv?style=flat-square)](https://www.npmjs.com/package/@quanhuzeyu/koishi-plugin-pixiv)

与pixiv相关的操作插件，无需获取cookies等复杂操作，获取账号下的每日推荐

## 可用指令

`随机涩图` : 从pixiv.net主页的推荐作品中随机挑选一张回复给指令发送者

### 更新日志

v0.1.3: 尝试支持无头模式下的运行，初始化页面逻辑改为遍历当前浏览器所有页面，匹配url含有pixiv则会控制这个页面，如果有多个pixiv插件，有可能导致未知问题
