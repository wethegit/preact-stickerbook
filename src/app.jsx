import { useState, useRef } from 'preact/hooks'

import { Sticker, Stickerbook } from './lib'
import {
  addSticker,
  reorderSticker,
  deleteSticker,
  patchSticker,
  exportStickerbook,
} from './lib/helpers'

const CANVAS_SIZE = {
  width: 500,
  height: 500,
}

const GIPHY_API_URL = new URL('https://api.giphy.com/v1/stickers/random')

GIPHY_API_URL.search = new URLSearchParams({
  api_key: 'a8s5d1Dw5bitDbTPHgVHVfaYv0cRAQf8',
}).toString()

export function App() {
  const [stickers, setStickers] = useState([
    {
      key: 'my-id-1',
      image: 'https://media.giphy.com/media/10mgrhuEWNasNO/giphy.gif',
      order: 0,
    },
    {
      key: 'my-id-2',
      image: 'https://media.giphy.com/media/ao9DUiTKH60XS/giphy.gif',
      order: 1,
    },
  ])
  const downloadRef = useRef()

  // Sticker hooks
  const onReorderSticker = (opts) => {
    setStickers((stickers) => reorderSticker({ ...opts, stickers }))
  }

  const onDeleteSticker = (index) => {
    setStickers((stickers) => deleteSticker(stickers, index))
  }

  const onPositionSticker = (index, value) => {
    setStickers((stickers) =>
      patchSticker({ stickers, prop: 'position', value, index })
    )
  }

  const onScaleSticker = (index, value) => {
    setStickers((stickers) =>
      patchSticker({ stickers, prop: 'scale', value, index })
    )
  }

  const onRotateSticker = (index, value) => {
    setStickers((stickers) =>
      patchSticker({ stickers, prop: 'rotation', value, index })
    )
  }

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
    })

    downloadLink.href = newUrl
    downloadLink.click()
  }

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
        >
          {stickers.map((sticker, index) => (
            <Sticker
              key={sticker.key}
              onReorder={(direction, extreme) =>
                onReorderSticker({ index, direction, extreme })
              }
              onDelete={() => onDeleteSticker(index)}
              onPosition={(value) => onPositionSticker(index, value)}
              onScale={(value) => onScaleSticker(index, value)}
              onRotate={(value) => onRotateSticker(index, value)}
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
