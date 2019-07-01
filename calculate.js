getAge = (date) => {
  let now = Date.now()
  const milliseconds = now - date.getTime()
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 2 / 31 + days / 2 / 30)
  const years = Math.floor((days - Math.floor(days / 365 / 4)) / 365)
  
  now = new Date()
  let today = now.getDate()
  let thisMonth = now.getMonth() + 1
  const thisYear = now.getFullYear()

  today.toString().length == 1 ? today = '0' + today : false
  thisMonth.toString().length == 1 ? thisMonth = '0' + thisMonth : false

  const nowHours = now.getUTCHours().toString().length == 1 ? '0' + now.getUTCHours() : now.getUTCHours()
  const nowMinutes = now.getUTCMinutes().toString().length == 1 ? '0' + now.getUTCMinutes() : now.getUTCMinutes()
  const nowSeconds = now.getUTCSeconds().toString().length == 1 ? '0' + now.getUTCSeconds() : now.getUTCSeconds()

  return {
    milliseconds: commafy(milliseconds),
    seconds: commafy(seconds),
    minutes: commafy(minutes),
    hours: commafy(hours),
    days: commafy(days),
    weeks: commafy(weeks),
    months: commafy(months),
    years: commafy(years),
    today: today,
    thisMonth: thisMonth,
    thisYear: thisYear,
    nowHours: nowHours,
    nowMinutes: nowMinutes,
    nowSeconds: nowSeconds
  }
}

commafy = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

module.exports = getAge