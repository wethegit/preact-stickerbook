import { Sticker, Stickerbook } from './lib'

export function App() {
  const stickers = [
    {
      key: 'my-id-1',
      image: 'https://media.giphy.com/media/10mgrhuEWNasNO/giphy.gif',
      order: 0,
    },
  ]

  return (
    <Stickerbook>
      {stickers.map((sticker) => (
        <Sticker key={sticker.id} {...sticker} />
      ))}
    </Stickerbook>
  )
}
