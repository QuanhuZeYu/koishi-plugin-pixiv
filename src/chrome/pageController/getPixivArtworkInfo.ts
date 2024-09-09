import * as p_ from 'puppeteer-core'
import Data from '../../Data/_index'

/**
 * 注意!请在进入artwork页面后再调用本函数
 * @param p 
 * @returns 
 */
async function getArtWorkInfo(p:p_.Page):Promise<string> {
    const logger = Data.baseData.getLogger()
    const artWorkInfo = await p.evaluate(()=> {
        const authorSection = document.querySelector('main').nextElementSibling.querySelector('section')
        const authorName = authorSection.querySelectorAll('a')[1].textContent

        const infoSection = document.querySelector('section figcaption')
        const title0Section = infoSection.querySelector('h1')
        const title1Section = title0Section.nextElementSibling
        const footerSection = title1Section.nextElementSibling
        const tags = footerSection.querySelectorAll('li')
        const hotInfo = footerSection.nextElementSibling.querySelectorAll('li')
        const timeSection = footerSection.nextElementSibling.nextElementSibling

        const title0 = title0Section.textContent
        const title1 = title1Section.textContent
        const tagString = []
        tags.forEach(li => {
            const tagInfo = li.querySelectorAll('span')
            tagString.push(`#${tagInfo[0].textContent} ${tagInfo[1].textContent}`)
        })
        const likeCount = hotInfo[0].textContent
        const colloctionCount = hotInfo[1].textContent
        const viewCount = hotInfo[2].textContent
        const time = timeSection.querySelector('time').textContent

        const result = `作品名称: ${title0}\n作者: ${authorName}\n副标题: ${title1}\ntags: ${tagString}\n喜欢数: ${likeCount}\n收藏数: ${colloctionCount}\n浏览数: ${viewCount}\n时间: ${time}`
        return result
    })
    return artWorkInfo
}

export default getArtWorkInfo