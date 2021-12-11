import enUs from './en-US.json'
import frFr from './fr-FR.json'

export const defaultLocale = 'en-US'

export const languages = {
  'en-US': enUs,
  'fr-FR': frFr
}

export const customModifiers = {
    getString: (str, nb) => str.split('|')[nb]
}