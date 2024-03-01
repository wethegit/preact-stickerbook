import { useCallback, useState } from "preact/hooks"

import type {
  BackgroundItem,
  ForegroundItem,
  Frame,
  OnAddStickerHandler,
  OnDeleteHandler,
  OnPositionHandler,
  OnReorderHandler,
  OnRotateHandler,
  OnScaleHandler,
  StickerItem,
  UseStickerbookProps,
} from "./types"

import {
  addSticker,
  deleteSticker,
  patchSticker,
  reorderSticker,
} from "./helpers"

export function useStickerbook({
  initialStickers = [],
  initialBackgrounds = [],
  initialForegrounds = [],
  initialFrame,
}: UseStickerbookProps) {
  const [stickers, setStickers] = useState<StickerItem[]>(initialStickers)

  const [backgrounds, setBackgrounds] =
    useState<BackgroundItem[]>(initialBackgrounds)

  const [frame, setFrame] = useState<Frame | undefined>(initialFrame)

  const [foregrounds, setForegrounds] =
    useState<ForegroundItem[]>(initialForegrounds)

  const onReorderSticker = useCallback<OnReorderHandler>(
    (direction, extreme, id) => {
      setStickers((stickers) =>
        reorderSticker({ id, direction, extreme, stickers })
      )
    },
    []
  )

  const onDeleteSticker = useCallback<OnDeleteHandler>((id) => {
    setStickers((stickers) => deleteSticker(stickers, id))
  }, [])

  const onPositionSticker = useCallback<OnPositionHandler>((value, id) => {
    setStickers((stickers) =>
      patchSticker({ stickers, prop: "position", value, id })
    )
  }, [])

  const onScaleSticker = useCallback<OnScaleHandler>((value, id) => {
    setStickers((stickers) =>
      patchSticker({ stickers, prop: "scale", value, id })
    )
  }, [])

  const onRotateSticker = useCallback<OnRotateHandler>((value, id) => {
    setStickers((stickers) =>
      patchSticker({ stickers, prop: "rotation", value, id })
    )
  }, [])

  const onAddSticker = useCallback<OnAddStickerHandler>((newSticker) => {
    setStickers((stickers) => addSticker(stickers, newSticker))
  }, [])

  return {
    stickers,
    setStickers,
    backgrounds,
    setBackgrounds,
    frame,
    setFrame,
    foregrounds,
    setForegrounds,

    onReorderSticker,
    onDeleteSticker,
    onPositionSticker,
    onScaleSticker,
    onRotateSticker,
    onAddSticker,
  }
}
