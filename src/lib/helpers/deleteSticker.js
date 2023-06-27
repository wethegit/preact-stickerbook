export function deleteSticker(stickers, key) {
  if (!stickers || !(stickers instanceof Array) || stickers.length <= 0)
    throw Error('`stickers` array is empty')

  const [filteredStickers, deletedSticker] = stickers.reduce(
    (acc, s) => {
      if (s.key !== key) acc[0].push(s)
      else acc[1] = s

      return acc
    },
    [[], null]
  )
  if (!key || !deletedSticker)
    throw Error('`key` needs to be a valid `sticker` key')

  return filteredStickers.map((item) => {
    // fix the order
    if (item.order > deletedSticker.order) item.order -= 1
    return item
  })
}
