import { h, createContext } from "preact";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import { Vec2 } from "wtc-math";

import { classnames } from "./helpers";

import styles from "./stickerbook.module.scss";

// if in the future we have the need to have two
// stickerbook components rendering, I think
// we might be able to make this a scoped function
export const StickerbookContext = createContext();

export default function Stickerbook({
  background = {},
  height = 500,
  foreground = {},
  frame = {},
  width = 500,
  children,
  className,
  ...props
}) {
  const [dimensions, setDimensions] = useState({
    width,
    height,
    percentageShift: 1,
    rendered: false,
  });
  const [position, setPosition] = useState();
  const [backgroundDetails, setBackgroundDetails] = useState({});
  const mainRef = useRef();
  const foregroundIndex = useMemo(
    () => (children ? children.flat().length + 2 : 2),
    [children]
  );

  const backgroundStyles = useMemo(() => {
    if (background.type === "scene") return {};

    // calculate new size based on generated image
    // backgrounds should be generated by designers
    // and they should base themselves on the size of the stickerbook
    const bgSize = (backgroundDetails.width * dimensions.width) / width;

    return {
      backgroundRepeat: "repeat",
      backgroundSize: `${bgSize}px auto`,
    };
  }, [backgroundDetails.width, dimensions.width, background.type, width]);

  // when the node renders and also when we force resize
  useLayoutEffect(() => {
    const element = mainRef.current;
    let resizeTimer, scrollTimer;

    const getPosition = function () {
      const rect = element.getBoundingClientRect();

      return new Vec2(rect.left, rect.top);
    };

    const onResize = function () {
      if (!element) return;
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        const newWidth = element.parentNode.offsetWidth;
        const curWidth = element.offsetWidth;

        setPosition(getPosition());

        if (newWidth !== curWidth)
          setDimensions((cur) => {
            return {
              width: newWidth,
              height: (element.offsetHeight / curWidth) * newWidth,
              percentageShift: newWidth / cur.width,
              rendered: true,
            };
          });
      }, 300);
    };

    const onScroll = function () {
      if (!element) return;
      clearTimeout(scrollTimer);

      scrollTimer = setInterval(() => {
        setPosition(getPosition());
      }, 300);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll);

    onResize();

    return () => {
      clearTimeout(resizeTimer);
      clearTimeout(scrollTimer);

      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // when background changes, we load the image
  // and save the original size
  useEffect(() => {
    if (!background.image) return;

    const img = new Image();

    img.onload = (e) => {
      const img = e.target;
      const width = img.width;
      const height = img.height;

      setBackgroundDetails({ width, height });
    };

    img.src = background.image;
  }, [background.image]);

  return (
    <div
      ref={mainRef}
      className={classnames([styles.Stickerbook, className])}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
      {...props}
    >
      {background && background.image && (
        <div
          role="img"
          className={styles.Stickerbook__background}
          style={{
            backgroundImage: `url(${background.image})`,
            ...backgroundStyles,
          }}
          aria-label={background.alt || ""}
        />
      )}

      {frame && frame.image && (
        <img
          src={frame.image}
          alt={frame.alt || ""}
          className={styles.Stickerbook__frame}
        />
      )}

      <StickerbookContext.Provider
        value={{ parentRef: mainRef.current, position, dimensions }}
      >
        {dimensions.rendered && children}
      </StickerbookContext.Provider>

      {foreground && foreground.image && (
        <img
          src={foreground.image}
          alt={foreground.alt || ""}
          className={styles.Stickerbook__foreground}
          style={{ zIndex: foregroundIndex }}
        />
      )}
    </div>
  );
}
