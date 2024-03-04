import type { StickerItem } from "../types"

export function deleteSticker(
  stickers: StickerItem[],
  id: string
): StickerItem[] {
  if (!stickers || !(stickers instanceof Array) || stickers.length <= 0)
    throw Error("`stickers` array is empty")

  const [filteredStickers, deletedSticker] = stickers.reduce<
    [StickerItem[], StickerItem | null]
  >(
    (acc, s) => {
      if (s.id !== id) acc[0].push(s)
      else acc[1] = s

      return acc
    },
    [[], null]
  )
  if (!id || !deletedSticker)
    throw Error("`id` needs to be a valid `sticker` id")

  return filteredStickers.map((item) => {
    // fix the order
    if (item.order > deletedSticker.order) item.order -= 1
    return item
  })
}
