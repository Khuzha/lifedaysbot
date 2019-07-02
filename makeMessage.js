const calculate = require('./calculate')
const zodiac = require('./zodiac')

async function mess (replyWithHTML, message, i18n) {
  const textArr = message.text.split('.')
  const date = new Date(`${textArr[2]}-${textArr[1]}-${textArr[0]}`)
  const now = Date.now()

  if (textArr[0] > 28 && (textArr[2] % 4 !== 0) && textArr[1] == '02') {
    replyWithHTML(
      i18n.t('notleap', { year: textArr[2] })
    )
    return false
  }

  if (date == 'Invalid Date' || (textArr[1] == '02' && textArr[0] > 29)) {
    replyWithHTML(i18n.t('invalidDate'))
    return false
  }
  
  if (date > now) {
    replyWithHTML(i18n.t('futureDate'))
    return false
  }
  
  const { 
    milliseconds, seconds, minutes, hours, days, weeks, months, years,
    today, thisMonth, thisYear, nowHours, nowMinutes, nowSeconds
  } = calculate(date)

  return i18n.t('finalReply', {
    milliseconds: milliseconds, seconds: seconds, minutes: minutes,
    hours: hours, days: days, weeks: weeks, months: months, years: years,
    today: today, thisMonth: thisMonth, thisYear: thisYear, 
    nowHours: nowHours, nowMinutes: nowMinutes, nowSeconds: nowSeconds,
    zodiac: zodiac.getZodiacSign(textArr[0], textArr[1], i18n),
    bornDate: message.text
  })
}

async function query (answerInlineQuery, update, i18n, count) {
  const query = update.inline_query.query
  const textArr = query.split('.')
  const date = new Date(`${textArr[2]}-${textArr[1]}-${textArr[0]}`)
  const now = Date.now()

  console.log(query)
  console.log(!query.trim().match(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/))

  if (
    !query.trim().match(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/) ||
    (textArr[0] > 28 && (textArr[2] % 4 !== 0) && textArr[1] == '02') ||
    date == 'Invalid Date' || (textArr[1] == '02' && textArr[0] > 29) ||
    date > now
  ) {

    const post = [{
      type: 'article',
      id: count,
      title: i18n.t('invalidQueryDate'),
      input_message_content: {
        message_text: i18n.t('invalidQueryDateText'),
        parse_mode: 'markdown',
        disable_web_page_preview: true,
      },
      reply_markup: {
        inline_keyboard: [[{text: i18n.t('queryAgain'), switch_inline_query_current_chat: ''}]]        
      }
    }]

    try {
      return answerInlineQuery(post)
    } catch (err) {
      return console.log(err)
    }
  }



  const {
    milliseconds, seconds, minutes, hours, days, weeks, months, years,
    today, thisMonth, thisYear, nowHours, nowMinutes, nowSeconds
  } = calculate(date)

  const text = i18n.t('queryReply', {
    milliseconds: milliseconds, seconds: seconds, minutes: minutes,
    hours: hours, days: days, weeks: weeks, months: months, years: years,
    today: today, thisMonth: thisMonth, thisYear: thisYear, 
    nowHours: nowHours, nowMinutes: nowMinutes, nowSeconds: nowSeconds,
    zodiac: zodiac.getZodiacSign(textArr[0], textArr[1], i18n),
    bornDate: update.inline_query.query
  })

  const post = [{
    type: 'article',
    id: count,
    title: i18n.t('press'),
    input_message_content: {
      message_text: text,
      parse_mode: 'html',
      disable_web_page_preview: true,
    },
    reply_markup: {
      inline_keyboard: [[{text: i18n.t('hmd'), url: 't.me/LifeDaysBot'}]]
    }
  }]

  answerInlineQuery(post)
    .catch((err) => { return console.log(err) })
}

module.exports = {
  mess, query
}