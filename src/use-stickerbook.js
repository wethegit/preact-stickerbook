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
  background: backgroundState,
  frame: frameState,
  stickers: stickersState,
  foreground: foregroundState,
}) {
  if (!backgroundState && !frameState && !stickersState && !foregroundState)
    return {};

  const setBackground = backgroundState && backgroundState[1];
  const setFrame = frameState && frameState[1];
  const [stickers, setStickers] = stickersState || [];
  const setForeground = foregroundState && foregroundState[1];

  const onChangeBackground = function (item) {
    if (!setBackground) return;

    setBackground((cur) => revokeAndUpdate(cur, item));
  };

  const onChangeFrame = function (item) {
    if (!setFrame) return;

    setFrame((cur) => revokeAndUpdate(cur, item));
  };

  const onChangeForeground = function (item) {
    if (!setForeground) return;

    setForeground((cur) => revokeAndUpdate(cur, item));
  };

  // Sticker actions
  const _onPropUpdate = function (prop, value, index) {
    if (
      !setStickers ||
      !stickers ||
      !stickers[index] ||
      stickers[index][prop] === value
    )
      return;

    setStickers((stickers) => matchAndUpdate({ stickers, value, index, prop }));
  };

  const onAddSticker = function (item) {
    if (!setStickers) return;
    setStickers((cur) => addSticker(cur || [], item));
  };

  const onDeleteSticker = function (index) {
    if (!setStickers) return;
    setStickers((cur) => deleteSticker(cur, index));
  };

  const onReorderSticker = function (opts) {
    if (!setStickers) return;

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
