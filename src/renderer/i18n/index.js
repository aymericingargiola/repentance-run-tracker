import enUs from './en-US.json'
import frFr from './fr-FR.json'
import deDE from './de-DE.json'
import esES from './es-ES.json'
import ruRU from './ru-RU.json'
import jaJP from './ja-JP.json'
import koKR from './ko-KR.json'
import zhZH from './zh-ZH.json'

export const defaultLocale = 'en-US'

export const languages = {
  'en-US': enUs,
  'fr-FR': frFr,
  'de-DE': deDE,
  'es-ES': esES,
  'ru-RU': ruRU,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'zh-ZH': zhZH
}

export const customModifiers = {
    getString: (str, nb) => str.split('|')[nb]
}