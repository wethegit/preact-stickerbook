import { createContext } from "preact"

import { StickerbookContextProps } from "./types"

// if in the future we have the need to have two
// stickerbook components rendering, I think
// we might be able to make this a scoped function
export const StickerbookContext = createContext<StickerbookContextProps | null>(
  null
)
