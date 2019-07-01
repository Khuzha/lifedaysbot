getZodiacSign = (day, month, i18n) => {
  let sign = ''

  if((month == 1 && day <= 20) || (month == 12 && day >=22)) {
    sign = 'capricorn'
  } else if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) {
    sign = 'aquarius'
  } else if((month == 2 && day >= 19) || (month == 3 && day <= 20)) {
    sign = 'pisces'
  } else if((month == 3 && day >= 21) || (month == 4 && day <= 20)) {
    sign = 'aries'
  } else if((month == 4 && day >= 21) || (month == 5 && day <= 20)) {
    sign = 'taurus'
  } else if((month == 5 && day >= 21) || (month == 6 && day <= 20)) {
    sign = 'gemini'
  } else if((month == 6 && day >= 22) || (month == 7 && day <= 22)) {
    sign = 'cancer'
  } else if((month == 7 && day >= 23) || (month == 8 && day <= 23)) {
    sign = 'leo'
  } else if((month == 8 && day >= 24) || (month == 9 && day <= 23)) {
    sign = 'virgo'
  } else if((month == 9 && day >= 24) || (month == 10 && day <= 23)) {
    sign = 'libra'
  } else if((month == 10 && day >= 24) || (month == 11 && day <= 22)) {
    sign = 'scorpio'
  } else if((month == 11 && day >= 23) || (month == 12 && day <= 21)) {
    sign = 'sagittarius'
  }

  return i18n.t(`signs.${sign}`)
}

module.exports = {
  getZodiacSign
}