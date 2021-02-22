import { reorderSticker, addSticker, deleteSticker } from "./helpers";

export default function useStickerbook({
  stickers: [stickers, setStickers],
  background: [background, setBackground],
  foreground: [foreground, setForeground],
}) {
  const onChangeForeground = function (item) {
    setForeground((cur) => {
      if (cur && cur.image.includes("blob:"))
        window.URL.revokeObjectURL(cur.image);
      return item;
    });
  };

  const onChangeBackground = function (item) {
    setBackground((cur) => {
      if (cur && cur.image.includes("blob:"))
        window.URL.revokeObjectURL(cur.image);
      return item;
    });
  };

  // Sticker actions
  const onAddSticker = function (item) {
    setStickers((cur) => addSticker(cur, item));
  };

  const onDeleteSticker = function (index) {
    setStickers((cur) => deleteSticker(cur, index));
  };

  const onReorderSticker = function (opts) {
    setStickers((stickers) => reorderSticker({ ...opts, stickers }));
  };

  const onPositionSticker = function (value, index) {
    if (stickers[index].position === value) return;

    setStickers((cur) =>
      cur.map((item, i) => {
        if (i === index) item.position = value;
        return item;
      })
    );
  };

  const onScaleSticker = function (value, index) {
    if (stickers[index].scale === value) return;

    setStickers((cur) =>
      cur.map((item, i) => {
        if (i === index) item.scale = value;
        return item;
      })
    );
  };

  const onRotateSticker = function (value, index) {
    if (stickers[index].rotation === value) return;

    setStickers((cur) =>
      cur.map((item, i) => {
        if (i === index) item.rotation = value;
        return item;
      })
    );
  };

  return {
    onChangeBackground,
    onChangeForeground,
    onAddSticker,
    onDeleteSticker,
    onPositionSticker,
    onScaleSticker,
    onReorderSticker,
    onRotateSticker,
  };
}
