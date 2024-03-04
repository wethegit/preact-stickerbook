export const ORDER_DIRECTIONS = ["up", "down"] as const

/**
 * The types of overlays that can be used in the Stickerbook
 * `scene` - a full-size image that covers the entire Stickerbook. Behaves like `background-size: cover`
 * `pattern` - a repeating image that covers the entire Stickerbook.
 */
export const OVERLAY_TYPES = ["scene", "pattern"] as const

export const EXPORT_FORMATS = ["image", "canvas", "blob"] as const
