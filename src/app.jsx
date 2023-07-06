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
import foregroundImage2 from './foreground-2.png'
import stickerImage from './sticker.png'

const CANVAS_SIZE = {
  width: 1200,
  height: 680,
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

const FOREGROUNDS = [
  {
    image: foregroundImage,
  },
  {
    image: foregroundImage2,
  },
]

export function App() {
  const [stickers, setStickers] = useState([
    {
      id: 'my-id-1',
      image: stickerImage,
      order: 0,
    },
    // {
    //   id: 'my-id-2',
    //   position: { x: 0.3, y: 0.7 },
    //   image: stickerImage,
    //   order: 1,
    // },
  ])
  const downloadRef = useRef()
  const [hidden, setHidden] = useState(false)

  // Sticker hooks
  const onReorderSticker = useCallback((direction, extreme, id) => {
    console.log(stickers)
    setStickers((stickers) =>
      reorderSticker({ id, direction, extreme, stickers })
    )
  }, [])

  const onDeleteSticker = useCallback((id) => {
    setStickers((stickers) => deleteSticker(stickers, id))
  }, [])

  const onPositionSticker = useCallback((value, id) => {
    setStickers((stickers) =>
      patchSticker({ stickers, prop: 'position', value, id })
    )
  }, [])

  const onScaleSticker = useCallback((value, id) => {
    setStickers((stickers) =>
      patchSticker({ stickers, prop: 'scale', value, id })
    )
  }, [])

  const onRotateSticker = useCallback((value, id) => {
    setStickers((stickers) =>
      patchSticker({ stickers, prop: 'rotation', value, id })
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
      backgrounds: BACKGROUNDS,
      frame: FRAME,
      foregrounds: FOREGROUNDS,
    })

    downloadLink.href = newUrl
    downloadLink.click()
  }

  return (
    <>
      <button onClick={onAddSticker}>Add random sticker from GIPHY</button>
      <button onClick={onClickDownload}>Download</button>
      <a ref={downloadRef} hidden="true" href="#" download="Stickerbook.png" />
      <button
        onClick={() => {
          setHidden((state) => !state)
        }}
      >
        {hidden ? 'show' : 'hide'} stickerbook
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
            backgrounds={BACKGROUNDS}
            frame={FRAME}
            foregrounds={FOREGROUNDS}
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
