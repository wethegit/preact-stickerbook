import { reorderSticker, addSticker, deleteSticker } from "./helpers";

const revokeAndUpdate = function (previous, next) {
  if (previous && previous.image.includes("blob:"))
    window.URL.revokeObjectURL(previous.image);
  return next;
};

const matchAndUpdate = function ({ stickers, index, prop, value }) {
  return stickers.map((item, i) => {
    if (i === index) item[prop] = value;
    return item;
  });
};

export default function useStickerbook({
  background: [background, setBackground],
  frame: [frame, setFrame],
  stickers: [stickers, setStickers],
  foreground: [foreground, setForeground],
}) {
  const onChangeBackground = function (item) {
    setBackground((cur) => revokeAndUpdate(cur, item));
  };

  const onChangeFrame = function (item) {
    setFrame((cur) => revokeAndUpdate(cur, item));
  };

  const onChangeForeground = function (item) {
    setForeground((cur) => revokeAndUpdate(cur, item));
  };

  // Sticker actions
  const _onPropUpdate = function (prop, value, index) {
    if (stickers[index][prop] === value) return;

    setStickers((stickers) => matchAndUpdate({ stickers, value, index, prop }));
  };

  const onAddSticker = function (item) {
    setStickers((cur) => addSticker(cur || [], item));
  };

  const onDeleteSticker = function (index) {
    setStickers((cur) => deleteSticker(cur, index));
  };

  const onReorderSticker = function (opts) {
    setStickers((stickers) =>
      reorderSticker({ ...opts, stickers: stickers || [] })
    );
  };

  const onPositionSticker = function (index, value) {
    _onPropUpdate("position", value, index);
  };

  const onScaleSticker = function (index, value) {
    _onPropUpdate("scale", value, index);
  };

  const onRotateSticker = function (index, value) {
    _onPropUpdate("rotation", value, index);
  };

  return {
    onChangeBackground,
    onChangeFrame,
    onChangeForeground,
    onAddSticker,
    onDeleteSticker,
    onPositionSticker,
    onScaleSticker,
    onReorderSticker,
    onRotateSticker,
  };
}
