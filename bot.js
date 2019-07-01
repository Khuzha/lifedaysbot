const Telegraf = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')
const path = require('path')
const mongo = require('mongodb').MongoClient
const data = require('./data')
const makeMessage = require('./makeMessage')
const bot = new Telegraf(data.token)

const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  allowMissing: false, 
  directory: path.resolve(__dirname, 'locales')
})

bot.use(Telegraf.session())
bot.use(i18n.middleware())

mongo.connect(data.mongoLink, {useNewUrlParser: true}, (err, client) => {
  if (err) {
    sendError(err)
  }

  db = client.db('lifedaysbot')
  bot.startPolling()
})


bot.start(({ replyWithHTML, message, from, i18n }) => {
  replyWithHTML(
    i18n.t('start'),
    { reply_markup: { keyboard: [[i18n.t('buttons.stat'), i18n.t('buttons.source')]], resize_keyboard: true } }
  )
  updateUser(from, true)
})

bot.hears(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/, async ({ replyWithHTML, message, from, i18n }) => { 
  const text = await makeMessage(replyWithHTML, message, i18n)
  if (!text) return false
  
  replyWithHTML(
    text,
    { 
      reply_markup: {
        inline_keyboard: [[{text: '⤴️ Share', url: `t.me/share/url?url=${encodeURI(`@LifeDaysBot has said that I live already hours etc. Learn, how much days do you live`)}`}]]
      },
      disable_web_page_preview: true 
    }
  )

  updateStat('date')
  updateUser(from, true)
})


bot.hears(TelegrafI18n.match('buttons.stat'), async ({ replyWithHTML, replyWithChatAction, i18n }) => {
  replyWithChatAction('typing')

  const allUsers = (await db.collection('allUsers').find({}).toArray()).length
  const activeUsers = (await db.collection('allUsers').find({status: 'active'}).toArray()).length
  const blockedUsers = (await db.collection('allUsers').find({status: 'blocked'}).toArray()).length
  const actions = await db.collection('statistic').find({genAct: 'date'}).toArray()

  replyWithHTML(
    i18n.t('statistic', {
      allUsers: allUsers, activeUsers: activeUsers, blockedUsers: blockedUsers,
      activeUsersPercent: Math.round((activeUsers / allUsers) * 100),
      blockedUsersPercent: Math.round((blockedUsers / allUsers) * 100),
      actions: actions[0].count
    }),
    { reply_markup: { keyboard: [[i18n.t('buttons.stat'), i18n.t('buttons.source')]], resize_keyboard: true } }
  )
})

bot.hears(TelegrafI18n.match('buttons.source'), ({ replyWithHTML, from, i18n }) => {
  replyWithHTML(
    i18n.t('source'), 
    { reply_markup: { inline_keyboard: [[{text: '🔗 GitHub', url: 'https://github.com/Khuzha/lifedaysbot'}]] } }
  )

  updateUser(from, true)
})


bot.command('users', async (ctx) => {
  let allUsers = await db.collection('allUsers').find({}).toArray()
  let activeUsers = 0
  let blockedUsers = 0

  for (let key of allUsers) {
    await bot.telegram.sendChatAction(key.userId, 'typing')
      .then((res) => {
        activeUsers++
      })
      .catch((err) => {
        blockedUsers++
        updateUser(key.userId, false)
      })

  }

  ctx.reply(
    `⭕️ Total users: ${allUsers.length} ` +
    `\n✅ Active users: ${activeUsers} - ${Math.round((activeUsers / allUsers.length) * 100)}%` +
    `\n❌ Blocked users: ${blockedUsers} - ${Math.round((blockedUsers / allUsers.length) * 100)}%`
  )
})


bot.on('message', ({ replyWithHTML, from, i18n }) => {
  replyWithHTML(
    i18n.t('mistake'),
    { reply_markup: { keyboard: [[i18n.t('buttons.stat'), i18n.t('buttons.source')]], resize_keyboard: true } }
  )
  updateUser(from, true)
})

updateUser = (from, active) => {
  typeof(from) == 'object' ? from = from.id : false
  let jetzt = active ? 'active' : 'blocked'
  db.collection('allUsers').updateOne({userId: from}, {$set: {status: jetzt}}, {upsert: true, new: true})
}

updateStat = (action) => {
  if (action == 'button') {
    return db.collection('statistic').updateOne({genAct: action}, {$inc: {count: 1}}, {new: true, upsert: true})
  }

  db.collection('statistic').updateOne({action: action}, {$inc: {[makeDate()]: 1}}, {new: true, upsert: true})
  db.collection('statistic').updateOne({genAct: action}, {$inc: {count: 1}}, {new: true, upsert: true})
}

makeDate = () => {
  const today = new Date()
  const yyyy = today.getFullYear()
  let mm = today.getMonth() + 1
  let dd = today.getDate()

  dd < 10 ? dd = '0' + dd : false
  mm < 10 ? mm = '0' + mm : false
  return `${mm}/${dd}/${yyyy}`
}

sendError = (err, ctx) => {
  if (!ctx) {
    return bot.telegram.sendMessage(data.dev, err)
  }

  bot.telegram.sendMessage(
    data.dev,
    `Error: \nUser: [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) \nError's text: ${err}`
  )
}