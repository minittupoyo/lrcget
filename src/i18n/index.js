import { ref } from 'vue'
import en from './locales/en.js'
import ja from './locales/ja.js'

const messages = { en, ja }

const savedLocale = localStorage.getItem('locale')
const browserLocale = navigator.language?.toLowerCase().startsWith('ja') ? 'ja' : 'en'
export const locale = ref(savedLocale || browserLocale)

export const setLocale = (value) => {
  if (!messages[value]) return
  locale.value = value
  localStorage.setItem('locale', value)
  document.documentElement.lang = value
}

export const t = (key, params = {}) => {
  const read = (source) => key.split('.').reduce((value, part) => value?.[part], source)
  let message = read(messages[locale.value]) ?? read(messages.en) ?? key

  Object.entries(params).forEach(([name, value]) => {
    message = message.replaceAll(`{${name}}`, String(value))
  })

  return message
}

export const installI18n = (app) => {
  document.documentElement.lang = locale.value
  app.config.globalProperties.$t = t
}
