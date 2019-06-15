const Telegraf = require('telegraf')
const mongo = require('mongodb').MongoClient
const data = require('./data')
const zodiac = require('./zodiac')
const calculator = require('./calculator')
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
    'Send me your birthday in format DD.MM.YYYY (e.g. 01.01.1990)',
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
  
  const { 
    milliseconds, seconds, minutes, hours, days, weeks, months, years,
    today, thisMonth, thisYear, nowHours, nowMinutes, nowSeconds
  } = calculator.getAge(date)
  

  ctx.reply(
    `Now it's ${nowHours}:${nowMinutes}:${nowSeconds} ` + 
    `<a href="https://www.timeanddate.com/time/aboututc.html">UTC (Coordinated Universal Time)</a>, ` +
    `${today}.${thisMonth}.${thisYear}. \nYou were born in ${ctx.message.text}.` +
    `\nYour zodiac sign is ${zodiac.getZodiacSign(textArr[0], textArr[1])}` +
    `\n\nYour life in: \n` + 
    `\nYears: ${years} \nMonths: ${months} \nWeeks: ${weeks} \nDays: ${days}` +
    `\nHours: ${hours} \nMinutes: ${minutes} \nSeconds: ${seconds} \nMilliseconds: ${milliseconds}`,
    { 
      reply_markup: {
        inline_keyboard: [[{text: '⤴️ Share', url: `t.me/share/url?url=${encodeURI(`@LifeDaysBot has said that I live already ${commafy(weeks)} weeks, ${commafy(days)} days, ${commafy(hours)} hours etc. Learn, how much days do you live`)}`}]]
      },
      parse_mode: 'html',
      disable_web_page_preview: true }
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


bot.on('message', (ctx) => {
  ctx.reply(
    'Message you sent me isn`t in correct format. Send me your birthday in format DD.MM.YYYY (e.g. 01.01.1990)',
    { reply_markup: data.keyboard }
  )
  updateUser(ctx, true)
})

updateUser = (userId, active) => {
  typeof(userId) == 'object' ? userId = userId.from.id : false
  let jetzt = active ? 'active' : 'blocked'
  db.collection('allUsers').updateOne({userId: userId}, {$set: {status: jetzt}}, {upsert: true, new: true})
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