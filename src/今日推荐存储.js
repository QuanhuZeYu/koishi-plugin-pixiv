import { Database } from "koishi";
import { Fields } from ".";

export default class 今日推荐存储 {
    constructor(ctx) {
        /** @type {Database} */
        this.database = ctx.database;
        ctx.model.extend(`qz-pixiv`, {
            id: `string`,
            群: `array`,
            私: 'array'
        });
    }

    getTodayID() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}