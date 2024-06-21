const { Feed } = require('feed')
const path = require('path')
const moment = require('moment')
const fs = require('fs-extra')

const utils = require('./utils')

async function createFeed(linksJson){
  const homePage = await utils.getHomePage()
  const feedUrl = `${homePage}/atom.xml`

  const feed = new Feed({
    title: 'AIGC 相关文章 | gpt-rss | by 周三不Coding',
    description: '订阅 AIGC 相关文章',
    id: feedUrl,
    link: feedUrl,
    image: '',
    favicon: `${homePage}/static/favicon.ico`,
    copyright: `All rights reserved ${(new Date()).getFullYear()} by Tycho`,
    updated: new Date(),
    language: 'zh',
    feedLinks: {
      atom: feedUrl
    },
    author: {
      name: 'Tycho',
      email: 'ltyzzz2000@gmail.com',
      link: 'https://github.com/tychozzz/gpt-rss'
    }
  })

  linksJson.reduce((prev, curr) => {
    console.log("feed rss...")
    return [
      ...prev,
      ...curr.items.map((post) => ({
        title: post.title,
        id: post.link,
        link: post.link,
        date: moment(post.date, 'YYYY-MM-DD').toDate(),
        published: moment(post.date, 'YYYY-MM-DD').toDate()
      }))
    ]
  }, []).sort((a, b) => {
    return a.date < b.date ? 1 : -1
  }).slice(0, 50).forEach((post) => {
    console.log("post is", post)
    feed.addItem(post)
  })

  fs.outputFileSync(utils.PATH.FEED_PATH, feed.atom1())
}

module.exports = createFeed
