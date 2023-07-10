export function patchSticker({ stickers, prop, value, id }) {
  if (!stickers || !(stickers instanceof Array) || stickers.length <= 0)
    throw Error('`stickers` array is empty')

  const patchedSticker = stickers.find((sticker) => sticker.id === id)

  if (!id || !patchedSticker)
    throw Error('`id` needs to be a valid `sticker` id')

  const PROPS = ['position', 'scale', 'rotation']

  if (!PROPS.includes(prop))
    throw Error(`Invalid 'prop'. 'prop' must be one of: ${PROPS.join(',')}`)

  return stickers.map((item) => {
    if (item === patchedSticker) item[prop] = value
    return item
  })
}
