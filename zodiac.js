getZodiacSign = (day, month) => {
  
  if((month == 1 && day <= 20) || (month == 12 && day >=22)) {
    return 'capricorn'
  } else if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) {
    return 'aquarius'
  } else if((month == 2 && day >= 19) || (month == 3 && day <= 20)) {
    return 'pisces'
  } else if((month == 3 && day >= 21) || (month == 4 && day <= 20)) {
    return 'aries'
  } else if((month == 4 && day >= 21) || (month == 5 && day <= 20)) {
    return 'taurus'
  } else if((month == 5 && day >= 21) || (month == 6 && day <= 20)) {
    return 'gemini'
  } else if((month == 6 && day >= 22) || (month == 7 && day <= 22)) {
    return 'cancer'
  } else if((month == 7 && day >= 23) || (month == 8 && day <= 23)) {
    return 'leo'
  } else if((month == 8 && day >= 24) || (month == 9 && day <= 23)) {
    return 'virgo'
  } else if((month == 9 && day >= 24) || (month == 10 && day <= 23)) {
    return 'libra'
  } else if((month == 10 && day >= 24) || (month == 11 && day <= 22)) {
    return 'scorpio'
  } else if((month == 11 && day >= 23) || (month == 12 && day <= 21)) {
    return 'sagittarius'
  }

}

module.exports = {
  getZodiacSign
}