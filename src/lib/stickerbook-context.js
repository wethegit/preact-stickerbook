import { createContext } from "preact";

// if in the future we have the need to have two
// stickerbook components rendering, I think
// we might be able to make this a scoped function
export const StickerbookContext = createContext();