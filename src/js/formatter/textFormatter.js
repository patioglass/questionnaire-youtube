export function extractionNumber(text) {
  return text.match(/([0-9]|[０-９])/g).join('')
}

export function toHalfWidthNumber(text) {
  // 全角 to 半角の文字コードの差
  const SHIFT_INDEX = 0xFEE0
  return text.replace(/[０-９]/g, (match) => String.fromCharCode(match.charCodeAt(0) - SHIFT_INDEX))
}
