import { ComponentChildren } from "preact"
import type { Vec2 } from "wtc-math"

import { EXPORT_FORMATS, ORDER_DIRECTIONS, OVERLAY_TYPES } from "./helpers"
import { StateUpdater } from "preact/hooks"

export interface StickerItem {
  /**
   * This is require to avoid rendering and reordering issues.
   */
  id: string
  /**
   * Path to a image, can be a `base64` string or a `blob` url.
   */
  image: string
  /**
   * The order of the element on the DOM, think `z-index`.
   */
  order: number
  position?: Vec2
  rotation?: number
  scale?: number
  /**
   * If `true`, the user can't rotate the sticker.
   */
  disableRotation?: boolean
  alt?: string
}

export interface Overlay {
  /**
   * Path to an image, can also be a `base64` string or `blob` url.
   */
  image: string
  alt?: string
}

export type OverlayType = (typeof OVERLAY_TYPES)[number]

export interface BackgroundDimensions {
  width: number
  height: number
}

export interface BackgroundDetailsReducer {
  index: number
  dimensions: BackgroundDimensions
}

export interface BackgroundItem extends Overlay {
  /**
   * The types of overlays that can be used in the Stickerbook
   * `scene` - a full-size image that covers the entire Stickerbook. Behaves like `background-size: cover`
   * `pattern` - a repeating image that covers the entire Stickerbook.
   */
  type?: OverlayType
}

export type ForegroundItem = Overlay

export type Frame = Overlay

export interface StickerbookProps {
  backgrounds?: BackgroundItem[]
  /**
   * `foregrounds` will appear on top of all `Sticker`s.
   */
  foregrounds?: ForegroundItem[]
  /**
   * The `frame` will appear on top of all the `background`s but behind all the `Sticker`s. Useful for borders.
   */
  frame?: Frame
  /**
   * The height of your artboard.
   */
  outputHeight?: number
  /**
   * The width of your artboard.
   */
  outputWidth?: number
  children?: ComponentChildren
  className?: string
}

export interface StickerbookDimensions {
  width: number
  height: number
  percentageShift: number
  rendered: boolean
}

export interface StickerbookContextProps {
  parentRef: HTMLDivElement | null
  mainRef: HTMLDivElement | null
  position: Vec2 | undefined
  dimensions: StickerbookDimensions
}

/**
 * The types of overlays that can be used in the Stickerbook
 * `scene` - a full-size image that covers the entire Stickerbook. Behaves like `background-size: cover`
 * `pattern` - a repeating image that covers the entire Stickerbook.
 */
export type ExportFormat = (typeof EXPORT_FORMATS)[number]

export type Timeout = ReturnType<typeof setTimeout>

export type OrderDirection = (typeof ORDER_DIRECTIONS)[number]

export type OnDeleteHandler = (id: string) => void

export type OnReorderHandler = (
  direction: OrderDirection,
  /**
   * If `true` the `Sticker` will be brought to the front or back of the stack, depending on the `direction`.
   */
  multiple: boolean,
  id: string
) => void

export type OnPositionHandler = (position: Vec2, id: string) => void

export type OnScaleHandler = (scale: number, id: string) => void

export type OnRotateHandler = (rotation: number, id: string) => void

export type OnAddStickerHandler = (newSticker: {
  image: string
  alt?: string
}) => void

export interface StickerProps extends StickerItem {
  /**
   * Initial **scale** value of the sticker when it's first mounted.
   * This is similar to [css scale()](<https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale()>) but it doesn't take `x` and `y` just a single value.
   */
  initialScale?: number
  /**
   * Initial **rotation** value of the sticker when it's first mounted.
   * The value needs to be a [valid css](https://developer.mozilla.org/en-US/docs/Web/CSS/angle) `<angle>` in **radians** but without the unit notation.
   */
  initialRotation?: number
  /**
   * Initial **position** value of the sticker when it's first mounted.
   * The value needs to be a `Vec2` instance from the [wtc-math](https://github.com/wethegit/wtc-math) library.
   */
  initialPosition?: Vec2
  /**
   * If no `initialScale` is provided `defaultScale` will be used.
   */
  defaultScale?: number
  /**
   * A callback function to be called when the _delete_ control button is clicked.
   * It's importante to note that if no function is provided, the _delete_ button **won't show**.
   */
  onDelete?: OnDeleteHandler
  /**
   * A callback function to be called when the `Sticker` _should_ change its _order_.
   * Leaving this empty won't reorder the stickers when they are focused.r function.
   */
  onReorder?: OnReorderHandler
  /**
   * A callback function to be called when the _position_ of the `Sticker` changed.
   */
  onPosition?: OnPositionHandler
  /**
   * A callback function to be called when the _scale_ of the `Sticker` changed.
   */
  onScale?: OnScaleHandler
  /**
   * A callback function to be called when the _rotation_ of the `Sticker` changed.
   */
  onRotate?: OnRotateHandler
  className?: string
}

export interface UseStickerbookProps {
  initialStickers?: StickerItem[]
  initialBackgrounds?: BackgroundItem[]
  initialFrame?: Frame
  initialForegrounds?: ForegroundItem[]
}

export interface UseStickerbookReturn {
  stickers: StickerItem[]
  setStickers: StateUpdater<StickerItem[]>
  backgrounds: BackgroundItem[]
  setBackgrounds: StateUpdater<BackgroundItem[]>
  frame: Frame | undefined
  setFrame: StateUpdater<Overlay | undefined>
  foregrounds: ForegroundItem[]
  setForegrounds: StateUpdater<ForegroundItem[]>

  onReorderSticker: OnReorderHandler
  onDeleteSticker: OnDeleteHandler
  onPositionSticker: OnPositionHandler
  onScaleSticker: OnScaleHandler
  onRotateSticker: OnRotateHandler
  onAddSticker: OnAddStickerHandler
}
