const calculate = require('./calculate')
const zodiac = require('./zodiac')

async function run (replyWithHTML, message, from, i18n) {
  const textArr = message.text.split('.')
  const date = new Date(`${textArr[2]}-${textArr[1]}-${textArr[0]}`)
  let now = Date.now()

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

module.exports = run