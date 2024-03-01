import { h } from "preact"
import type { Vec2 } from "wtc-math"

import { EXPORT_FORMATS, ORDER_DIRECTIONS, OVERLAY_TYPES } from "./helpers"

export interface StickerItem {
  id: string
  image: string
  order: number
  position?: Vec2
  rotation?: number
  scale?: number
  disableRotation?: boolean
  alt?: string
}

export interface Overlay {
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
  type?: OverlayType
}

export type ForegroundItem = Overlay

export type Frame = Overlay

export interface StickerbookProps {
  backgrounds?: BackgroundItem[]
  foregrounds?: ForegroundItem[]
  frame?: Frame
  outputHeight?: number
  outputWidth?: number
  children?: h.JSX.Element
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

export type ExportFormat = (typeof EXPORT_FORMATS)[number]

export type Timeout = ReturnType<typeof setTimeout>

export type OrderDirection = (typeof ORDER_DIRECTIONS)[number]

export type OnDeleteHandler = (id: string) => void

export type OnReorderHandler = (
  direction: OrderDirection,
  multiple: boolean,
  id: string
) => void

export type OnPositionHandler = (position: Vec2, id: string) => void

export type OnScaleHandler = (scale: number, id: string) => void

export type OnRotateHandler = (rotation: number, id: string) => void

export interface StickerProps extends StickerItem {
  initialScale?: number
  initialRotation?: number
  initialPosition?: Vec2
  defaultScale?: number
  onDelete?: OnDeleteHandler
  onReorder?: OnReorderHandler
  onPosition?: OnPositionHandler
  onScale?: OnScaleHandler
  onRotate?: OnRotateHandler
  className?: string
}
