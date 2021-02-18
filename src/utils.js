export const classnames = function (namesArray) {
  return namesArray
    .filter((v) => v != "")
    .join(" ")
    .trim();
};

export const logStickerbook = function ({ background, stickers }) {
  if (!background && !stickers) {
    console.log("No data provided");
    return;
  }

  const { image, alt, ...bg } = background;

  const string = JSON.stringify(
    {
      background: bg,
      stickers: stickers.map((sticker) => {
        const { image, key, position, alt, ...props } = sticker;

        return {
          ...props,
          position: {
            x: position?.x,
            y: position?.y,
          },
        };
      }),
    },
    null,
    2
  );

  console.log(
    "------------------------------------------\n",
    `${new Date().toLocaleString("en-CA")}\n`,
    "------------------------------------------\n",
    string,
    "\n------------------------------------------"
  );

  navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
    if (result.state == "granted" || result.state == "prompt") {
      navigator.clipboard.writeText(string).then(() => {
        console.log(`📋 Copied to clipboard`);
      });
    }
  });
};
