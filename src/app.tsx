import { h } from "preact"
import { useState, useRef, useCallback } from "preact/hooks"

import { Sticker, Stickerbook } from "./lib"
import { addSticker, exportStickerbook } from "./lib/helpers"

import backgroundImage from "./background.jpg"
import backgroundImage2 from "./background-2.png"
import frameImage from "./frame.png"
import foregroundImage from "./foreground.png"
import foregroundImage2 from "./foreground-2.png"
import stickerImage from "./sticker.png"

import { useStickerbook } from "./lib/use-stickerbook"

const CANVAS_SIZE = {
  width: 500,
  height: 500,
}

const GIPHY_API_URL = new URL("https://api.giphy.com/v1/stickers/random")

GIPHY_API_URL.search = new URLSearchParams({
  api_key: "a8s5d1Dw5bitDbTPHgVHVfaYv0cRAQf8",
}).toString()

export function App() {
  const {
    stickers,
    setStickers,
    backgrounds,
    foregrounds,
    frame,
    onReorderSticker,
    onDeleteSticker,
    onPositionSticker,
    onScaleSticker,
    onRotateSticker,
  } = useStickerbook({
    initialStickers: [
      {
        id: "my-id-1",
        image: stickerImage,
        order: 0,
      },
    ],
    initialFrame: {
      image: frameImage,
    },
    initialBackgrounds: [
      {
        image: backgroundImage,
        type: "scene",
      },
      {
        image: backgroundImage2,
        type: "scene",
      },
    ],
    initialForegrounds: [
      {
        image: foregroundImage,
      },
      {
        image: foregroundImage2,
      },
    ],
  })

  const downloadRef = useRef<HTMLAnchorElement | null>(null)

  const [hidden, setHidden] = useState(false)

  const onAddSticker = useCallback(async () => {
    const res = await fetch(GIPHY_API_URL).then((res) => res.json())
    const {
      data: {
        images: {
          preview_gif: { url },
        },
        caption,
      },
    } = res

    setStickers((stickers) =>
      addSticker(stickers, { image: url, alt: caption })
    )
  }, [setStickers])

  // Download
  const onClickDownload = async (e: Event) => {
    e.preventDefault()

    const downloadLink = downloadRef.current

    if (!downloadLink) return

    const newUrl = await exportStickerbook<"image">({
      outputWidth: CANVAS_SIZE.width,
      outputHeight: CANVAS_SIZE.height,
      stickers,
      backgrounds,
      frame,
      foregrounds,
      format: "image",
    })

    downloadLink.href = newUrl
    downloadLink.click()
  }

  return (
    <>
      <button onClick={onAddSticker}>Add random sticker from GIPHY</button>

      <button onClick={onClickDownload}>Download</button>

      <a ref={downloadRef} hidden={true} href="#" download="Stickerbook.png" />

      {/* Toggle button for testing re-renders */}
      <button onClick={() => setHidden((state) => !state)}>
        {hidden ? "show" : "hide"} stickerbook
      </button>

      {!hidden && (
        <div
          style={Object.entries(CANVAS_SIZE).reduce((acc, [key, val]) => {
            return { ...acc, [`max-${key}`]: `${val}px` }
          }, {})}
        >
          <Stickerbook
            outputWidth={CANVAS_SIZE.width}
            outputHeight={CANVAS_SIZE.height}
            backgrounds={backgrounds}
            frame={frame}
            foregrounds={foregrounds}
          >
            {stickers.map((sticker) => (
              <Sticker
                key={sticker.id}
                initialPosition={sticker.position}
                initialRotation={sticker.rotation}
                initialScale={sticker.scale}
                onReorder={onReorderSticker}
                onDelete={onDeleteSticker}
                onPosition={onPositionSticker}
                onScale={onScaleSticker}
                onRotate={onRotateSticker}
                disableRotation={sticker.disableRotation}
                {...sticker}
              />
            ))}
          </Stickerbook>
        </div>
      )}

      <a href="https://giphy.com/" target="_blank" rel="noreferrer">
        <img
          src="https://media.giphy.com/media/3o6gbbuLW76jkt8vIc/giphy.gif"
          alt="Powered By GIPHY"
          width="100"
        />
      </a>
    </>
  )
}
