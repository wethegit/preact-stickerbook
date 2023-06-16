export function deleteSticker(stickers, index) {
  if (!stickers || !(stickers instanceof Array) || stickers.length <= 0)
    throw Error('`stickers` array is empty')

  if (typeof index !== 'number' || !stickers[index])
    throw Error('`index` needs to be a valid `stickers` array index')

  const order = stickers[index].order

  return stickers
    .filter((_, i) => i !== index)
    .map((item) => {
      // fix the order
      if (item.order > order) item.order -= 1
      return item
    })
}
