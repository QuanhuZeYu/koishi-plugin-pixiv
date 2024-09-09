import * as p_ from 'puppeteer-core'
import Data from '../../Data/_index'

/**
 * 注意!请在进入artwork页面后再调用本函数
 * @param p 
 * @returns 
 */
async function getArtWorkInfo(p: p_.Page): Promise<string> {
    const logger = Data.baseData.getLogger();

    const artWorkInfo = await p.evaluate(() => {
        try {
            const authorSection = document.querySelector('main')?.nextElementSibling?.querySelector('section');
            const authorName = authorSection?.querySelectorAll('a')[1]?.textContent?.trim() || '未知';

            const infoSection = document.querySelector('section figcaption');
            if (!infoSection) throw new Error('无法找到作品信息区域');

            const footerSection = infoSection.querySelector('footer');
            if (!footerSection) throw new Error('无法找到页脚信息区域');

            const tags = footerSection.querySelectorAll('li');
            const hotInfo = footerSection.nextElementSibling?.querySelectorAll('li');
            const timeSection = footerSection.nextElementSibling?.nextElementSibling;
            
            const tagString: string[] = [];
            tags.forEach((li) => {
                const tagInfo = li.querySelectorAll('span');
                if (tagInfo.length >= 3) {
                    const tagText = tagInfo[1]?.textContent?.trim() || '';
                    const tagLinkText = tagInfo[2]?.querySelector('a')?.textContent?.trim() || '';
                    tagString.push(`#${tagText} ${tagLinkText}`);
                } else if (tagInfo.length === 2) {
                    tagString.push(`#${tagInfo[0]?.textContent?.trim()}`);
                }
            });

            const likeCount = hotInfo?.[0]?.textContent?.trim() || '0';
            const collectionCount = hotInfo?.[1]?.textContent?.trim() || '0';
            const viewCount = hotInfo?.[2]?.textContent?.trim() || '0';
            const time = timeSection?.querySelector('time')?.textContent?.trim() || '未知';

            const title0Section = infoSection.querySelector('h1');
            if (title0Section) {
                const title1Section = title0Section.nextElementSibling;
                const title0 = title0Section.textContent?.trim() || '无';
                const title1 = title1Section?.textContent?.trim() || '无';
                return `作品名称: ${title0}\n作者: ${authorName}\n副标题: ${title1}\ntags: ${tagString.join(' ')}\n喜欢数: ${likeCount}\n收藏数: ${collectionCount}\n浏览数: ${viewCount}\n时间: ${time}`;
            } else {
                return `作品名称: 无\n作者: ${authorName}\n副标题: 无\ntags: ${tagString.join(' ')}\n喜欢数: ${likeCount}\n收藏数: ${collectionCount}\n浏览数: ${viewCount}\n时间: ${time}`;
            }
        } catch (error) {
            console.error('Error fetching artwork info:', error);
            return '无法获取作品信息';
        }
    });

    return artWorkInfo;
}

export default getArtWorkInfo