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
  - [Returns](#returns)
- [Helpers](#helpers)
  - [exportStickerbook](#exportStickerbook)
  - [reorderSticker](#reorderSticker)
  - [addSticker](#addSticker)
  - [deleteSticker](#deleteSticker)
  - [patchSticker](#patchSticker)

<!-- tocstop -->

## Basic usage

This is the most simplistic way of using it, it's an artboard with the stickers. No fuzz.
Most likely you will want more control, you will want to generate downloads, add and remove stickers, and more. Check out the full demo on [Codepen](https://codepen.io/team/wtc/pen/KKNvWdo).

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
      {stickers.map((sticker) => (
        <Sticker {...sticker} />
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

[`StickerbookProps`](https://github.com/wethegit/preact-stickerbook/blob/2782bb9616dbd9e1b6892d1f98d94afd7fcc67c5/src/lib/types.ts#L42)

## Sticker

All of the elements that form the collage.

### Props

[`StickerProps`](https://github.com/wethegit/preact-stickerbook/blob/2782bb9616dbd9e1b6892d1f98d94afd7fcc67c5/src/lib/types.ts#L104).

## Helpers

### exportStickerbook

Returns a representation of the stickerbook in the chosen `format`.

`async Function`

**options** | `Object`
**options.canvas** | `HTMLCanvasElement` | **optional** - A canvas element to draw to.
**options.backgrounds** | `Array` | **optional** - An array of valid [`background`](#backgrounds) objects.
**options.frame** | `Object` | **optional** - A valid [`frame`](#frame) object.
**options.foregrounds** | `Object` | **optional** - An array of valid [`foreground`](#foregrounds) objects.
**options.stickers** | `Array` | **optional** - An array of valid [`sticker`](#sticker) objects.
**options.outputWidth** | `Integer` default `500` - Output width.
**options.outputHeight** | `Integer` default `500` - Output height.
**options.format** | `String` default `"image"` - The returned value. Can be one of the following:

- **image**: Will generate a url using `window.URL.createObjectURL`
- **canvas**: Will just return the provided `canvas` or a new one
- **blob**: Will return a `Blob` using `HTMLCanvasElement.toBlob()`

```jsx
import { exportStickerbook } from "@wethegit/preact-stickerbook/helpers";

const App = () => {
  const [stickers, setStickers] = useState([
    /* your stickers */
  ]);

  const getDownloadUrl = async (e) => {
    e.preventDefault();

    const newUrl = await exportStickerbook({
      stickers,
    });

    e.currentTarget.href = newUrl;
    e.currentTarget.click();
  };

  return (
    {/* your app */}
    <a href="#" download="Stickerbook.png" onClick={getDownloadUrl}>Download</a>
  )
}
```

### reorderSticker

Returns a reordered copy of the provided `stickers` array.

`Function`

**options** | `Object`
**options.id** | `String|Number` - The id of the sticker that will be reordered within the stickers array.
**options.direction** | `String` default `"up"` - The order in which to move the sticker.
**options.extreme** | `Boolean` default `false` - If it should be brought to the edges of the array.
**options.stickers** | `Array` default `[]` - An array of valid [`sticker`](#sticker) objects.

```jsx
import Stickerbook, { Sticker } from "@wethegit/preact-stickerbook"
import { reorderSticker } from "@wethegit/preact-stickerbook/helpers"

const App = () => {
  const [stickers, setStickers] = useState([
    /* your stickers */
  ])

  return (
    <Stickerbook>
      {stickers.map((sticker, index) => (
        <Sticker
          {...sticker}
          onReorder={(direction, extreme, id) => {
            setStickers((stickers) =>
              reorderSticker({ id, direction, extreme, stickers })
            )
          }}
        />
      ))}
    </Stickerbook>
  )
}
```

### addSticker

Returns a copy of the provided `stickers` array with the new sticker containing the required required **key** and **order** fields.

`Function`

**stickers** | `Array` | **optional** - An array of valid [`sticker`](#sticker) objects.
**sticker** | `Object` - A valid [`sticker`](#sticker) object. Note **key** and **order** will be overwritten.

### deleteSticker

Returns a copy of the provided `stickers` array without the selected sticker.

`Function`

**stickers** | `Array` - An array of valid [`sticker`](#sticker) objects.
**id** | `String|Number` - The id of the sticker that will be deleted from the stickers array.

### patchSticker

Returns a copy of the provided `stickers` array with the updated ("patched") sticker in place.

`Function`

**options** | `Object`
**options.stickers** | `Array` - An array of valid [`sticker`](#sticker)
**options.id** | `String|Number` - The id of the sticker that will be amended within the stickers array.
**options.value** | **optional** - The new value.
**options.prop** | `String` - The prop to be updated. Can be one of the folllwing:

- position
- scale
- rotation
