import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useReducer,
  useState,
} from 'preact/hooks'
import { Vec2 } from 'wtc-math'

import { StickerbookContext } from './stickerbook-context'
import { classnames } from './helpers/classnames'
import './stickerbook.scss'

const imageDetailsReducer = (state, { index, dimensions }) => {
  if (isNaN(index) || !dimensions) return state
  const newState = [...state]
  newState[index] = dimensions

  return newState
}

export default function Stickerbook({
  background = [],
  foreground = {},
  frame = {},
  outputHeight = 500,
  outputWidth = 500,
  children,
  className,
  ...props
}) {
  const [dimensions, setDimensions] = useState({
    width: outputWidth,
    height: outputHeight,
    percentageShift: 1,
    rendered: false,
  })
  const [position, setPosition] = useState()
  const [backgroundDetails, setBackgroundDetails] = useReducer(
    imageDetailsReducer,
    []
  )
  // const [foregroundDetails, setForegroundDetails] = useReducer(
  //   imageDetailsReducer,
  //   []
  // )
  const mainRef = useRef()
  const parentRef = useRef()

  const foregroundIndex = useMemo(
    () => (children ? children.flat().length + 2 : 2),
    [children]
  )

  // Determine CSS styles for the Background image element,
  // based on the type of background ("scene" or "pattern")
  const backgroundStyles = useMemo(() => {
    if (!background.length || !backgroundDetails.length) return {}

    return background.map((bg, i) => {
      if (bg.type === 'scene' || !backgroundDetails[i]) return {}

      // calculate new size based on generated image
      // backgrounds should base themselves on the size of the stickerbook
      const bgSize =
        (backgroundDetails[i].width * dimensions.width) / outputWidth
      return {
        backgroundRepeat: 'repeat',
        backgroundSize: `${bgSize}px auto`,
      }
    })
  }, [backgroundDetails, dimensions.width, background, outputWidth])

  console.log({ backgroundStyles })

  // when the node renders and also when we force resize
  useLayoutEffect(() => {
    const element = mainRef.current
    const parent = parentRef.current
    let resizeTimer, scrollTimer, previousPosition

    const getPosition = function () {
      const rect = element.getBoundingClientRect()

      return new Vec2(rect.left, rect.top)
    }

    const onResize = function (init) {
      if (!element) return
      clearTimeout(resizeTimer)

      resizeTimer = setTimeout(() => {
        const newWidth = parent.offsetWidth
        const curWidth = element.offsetWidth

        // save position to variable and compare to current position
        const newPosition = getPosition()
        if (
          previousPosition?.x !== newPosition.x ||
          previousPosition?.y !== newPosition.y
        ) {
          previousPosition = newPosition
          setPosition(newPosition)
        }

        if (newWidth !== curWidth || init === true) {
          clearTimeout(resizeTimer)
          setDimensions((cur) => {
            return {
              width: newWidth,
              height: (element.offsetHeight / curWidth) * newWidth,
              percentageShift: newWidth / cur.width,
              rendered: true,
            }
          })
        }
      }, 300)
    }

    const onScroll = function () {
      if (!element) return
      clearTimeout(scrollTimer)

      scrollTimer = setTimeout(() => {
        // save position to variable and compare to current position
        const newPosition = getPosition()
        if (
          previousPosition?.x !== newPosition.x ||
          previousPosition?.y !== newPosition.y
        ) {
          previousPosition = newPosition
          setPosition(newPosition)
        }
      }, 300)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll)

    onResize(true)

    return () => {
      clearTimeout(resizeTimer)
      clearTimeout(scrollTimer)

      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // when background array changes, load each image
  // and save the image's original size
  useEffect(() => {
    if (!background.length) return

    background.forEach((bg, index) => {
      if (bg.image) {
        const img = new Image()

        img.onload = (e) => {
          const img = e.target
          const width = img.width
          const height = img.height

          setBackgroundDetails({ index, dimensions: { width, height } })
        }

        img.src = bg.image
      }
    })
  }, [background])

  return (
    // this first div is fluid and will help us get the dimensions
    // for the stickerbook itself
    <div
      role="region"
      aria-label="Stickerbook"
      className={classnames(['Stickerbook', className])}
      ref={parentRef}
      {...props}
    >
      <div
        ref={mainRef}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        {background.length &&
          background.map((bg, i) => {
            if (!bg.image) return null

            return (
              <div
                key={i}
                role="img"
                className="Stickerbook__background"
                style={{
                  backgroundImage: `url(${bg.image})`,
                  ...backgroundStyles[i],
                }}
                aria-label={bg.alt || ''}
              />
            )
          })}

        {frame && frame.image && (
          <img
            src={frame.image}
            alt={frame.alt || ''}
            className="Stickerbook__frame"
          />
        )}

        <StickerbookContext.Provider
          value={{
            parentRef: parentRef.current,
            mainRef: mainRef.current,
            position,
            dimensions,
          }}
        >
          {dimensions.rendered && children}
        </StickerbookContext.Provider>

        {foreground && foreground.image && (
          <img
            src={foreground.image}
            alt={foreground.alt || ''}
            className="Stickerbook__foreground"
            style={{ zIndex: foregroundIndex }}
          />
        )}
      </div>
    </div>
  )
}
