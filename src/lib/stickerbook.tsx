import { h } from "preact"
import { CSSProperties } from "preact/compat"
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useReducer,
  useState,
} from "preact/hooks"
import { Vec2 } from "wtc-math"

import { StickerbookContext } from "./stickerbook-context"
import { classnames } from "./helpers/classnames"
import type {
  BackgroundDetailsReducer,
  BackgroundDimensions,
  StickerbookDimensions,
  StickerbookProps,
  Timeout,
} from "./types"

import styles from "./stickerbook.module.scss"

export function Stickerbook({
  backgrounds = [],
  foregrounds = [],
  frames,
  outputHeight = 500,
  outputWidth = 500,
  children,
  className,
  ...props
}: StickerbookProps) {
  const [dimensions, setDimensions] = useState<StickerbookDimensions>({
    width: outputWidth,
    height: outputHeight,
    percentageShift: 1,
    rendered: false,
  })
  const [position, setPosition] = useState<Vec2>()
  const [backgroundDetails, setBackgroundDetails] = useReducer<
    BackgroundDimensions[],
    BackgroundDetailsReducer
  >(imageDetailsReducer, [])
  const mainRef = useRef<HTMLDivElement | null>(null)
  const parentRef = useRef<HTMLDivElement | null>(null)

  const foregroundIndex = useMemo(
    () =>
      children && Array.isArray(children) ? children.flat().length + 2 : 2,
    [children]
  )

  // Determine CSS styles for the Background image element,
  // based on the type of background ("scene" or "pattern")
  const backgroundStyles = useMemo<CSSProperties[]>(() => {
    if (!backgrounds.length || !backgroundDetails.length) return [{}]

    return backgrounds.map((bg, i) => {
      if (bg.type === "scene" || !backgroundDetails[i]) return {}

      // calculate new size based on generated image
      // backgrounds should base themselves on the size of the stickerbook
      const bgSize =
        (backgroundDetails[i].width * dimensions.width) / outputWidth
      return {
        backgroundRepeat: "repeat",
        backgroundSize: `${bgSize}px auto`,
      }
    })
  }, [backgroundDetails, dimensions.width, backgrounds, outputWidth])

  // when the node renders and also when we force resize
  useLayoutEffect(() => {
    const element = mainRef.current
    const parent = parentRef.current
    let resizeTimer: Timeout, scrollTimer: Timeout, previousPosition: Vec2

    const getPosition = function () {
      if (!element) return

      const rect = element.getBoundingClientRect()

      return new Vec2(rect.left, rect.top)
    }

    const onResize = function (init: boolean) {
      if (!element) return
      clearTimeout(resizeTimer)

      resizeTimer = setTimeout(() => {
        if (!parent || !element) return

        const newWidth = parent.offsetWidth
        const curWidth = element.offsetWidth

        // save position to variable and compare to current position
        const newPosition = getPosition()!

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
        const newPosition = getPosition()!
        if (
          previousPosition?.x !== newPosition.x ||
          previousPosition?.y !== newPosition.y
        ) {
          previousPosition = newPosition
          setPosition(newPosition)
        }
      }, 300)
    }

    const handleResize = () => onResize(false)

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", onScroll)

    onResize(true)

    return () => {
      clearTimeout(resizeTimer)
      clearTimeout(scrollTimer)

      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  // when background array changes, load each image
  // and save the image's original size
  useEffect(() => {
    if (!backgrounds.length) return

    backgrounds.forEach((bg, index) => {
      if (bg.image) {
        const img = new Image()

        img.onload = (e) => {
          const img = e.target as HTMLImageElement
          const width = img.width
          const height = img.height

          setBackgroundDetails({ index, dimensions: { width, height } })
        }

        img.src = bg.image
      }
    })
  }, [backgrounds])

  return (
    // this first div is fluid and will help us get the dimensions
    // for the stickerbook itself
    <div
      role="region"
      aria-label="Stickerbook"
      className={classnames([styles.Stickerbook, className])}
      ref={parentRef}
      {...props}
    >
      <div
        ref={mainRef}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
        data-stickerbook-container
      >
        {backgrounds.length > 0
          ? backgrounds.map((bg, i) => {
              if (!bg.image) return null

              return (
                <div
                  key={i}
                  role="img"
                  className={styles.Stickerbook__background}
                  style={{
                    backgroundImage: `url(${bg.image})`,
                    ...backgroundStyles[i],
                  }}
                  aria-label={bg.alt || ""}
                  data-stickerbook-background={i}
                />
              )
            })
          : null}

        {frames && frames?.length > 0
          ? frames.map(({ image, alt }, i) => {
              if (!image) return null

              return (
                <img
                  key={`frame-${image}-${i}`}
                  src={image}
                  alt={alt || ""}
                  className={styles.Stickerbook__frame}
                  data-stickerbook-frame
                />
              )
            })
          : null}

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

        {foregrounds.length > 0 &&
          foregrounds.map((fg, i) => {
            if (!fg.image) return null

            return (
              <img
                key={i}
                src={fg.image}
                alt={fg.alt || ""}
                className={styles.Stickerbook__foreground}
                data-stickerbook-foreground={i}
                style={{ zIndex: foregroundIndex + i }}
              />
            )
          })}
      </div>
    </div>
  )
}

function imageDetailsReducer(
  state: BackgroundDimensions[],
  { index, dimensions }: BackgroundDetailsReducer
): BackgroundDimensions[] {
  if (isNaN(index) || !dimensions) return state
  const newState = [...state]
  newState[index] = dimensions

  return newState
}
