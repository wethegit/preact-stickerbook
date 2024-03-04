# preact-stickerbook

Easily create collage apps that are accessible by default.

### [Demo](https://codepen.io/team/wtc/pen/KKNvWdo)

### Local development

To run and test the library localy, simply:

1. Clone the repo: `git clone git@github.com:wethegit/preact-stickerbook.git`
2. Install dependencies: `npm i`
3. Start the dev server: `npm run dev`

<!-- toc -->

- [Basic usage](#basic-usage)
- [Stickerbook](#stickerbook)
  - [Props](#props)
- [Sticker](#sticker)
  - [Props](#props-1)
- [useStickerbook](#usestickerbook)
  - [Props](#props-2)
  - [Return](#return)
- [Helpers](#helpers)
  - [exportStickerbook](#exportStickerbook)
  - [reorderSticker](#reorderSticker)
  - [addSticker](#addSticker)
  - [deleteSticker](#deleteSticker)
  - [patchSticker](#patchSticker)

<!-- tocstop -->

## Basic usage

This is the most simplistic way of using it, it's an artboard with the stickers. No fuzz.

Most likely you will want more control, you will want to generate downloads, add and remove stickers, and more. Check out the full demo on [Codepen](https://codepen.io/team/wtc/pen/KKNvWdo) and also the complete implementation in the [Playground](./src/app.tsx).

```jsx
import { h, render } from "preact"
import { Stickerbook, Sticker } from "@wethegit/preact-stickerbook"

const App = () => {
  const stickers = [
    {
      id: "my-id-1",
      image: "https://media.giphy.com/media/10mgrhuEWNasNO/giphy.gif",
      order: 0,
    },
  ]

  return (
    <Stickerbook outputWidth={500} outputHeight={500}>
      {stickers.map(({ id, ...sticker }) => (
        <Sticker key={id} id={id} {...sticker} />
      ))}
    </Stickerbook>
  )
}

render(<App />, document.body)
```

## Stickerbook

Your main artboard. Responsible for containing and providing the `Stickers` with a context and all the required references so they can properly scale and translate.
Apart from the `Stickers`, the `Stickerbook` can also have `background`s, `foreground`s and a `frame`.

### Props

**Type:** [StickerbookProps](https://github.com/wethegit/preact-stickerbook/blob/2782bb9616dbd9e1b6892d1f98d94afd7fcc67c5/src/lib/types.ts#L57)

## Sticker

All of the elements that form the collage.

### Props

**Type:** [StickerProps](https://github.com/wethegit/preact-stickerbook/blob/2782bb9616dbd9e1b6892d1f98d94afd7fcc67c5/src/lib/types.ts#L121).

## useStickerbook

A hook that provides the `Stickerbook` context and all the handlers to manipulate the stickers.

### Props

**Type:** [UseStickerbookProps](https://github.com/wethegit/preact-stickerbook/blob/6115c2c137e31a2edc77fdaa13bab406677552a9/src/lib/types.ts#L166)

### Return

**Type:** [UseStickerbookReturn](https://github.com/wethegit/preact-stickerbook/blob/97fc311412a0299dc9fc632a796b94f618ae4472/src/lib/types.ts#L173)

## Helpers

### exportStickerbook

Returns a representation of the stickerbook in the chosen `format`.

**Type:** [ExportStickerbookOptions](https://github.com/wethegit/preact-stickerbook/blob/6115c2c137e31a2edc77fdaa13bab406677552a9/src/lib/helpers/exportStickerbook.ts#L47)

### reorderSticker

Returns a reordered copy of the provided `stickers` array.

**Type:** [ReorderStickerOptions](https://github.com/wethegit/preact-stickerbook/blob/6115c2c137e31a2edc77fdaa13bab406677552a9/src/lib/helpers/reorderSticker.ts#L3)

### addSticker

Returns a copy of the provided `stickers` array with the new sticker containing the required required **id** and **id** fields.

**Type:** [AddStickerOptions](https://github.com/wethegit/preact-stickerbook/blob/97fc311412a0299dc9fc632a796b94f618ae4472/src/lib/helpers/addSticker.ts#L3)

### deleteSticker

Returns a copy of the provided `stickers` array without the selected sticker.

**Type:** [DeleteStickerOptions](https://github.com/wethegit/preact-stickerbook/blob/6115c2c137e31a2edc77fdaa13bab406677552a9/src/lib/helpers/deleteSticker.ts#L3)

### patchSticker

Returns a copy of the provided `stickers` array with the updated ("patched") sticker in place.

**Type:** [PatchStickerOptions](https://github.com/wethegit/preact-stickerbook/blob/6115c2c137e31a2edc77fdaa13bab406677552a9/src/lib/helpers/patchSticker.ts#L4)
