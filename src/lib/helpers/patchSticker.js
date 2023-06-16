export function patchSticker({ stickers, prop, value, index }) {
  if (!stickers || !(stickers instanceof Array) || stickers.length <= 0)
    throw Error('`stickers` array is empty')

  if (typeof index !== 'number' || !stickers[index])
    throw Error('`index` needs to be a valid `stickers` array index')

  const PROPS = ['position', 'scale', 'rotation']

  if (!PROPS.includes(prop))
    throw Error(`Invalid 'prop'. 'prop' must be one of: ${PROPS.join(',')}`)

  return stickers.map((item, i) => {
    if (i === index) item[prop] = value
    return item
  })
}
