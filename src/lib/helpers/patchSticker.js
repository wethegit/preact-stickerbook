export function patchSticker({ stickers, prop, value, key }) {
  if (!stickers || !(stickers instanceof Array) || stickers.length <= 0)
    throw Error('`stickers` array is empty')

  const patchedSticker = stickers.find((sticker) => sticker.key === key)

  if (!key || !patchedSticker)
    throw Error('`key` needs to be a valid `sticker` key')

  const PROPS = ['position', 'scale', 'rotation']

  if (!PROPS.includes(prop))
    throw Error(`Invalid 'prop'. 'prop' must be one of: ${PROPS.join(',')}`)

  return stickers.map((item) => {
    if (item === patchedSticker) item[prop] = value
    return item
  })
}
