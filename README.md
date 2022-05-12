# preact-stickerbook

Easily create collage apps that are accessible by default.

### [Demo](https://codepen.io/team/wtc/pen/KKNvWdo)

<!-- toc -->

- [Basic usage](#basic-usage)
- [Stickerbook](#stickerbook)
  - [Props](#props)
    - [outputHeight](#outputHeight)
    - [outputWidth](#outputWidth)
    - [background](#background)
    - [foreground](#foreground)
    - [frame](#frame)
- [Sticker](#sticker)
  - [Props](#props-1)
    - [image](#image)
    - [alt](#alt)
    - [order](#order)
    - [initialScale](#initialScale)
    - [initialRotation](#initialRotation)
    - [initialPosition](#initialPosition)
    - [onDelete](#onDelete)
    - [onReorder](#onReorder)
    - [onPosition](#onPosition)
    - [onScale](#onScale)
    - [onRotate](#onRotate)
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
import { h, render } from "preact";
import Stickerbook, { Sticker } from "@wethegit/preact-stickerbook";

const App = () => {
  const stickers = [
    {
      key: "my-id-1",
      image: "https://media.giphy.com/media/10mgrhuEWNasNO/giphy.gif",
      order: 0,
    },
  ];

  return (
    <Stickerbook outputWidth={500} outputHeight={500}>
      {stickers.map((sticker) => (
        <Sticker {...sticker} />
      ))}
    </Stickerbook>
  );
};

render(<App />, document.body);
```

## Stickerbook

Your main artboard. Responsible for containing and providing the `Stickers` with a context and all the required references so they can properly scale.  
Apart from the `Stickers`, the `Stickerbook` can also have a `background`, `foreground` and a `frame`.

### Props

#### outputHeight

The height of your artboard.

`Integer` default `500`

#### outputWidth

The width of your artboard.

`Integer` default `500`

#### background

`Object` | **optional**

**image** | `String` - Path to an image, can also be a `base64` string or `blob` url.  
**alt** | `String` default `""` - Alternate text.  
**type** | `String` - A `background` can be of two types:

- `scene`: behaves like `background-size: cover`
- `pattern`: repeats until it fills the artboard.

```js
{
  image: "path-to/background.jpg",
  type: "scene",
  alt: "A paper crumble texture"
}
```

#### foreground

`foreground` will appear be on top of all `Sticker`s.

`Object` | **optional**

**image** | `String` - Path to an image, can also be a `base64` string or `blob` url.  
**alt** | `String` default `""` - Alternate text.

```js
{
  image: "path-to/foreground.png",
  alt: "My company's logo"
}
```

#### frame

`frame` will appear on top of `background` but behind `Sticker`s. Useful for borders.

`Object` | **optional**

**image** | `String` - Path to an image, can also be a `base64` string or `blob` url.  
**alt** | `String` default `""` - Alternate text.

```js
{
  image: "path-to/border.png",
  alt: "Ornate painting-like frame"
}
```

#### stickerModifiers

`stickerModifiers` allows you to pass an Array of variants ("modifiers") for your image-based sticker assets. This will append a control button to the sticker, which will allow the user to cycle through the available modifiers.

`Array` | **optional**

Each Array item must be an `Object` containing the following properties:  
**controlStyle** | `Object` - the values with which to style to the Sticker's modifier control button.  
**fileSuffix** | `String` - the specific filename suffix for this modifier item's image asset. For example, if your image's filename is `my-sticker-blue.png`, the suffix should be `-blue`.

```js
[
  { controlStyle: { backgroundColor: "#ff0000" }, fileSuffix: "-red" },
  { controlStyle: { backgroundColor: "#ffc700" }, fileSuffix: "-yellow" },
  { controlStyle: { backgroundColor: "#00ffff" }, fileSuffix: "-blue" },
];
```

## Sticker

All of the elements that form the collage. At the very minimum a sticker element MUST have:

- **key**: A unique identifier. An easy way to get a unique key is by using `Date.now()`. This is require to avoid rendering and reordering issues.
- **image**: Path to a image, can be a `base64` string or a `blob` url.
- **order**: the order of the element on the DOM, think `z-index`.

```js
const sticker = {
  key: "sticker-d47s7@##s",
  image: "path-to/image.png",
  order: 0,
};
```

### Props

#### image

Path to an image, can also be a `base64` string or `blob` url.

`String`

#### alt

Alternate text.

`String` default `""`

#### order

Order represents the `z-index` of the element on the `DOM`.

`Integer` default `0`

#### initialScale

Initial **scale** value of the sticker when it's first mounted.  
This is similar to [css scale()](<https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale()>) but it doesn't take `x` and `y` just a single value.

`Float|null` | **optional**

#### initialRotation

Initial **rotation** value of the sticker when it's first mounted.  
The value needs to be a [valid css](https://developer.mozilla.org/en-US/docs/Web/CSS/angle) `<angle>` in **radians** but without the unit notation.

`Float|null` | **optional**

#### initialPosition

Initial **position** value of the sticker when it's first mounted.  
The value needs to be a `Vec2` instance from the [wtc-math](https://github.com/wethegit/wtc-math) library.

`Vec2|null` | **optional**

#### defaultScale

If no `initialScale` is provided `defaultScale` will be used.

`number` default `0.3` | **optional**

#### onDelete

A callback function to be called when the delete button is clicked.  
It's importante to note that if no function is provided, then there _delete_ button **won't show**.  
**Note:** use the [deleteSticker](#deleteSticker) helper function.

`Function` | **optional**

```jsx
import Stickerbook, { Sticker } from "@wethegit/preact-stickerbook";
import { deleteSticker } from "@wethegit/preact-stickerbook/helpers";

const App = () => {
  const [stickers, setStickers] = useState([
    /* your stickers */
  ]);

  return (
    <Stickerbook>
      {stickers.map((sticker, index) => (
        <Sticker
          {...sticker}
          onDelete={() => {
            setStickers((stickers) => deleteSticker(stickers, index));
          }}
        />
      ))}
    </Stickerbook>
  );
};
```

#### onReorder

A callback function to be called when the `Sticker` _should_ change its _order_.  
This function receives two arguments indicating the **direction** as a `string` and a `boolean` indicating if `Sticker` should be brought before or after all the others.  
Leaving this empty won't reorder the stickers when they are focused.  
**Note:** use the [reorderSticker](#reorderSticker) helper function.

`Function` | **optional**

```jsx
import Stickerbook, { Sticker } from "@wethegit/preact-stickerbook";
import { reorderSticker } from "@wethegit/preact-stickerbook/helpers";

const App = () => {
  const [stickers, setStickers] = useState([
    /* your stickers */
  ]);

  return (
    <Stickerbook>
      {stickers.map((sticker, index) => (
        <Sticker
          {...sticker}
          onDelete={(direction, extreme) => {
            setStickers((stickers) =>
              reorderSticker({ direction, extreme, stickers, index })
            );
          }}
        />
      ))}
    </Stickerbook>
  );
};
```

#### onPosition

A callback function to be called when the _position_ of the `Sticker` changed.  
**Note:** use the [patchSticker](#patchSticker) helper function.

`Function` | **optional**

```jsx
import Stickerbook, { Sticker } from "@wethegit/preact-stickerbook";
import { patchSticker } from "@wethegit/preact-stickerbook/helpers";

const App = () => {
  const [stickers, setStickers] = useState([
    /* your stickers */
  ]);

  return (
    <Stickerbook>
      {stickers.map((sticker, index) => (
        <Sticker
          {...sticker}
          onPosition={(value) => {
            setStickers((stickers) =>
              patchSticker({ stickers, prop: "position", value, index })
            );
          }}
        />
      ))}
    </Stickerbook>
  );
};
```

#### onScale

A callback function to be called when the _scale_ of the `Sticker` changed.  
**Note:** use the [patchSticker](#patchSticker) helper function.

`Function` | **optional**

```jsx
import Stickerbook, { Sticker } from "@wethegit/preact-stickerbook";
import { patchSticker } from "@wethegit/preact-stickerbook/helpers";

const App = () => {
  const [stickers, setStickers] = useState([
    /* your stickers */
  ]);

  return (
    <Stickerbook>
      {stickers.map((sticker, index) => (
        <Sticker
          {...sticker}
          onScale={(value) => {
            setStickers((stickers) =>
              patchSticker({ stickers, prop: "scale", value, index })
            );
          }}
        />
      ))}
    </Stickerbook>
  );
};
```

#### onRotate

A callback function to be called when the _rotation_ of the `Sticker` changed.  
**Note:** use the [patchSticker](#patchSticker) helper function.

`Function` | **optional**

```jsx
import Stickerbook, { Sticker } from "@wethegit/preact-stickerbook";
import { patchSticker } from "@wethegit/preact-stickerbook/helpers";

const App = () => {
  const [stickers, setStickers] = useState([
    /* your stickers */
  ]);

  return (
    <Stickerbook>
      {stickers.map((sticker, index) => (
        <Sticker
          {...sticker}
          onRotate={(value) => {
            setStickers((stickers) =>
              patchSticker({ stickers, prop: "rotation", value, index })
            );
          }}
        />
      ))}
    </Stickerbook>
  );
};
```

## Helpers

### exportStickerbook

Returns a representation of the stickerbook in the chosen `format`.

`async Function`

**options** | `Object`  
**options.canvas** | `HTMLCanvasElement` | **optional** - A canvas element to draw to.  
**options.background** | `Object` | **optional** - A valid [`background`](#background) object.  
**options. frame** | `Object` | **optional** - A valid [`frame`](#frame) object.  
**options. foreground** | `Object` | **optional** - A valid [`foreground`](#foreground) object.  
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
**options.index** | `Integer` - The index of the sticker on the array that will be reordered.  
**options.direction** | `String` default `"up"` - The order in which to move the sticker.  
**options.extreme** | `Boolean` default `false` - If it should be brought to the edges of the array.  
**options.stickers** | `Array` default `[]` - An array of valid [`sticker`](#sticker) objects.

```jsx
import Stickerbook, { Sticker } from "@wethegit/preact-stickerbook";
import { reorderSticker } from "@wethegit/preact-stickerbook/helpers";

const App = () => {
  const [stickers, setStickers] = useState([
    /* your stickers */
  ]);

  return (
    <Stickerbook>
      {stickers.map((sticker, index) => (
        <Sticker
          {...sticker}
          onDelete={(direction, extreme) => {
            setStickers((stickers) =>
              reorderSticker({ direction, extreme, stickers, index })
            );
          }}
        />
      ))}
    </Stickerbook>
  );
};
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
**index** | `Integer` - The index of the sticker on the array that will be reordered.

### patchSticker

Returns a copy of the provided `stickers` array without the selected sticker.

`Function`

**options** | `Object`  
**options.stickers** | `Array` - An array of valid [`sticker`](#sticker)  
**options.index** | `Integer` - The index of the sticker on the array that will be reordered.  
**options.value** | **optional** - The new value.  
**options.prop** | `String` - The prop to be updated. Can be one of the folllwing:

- position
- scale
- rotation
