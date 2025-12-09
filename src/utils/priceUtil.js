export const conversion = (num) => {
    const str = num / 100 + ''
    const intSum = str.substring(0, str.indexOf('.')).replace(/\B(?=(?:\d{3})+$)/g, ',')
    const dot = str.substring(str.length, str.indexOf('.'))
    return intSum + dot
}

export function formatPrice(price) {
  if (typeof price !== 'number') {
    price = parseInt(price)
  }
  return (price / 100).toFixed(2)
}