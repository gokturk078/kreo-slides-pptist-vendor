import { padStart } from 'lodash'

/**

 * @param digit Numbers

 */
export const fillDigit = (digit: number, len: number) => {
  return padStart('' + digit, len, '0')
}

/**

 */
export const isPC = () => {
  return !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|Mobile|BlackBerry|Symbian|Windows Phone)/i)
}

/**

 */
export const isValidURL = (url: string) => {
  return /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/i.test(url)
}

/**

 */
export const htmlToText = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

/**

 */
export const isFloatEqual = (a: number, b: number, epsilon = 1e-10) => {
  return Math.abs(a - b) < epsilon
}