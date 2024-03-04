import type { Vec2 } from "wtc-math"
import type { StickerItem } from "../types"

type PatchStickerOptions = {
  stickers: StickerItem[]
  id: string
} & (
  | {
      prop: "scale" | "rotation"
      value: number
    }
  | {
      prop: "position"
      value: Vec2
    }
)

const PROPS = ["position", "scale", "rotation"] as const

export type PatchStickerProps = (typeof PROPS)[number]

export function patchSticker({
  stickers,
  prop,
  value,
  id,
}: PatchStickerOptions) {
  if (!stickers || !(stickers instanceof Array) || stickers.length <= 0)
    throw Error("`stickers` array is empty")

  const patchedSticker = stickers.find((sticker) => sticker.id === id)

  if (!id || !patchedSticker)
    throw Error("`id` needs to be a valid `sticker` id")

  const PROPS = ["position", "scale", "rotation"]

  if (!PROPS.includes(prop))
    throw Error(`Invalid 'prop'. 'prop' must be one of: ${PROPS.join(",")}`)

  return stickers.map((item) => {
    if (item === patchedSticker) {
      if (prop === "position") item[prop] = value
      else item[prop] = value
    }
    return item
  })
}
