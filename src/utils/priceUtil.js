export const conversion = (num) => {
    const str = num / 100 + ''
    const intSum = str.substring(0, str.indexOf('.')).replace(/\B(?=(?:\d{3})+$)/g, ',')
    const dot = str.substring(str.length, str.indexOf('.'))
    return intSum + dot
}