const Telegraf = require('telegraf')
const mongo = require('mongodb').MongoClient
const data = require('./data')
const bot = new Telegraf(data.token)

mongo.connect(data.mongoLink, {useNewUrlParser: true}, (err, client) => {
  if (err) {
    sendError(err)
  }

  db = client.db('lifedaysbot')
  bot.startPolling()
})

bot.start((ctx) => {
  ctx.reply(
    'Send me your birthday in format DD.MM.YYYY (e.g. 21.12.2000)',
    { reply_markup: data.keyboard }
  )
  updateUser(ctx, true)
})

bot.hears(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/, (ctx) => {
  const textArr = ctx.message.text.split('.')
  const date = new Date(`${textArr[2]}-${textArr[1]}-${textArr[0]}`)
  let now = Date.now()


  if (textArr[0] > 28 && (textArr[2] % 4 !== 0) && textArr[1] == '02') {
    return ctx.reply(`${textArr[2]} wasn't a leap year. Try again`)
  }

  if (date == 'Invalid Date' || (textArr[1] == '02' && textArr[0] > 29)) {
    return ctx.reply('Your date is invalid. Please send me correct one.')
  }
  
  if (date > now) {
    return ctx.reply('Was you born in the future? Please send a correct date.')
  }
  
  
  const milliseconds = now - date.getTime()
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 2 / 31 + days / 2 / 30)
  const years = Math.floor(days / 365)
  
  now = new Date()
  let today = commafy(now.getDate())
  let thisMonth = commafy(now.getMonth() + 1)
  const thisYear = now.getFullYear()

  today.length == 1 ? today = '0' + today : false
  thisMonth.length == 1 ? thisMonth = '0' + thisMonth : false

  const nowHours = now.getUTCHours().toString().length == 1 ? '0' + now.getUTCHours() : now.getUTCHours()
  const nowMinutes = now.getUTCMinutes().toString().length == 1 ? '0' + now.getUTCMinutes() : now.getUTCMinutes()
  const nowSeconds = now.getUTCSeconds().toString().length == 1 ? '0' + now.getUTCSeconds() : now.getUTCSeconds()

  ctx.reply(
    `Now it's ${nowHours}:${nowMinutes}:${nowSeconds} ` + 
    `<a href="https://www.timeanddate.com/time/aboututc.html">UTC (Coordinated Universal Time)</a>, ` +
    `${today}.${thisMonth}.${thisYear}. \nYou were born in ${ctx.message.text}.` +
    `\n\nYour life in: \n` + 
    `\nYears: ${years} \nMonths: ${commafy(months)} \nWeeks: ${commafy(weeks)} \nDays: ${commafy(days)}` +
    `\nHours: ${commafy(hours)} \nMinutes: ${commafy(minutes)} \nSeconds: ${commafy(seconds)} \nMilliseconds: ${commafy(milliseconds)}`,
    { reply_markup: data.keyboard, parse_mode: 'html', disable_web_page_preview: true }
  )

  updateStat('date')
  updateUser(ctx, true)
})

bot.hears('📈 Statistic', async (ctx) => {
  const allUsers = (await db.collection('allUsers').find({}).toArray()).length
  const activeUsers = (await db.collection('allUsers').find({status: 'active'}).toArray()).length
  const blockedUsers = (await db.collection('allUsers').find({status: 'blocked'}).toArray()).length
  const actions = await db.collection('statistic').find({genAct: 'date'}).toArray()

  ctx.reply(
    `👥 <strong>Total users: ${allUsers}</strong>` +
    `\n🤴 Active users: ${activeUsers} - ${Math.round((activeUsers / allUsers) * 100)}%` +
    `\n🧛‍♂️ Blocked users: ${blockedUsers} - ${Math.round((blockedUsers / allUsers) * 100)}%` +
    `\n\n🕹 Dates checked: ${actions[0].count}`,
    { reply_markup: data.keyboard, parse_mode: 'html' }
  )
})

bot.hears('📁 Source code', (ctx) => {
  ctx.reply(
    'You can see code of this bot on GitHub. Thanks for stars!', 
    { reply_markup: { inline_keyboard: [[{text: '🔗 GitHub', url: 'https://github.com/Khuzha/lifedaysbot'}]] } }
  )

  updateUser(ctx, true)
})

bot.on('message', (ctx) => {
  ctx.reply(
    'Message you sent me isn`t in correct format. Send me your birthday in format DD.MM.YYYY (e.g. 21.12.2000)',
    { reply_markup: data.keyboard }
  )
  updateUser(ctx, true)
})

function updateUser (ctx, active) {
  let jetzt = active ? 'active' : 'blocked'
  db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {status: jetzt}}, {upsert: true, new: true})
}

function updateStat (action) {
  if (action == 'button') {
    return db.collection('statistic').updateOne({genAct: action}, {$inc: {count: 1}}, {new: true, upsert: true})
  }

  db.collection('statistic').updateOne({action: action}, {$inc: {[makeDate()]: 1}}, {new: true, upsert: true})
  db.collection('statistic').updateOne({genAct: action}, {$inc: {count: 1}}, {new: true, upsert: true})
}

function commafy (num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

function makeDate () {
  const today = new Date()
  const yyyy = today.getFullYear()
  let mm = today.getMonth() + 1
  let dd = today.getDate()

  dd < 10 ? dd = '0' + dd : false
  mm < 10 ? mm = '0' + mm : false
  return `${mm}/${dd}/${yyyy}`
}