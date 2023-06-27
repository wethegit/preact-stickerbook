import { useState, useRef, useCallback } from 'preact/hooks'

import { Sticker, Stickerbook } from './lib'
import {
  addSticker,
  reorderSticker,
  deleteSticker,
  patchSticker,
  exportStickerbook,
} from './lib/helpers'

import backgroundImage from './background.jpg'
import backgroundImage2 from './background-2.png'
import frameImage from './frame.png'
import foregroundImage from './foreground.png'
import stickerImage from './sticker.png'

const CANVAS_SIZE = {
  width: 500,
  height: 500,
}

const GIPHY_API_URL = new URL('https://api.giphy.com/v1/stickers/random')

GIPHY_API_URL.search = new URLSearchParams({
  api_key: 'a8s5d1Dw5bitDbTPHgVHVfaYv0cRAQf8',
}).toString()

const BACKGROUNDS = [
  {
    image: backgroundImage,
  },
  {
    image: backgroundImage2,
  },
]

const FRAME = {
  image: frameImage,
}

const FOREGROUND = {
  image: foregroundImage,
}

export function App() {
  const [stickers, setStickers] = useState([
    {
      key: 'my-id-1',
      image: stickerImage,
      order: 0,
    },
  ])
  const downloadRef = useRef()

  // Sticker hooks
  const onReorderSticker = useCallback((direction, extreme, key) => {
    setStickers((stickers) =>
      reorderSticker({ key, direction, extreme, stickers })
    )
  }, [])

  const onDeleteSticker = useCallback((key) => {
    setStickers((stickers) => deleteSticker(stickers, key))
  }, [])

  const onPositionSticker = useCallback((value, key) => {
    setStickers((stickers) =>
      patchSticker({ stickers, prop: 'position', value, key })
    )
  }, [])

  const onScaleSticker = useCallback((value, key) => {
    setStickers((stickers) =>
      patchSticker({ stickers, prop: 'scale', value, key })
    )
  }, [])

  const onRotateSticker = useCallback((value, key) => {
    setStickers((stickers) =>
      patchSticker({ stickers, prop: 'rotation', value, key })
    )
  }, [])

  const onAddSticker = async () => {
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
  }

  // Download
  const onClickDownload = async (e) => {
    e.preventDefault()

    const downloadLink = downloadRef.current
    const newUrl = await exportStickerbook({
      outputWidth: CANVAS_SIZE.width,
      outputHeight: CANVAS_SIZE.height,
      stickers,
      background: BACKGROUNDS,
      frame: FRAME,
      foreground: FOREGROUND,
    })

    downloadLink.href = newUrl
    downloadLink.click()
  }
  console.log(stickers)
  return (
    <>
      <button onClick={onAddSticker}>Add random sticker from GIPHY</button>
      <button onClick={onClickDownload}>Download</button>
      <a ref={downloadRef} hidden="true" href="#" download="Stickerbook.png" />
      <div
        style={Object.entries(CANVAS_SIZE).reduce((acc, [key, val]) => {
          return { ...acc, [`max-${key}`]: `${val}px` }
        }, {})}
      >
        <Stickerbook
          outputWidth={CANVAS_SIZE.width}
          outputHeight={CANVAS_SIZE.height}
          background={BACKGROUNDS}
          frame={FRAME}
          foreground={FOREGROUND}
        >
          {stickers.map((sticker) => (
            <Sticker
              key={sticker.key}
              onReorder={onReorderSticker}
              onDelete={onDeleteSticker}
              onPosition={onPositionSticker}
              onScale={onScaleSticker}
              onRotate={onRotateSticker}
              {...sticker}
            />
          ))}
        </Stickerbook>
      </div>
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
