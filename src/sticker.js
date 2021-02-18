import { h } from "preact";
import { useContext, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { Vec2, Mat2 } from "wtc-math";

import { StickerbookContext } from "./stickerbook";

import styles from "./sticker.module.css";

const STATES = {
  LOADING: 0,
  IDLE: 1,
  ROTATESCALE: 2,
  MOVE: 3,
};

const ROTATION_BUTTON_OFFSET = 0.785;

export default function Sticker({
  image,
  alt = "",
  order = 1,
  onDelete,
  onReorder,
  // optional
  initialScale = null,
  initialRotation = null,
  initialPosition = null,
  // hooks
  onPosition,
  onScale,
  onRotate,
}) {
  // parent stickerbook information
  const {
    position: parentPosition,
    parentRef,
    dimensions: parentDimensions,
  } = useContext(StickerbookContext);
  // main refs
  const elementRef = useRef();
  const canvasRef = useRef(document.createElement("canvas"));
  const ctx = useMemo(() => canvasRef.current.getContext("2d"), [
    canvasRef.current,
  ]);
  const mousePositionRef = useRef();
  // main states
  const [state, setState] = useState(STATES.LOADING);
  const [position, setPosition] = useState();
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  // control scale is a state for now, we can explore how this
  // will scale based on size, it might become a prop
  const [controlsScale, setControlScale] = useState(0.8);
  // these are used for internal calculations
  const [rotationOffset, setRotationOffset] = useState(0);
  const [imageDetails, setImageDetails] = useState();
  // hooks refs for delayed callback
  const onPositionTimer = useRef();
  const onScaleTimer = useRef();
  const onRotateTimer = useRef();

  // Composed variables
  const radius = useMemo(() => {
    if (!imageDetails) return 1;

    return Math.min(imageDetails.x, imageDetails.y) * scale * 0.5;
  }, [scale, imageDetails]);

  const bounds = useMemo(() => {
    if (!imageDetails) return {};

    // Find the half image dimensions
    let halfImage = imageDetails.scaleNew(0.5);
    // Generate the unmodified image boundaries (all 4 corners)
    let imageBounds = [
      halfImage.multiplyNew(new Vec2(-1, -1)), // Top-left
      halfImage.multiplyNew(new Vec2(1, -1)), // top-right
      halfImage.multiplyNew(new Vec2(1, 1)), // bottom-right
      halfImage.multiplyNew(new Vec2(-1, 1)), // bottom-left
    ];

    // Create the sticker bounds.
    // This is just taking all 4 points and applying our transformations
    // to them, resulting in the real position of all 4
    // corners after rotation and positional transformation
    let stickerBounds = [];
    imageBounds.forEach((corner) => {
      // Create the rotation matrix - this is used to transform the point coordinates for the purpose of testing the rotated bounds
      let s = Math.sin(rotation);
      let c = Math.cos(rotation);
      let rMat = new Mat2(c, s, -s, c);

      // Transform the corner by rotating it, scaling it and adding
      // the sticker position
      let transformedPosition = corner
        .transformByMat2New(rMat)
        .scale(scale)
        .add(position);
      stickerBounds.push(transformedPosition);
    });

    // Reduce the bounds 4 times to get the left, top, right and
    // bottom bounds.
    let bounds = {
      left: stickerBounds.reduce((acc, val) => (val.x < acc.x ? val : acc)).x,
      top: stickerBounds.reduce((acc, val) => (val.y < acc.y ? val : acc)).y,
      right: stickerBounds.reduce((acc, val) => (val.x > acc.x ? val : acc)).x,
      bottom: stickerBounds.reduce((acc, val) => (val.y > acc.y ? val : acc)).y,
    };

    return bounds;
  }, [imageDetails, rotation, scale, position]);

  // Component styles
  const stickerStyles = useMemo(() => {
    if (!position) return {};
    return { left: `${position.x}px`, top: `${position.y}px`, zIndex: order };
  }, [position, order]);

  const containerStyles = useMemo(() => {
    if (!imageDetails) return {};

    return {
      width: `${imageDetails.x}px`,
      height: `${imageDetails.y}px`,
    };
  }, [imageDetails]);

  const imageStyles = useMemo(() => {
    return {
      transform: `scale(${scale}) rotate(${rotation + rotationOffset}rad)`,
    };
  }, [scale, rotation, rotationOffset]);

  const controlsStyle = useMemo(() => {
    const dimension = radius * 2 * controlsScale;

    return {
      width: `${dimension}px`,
      height: `${dimension}px`,
    };
  }, [radius, controlsScale]);

  const controlsPinStyle = useMemo(() => {
    return {
      left: `${
        radius * controlsScale +
        Math.cos(rotationOffset + ROTATION_BUTTON_OFFSET) *
          radius *
          controlsScale -
        3 // 3 is for the border
      }px`,
      top: `${
        radius * controlsScale +
        Math.sin(rotationOffset + ROTATION_BUTTON_OFFSET) *
          radius *
          controlsScale -
        3 // 3 is for the border
      }px`,
    };
  }, [radius, controlsScale, rotationOffset, ROTATION_BUTTON_OFFSET]);

  const controlsDeleteStyle = useMemo(() => {
    return {
      left: `${
        radius * controlsScale -
        Math.cos(rotationOffset + ROTATION_BUTTON_OFFSET) *
          radius *
          controlsScale -
        3 // 3 is for the border
      }px`,
      top: `${
        radius * controlsScale -
        Math.sin(rotationOffset + ROTATION_BUTTON_OFFSET) *
          radius *
          controlsScale -
        3 // 3 is for the border
      }px`,
    };
  }, [radius, controlsScale, rotationOffset, ROTATION_BUTTON_OFFSET]);

  // event listeners

  const onStickerKeyDown = function (e) {
    if (state === STATES.IDLE) {
      const { shiftKey, key } = e;
      const multiplier = shiftKey ? 10 : 1;

      if (key === "Delete" || key === "Backspace") onDelete();

      if (key === "ArrowLeft")
        updatePosition(new Vec2(position.x - 1 * multiplier, position.y));
      else if (key === "ArrowRight")
        updatePosition(new Vec2(position.x + 1 * multiplier, position.y));

      if (key === "ArrowUp")
        updatePosition(new Vec2(position.x, position.y - 1 * multiplier));
      else if (key === "ArrowDown")
        updatePosition(new Vec2(position.x, position.y + 1 * multiplier));

      if (key === "-" || key === "_") updateScale(scale - 0.01 * multiplier);
      else if (key === "+" || key === "=")
        updateScale(scale + 0.01 * multiplier);

      if (key === "<" || key === ",")
        updateRotation(rotation - 0.01 * multiplier);
      else if (key === ">" || key === ".")
        updateRotation(rotation + 0.01 * multiplier);

      // Align top or bottom
      if (key === "w")
        updatePosition(new Vec2(position.x, position.y - bounds.top));
      else if (key === "s")
        updatePosition(
          new Vec2(
            position.x,
            parentDimensions.height - (bounds.bottom - position.y)
          )
        );

      // Align left or right
      if (key === "a")
        updatePosition(new Vec2(position.x - bounds.left, position.y));
      else if (key === "d")
        updatePosition(
          new Vec2(
            parentDimensions.width - (bounds.right - position.x),
            position.y
          )
        );

      // Align vertically or horizontally center
      if (key === "v")
        updatePosition(new Vec2(position.x, parentDimensions.height * 0.5));
      else if (key === "c")
        updatePosition(new Vec2(parentDimensions.width * 0.5, position.y));

      if (key === "[" || key === "{") onReorder("up", multiplier > 1);
      else if (key === "]" || key === "}") onReorder("down", multiplier > 1);
    }
  };

  const onStickerPointerMove = function (e) {
    if (state !== STATES.ROTATESCALE && state !== STATES.MOVE) return;

    e.preventDefault();
    e.stopPropagation();

    if (state === STATES.ROTATESCALE) {
      // Find the mouse position relative to the element
      let rect = elementRef.current.getBoundingClientRect();

      const mousePosition = new Vec2(
        e.clientX - rect.left,
        e.clientY - rect.top
      );

      // Get the radius of the element as well as the initial (1x) radius
      let initalradius = Math.min(imageDetails.x, imageDetails.y);

      // Update the rotation / scale of the sticker
      setRotationOffset(mousePosition.angle - ROTATION_BUTTON_OFFSET);
      updateScale(
        (mousePosition.length + (radius - radius * controlsScale)) /
          (initalradius * 0.5)
      );
      // To describe the above algorithm for future me (or you)
      // The scale of the element is:
      //  - the length of themouse position relavant to the sticker
      //  - plus the difference between the controls offset - this basically just accounts for the scale of the controls element
      //  - divided by the initial radius of the image (to derive the scale)

      mousePositionRef.current = mousePosition;
    } else if (state === STATES.MOVE) {
      const pos = new Vec2(e.clientX, e.clientY)
        .subtract(mousePositionRef.current)
        .subtract(parentPosition);

      updatePosition(pos);
    }
  };

  const onStickerPointerLeave = function () {
    setState(STATES.IDLE);
  };

  const onStickerFocus = function () {
    parentRef.scrollTo(0, 0);
  };

  const onDeletePointerDown = function () {
    onDelete();
  };

  const onPinPointerDown = function () {
    setState(STATES.ROTATESCALE);
  };

  const onPinPointerUp = function () {
    updateRotation(rotation + rotationOffset);
    setRotationOffset(0);
    setState(STATES.IDLE);
  };

  const onImagePointerDown = function (e) {
    e.preventDefault();

    const element = elementRef.current;

    // Find the mouse position relative to the sticker
    let rect = element.getBoundingClientRect();

    const mousePosition = new Vec2(e.clientX - rect.left, e.clientY - rect.top);

    // Create the rotation matrix - this is used to transform the mouse coordinates for the purpose of testing for transparent pixels
    let s = Math.sin(-rotation);
    let c = Math.cos(-rotation);
    let matRotation = new Mat2(c, s, -s, c);

    // Transform the mouse position so that we get a new coordinate inside the rotated, scaled sticker.
    // What we're doing here, in order, is:
    // 1. Rotating the mouse position
    // 2. Adding half of the scaled dimensions of the sticker (because stickers are centered, and we want comp coords)
    // 3. scaling it by the inverse of the sticker's scale value
    let transformedMousePosition = mousePosition
      .transformByMat2New(matRotation)
      .add(imageDetails.scaleNew(scale).scale(0.5))
      .scale(1 / scale);

    // Find the image data for the pixel at the transformed mouse coordinates
    let imageData = ctx.getImageData(
      transformedMousePosition.x,
      transformedMousePosition.y,
      1,
      1
    );

    mousePositionRef.current = mousePosition;

    // I failed on one thing here.
    // I couldn't find an elegant and non hacky way of doing this in a more react/preact manner. 😥
    // If the alpha of the clicked pixel is less than 5%, we want to click *through* the sticker
    if (imageData.data[3] < 15) {
      // Add the checking class to the image. This just ensures that we don't check this sticker again and get stuck in an infinite loop
      e.currentTarget.classList.add("checking");

      // Find all the elements in the document at the clicked point
      let elements = Array.from(
        document.elementsFromPoint(e.clientX, e.clientY)
      );

      // Sort them based on their being a sticker image and on their computed z index
      // This makes sure that when we click *through* the sticker we get the next one below instead of some random one in the stack.
      elements.sort((a, b) => {
        if (
          a.classList.contains(styles.Sticker__img) &&
          b.classList.contains(styles.Sticker__img)
        ) {
          let as = window.getComputedStyle(a.parentNode.parentNode);
          let bs = window.getComputedStyle(b.parentNode.parentNode);

          if (as.zIndex < bs.zIndex) return -1;
          if (as.zIndex > bs.zIndex) return 1;
        }

        return 0;
      });

      // Loop through the elements. If it belongs to a sticker then create a pointer event and "click" that sticker
      elements.forEach((element) => {
        if (
          element.classList.contains(styles.Sticker__img) &&
          !element.classList.contains("checking")
        ) {
          // create a specific "pointerdown" event
          const details = {
            clientX: e.clientX,
            clientY: e.clientY,
          };

          const pointerDownEvent = new PointerEvent("pointerdown", details);
          // const pointerUpEvent = new PointerEvent("pointerup", details);

          // Dispatch the event
          element.dispatchEvent(pointerDownEvent);
          // element.dispatchEvent(pointerUpEvent);
        }
      });

      // Remove the "checking class"
      e.currentTarget.classList.remove("checking");
    } else {
      // If, instead, this sticker has been clicked then focus it, set it to moving and add the pointer move event
      element.focus();
      onReorder("up", true);
      setState(STATES.MOVE);
    }
  };

  const onImagePointerUp = function () {
    setState(STATES.IDLE);
  };

  // effects for the hooks provided by the component
  const updatePosition = function (value) {
    setPosition(value);

    if (onPosition) {
      clearTimeout(onPositionTimer.current);
      onPositionTimer.current = setTimeout(() => {
        // These are unit values, it's a pretty advanced concept
        // Liam put this together and I adapted the class
        // model into the preact/funcional model
        // Basically, this is a value that can be reverted
        // by multiplying it back to whatever size you need
        onPosition(value.divideScalarNew(parentDimensions.width));
      }, 500);
    }
  };

  const updateRotation = function (value) {
    setRotation(value);

    if (onRotate) {
      clearTimeout(onRotateTimer.current);
      onRotateTimer.current = setTimeout(() => {
        onRotate(value);
      }, 500);
    }
  };

  const updateScale = function (value, imageSize) {
    setScale(value);

    if (onScale) {
      clearTimeout(onScaleTimer.current);
      onScaleTimer.current = setTimeout(() => {
        // These are unit values, it's a pretty advanced concept
        // Liam put this together and I adapted the class
        // model into the preact/funcional model
        // Basically, this is a value that can be reverted
        // by multiplying it back to whatever size you need
        const rad = imageSize
          ? Math.min(imageSize.x, imageSize.y) * value * 0.5
          : radius;

        onScale(rad / parentDimensions.width);
      }, 500);
    }
  };

  // start it all after image loads
  const init = async function (e) {
    const img = e.target;
    const width = img.width;
    const height = img.height;
    // canvas is used to check for click on the transparent area of the image
    const canvas = canvasRef.current;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0);

    const imageSize = new Vec2(width, height);
    setImageDetails(imageSize);

    if (initialPosition !== null) {
      if (!(initialPosition instanceof Vec2))
        initialPosition = new Vec2(initialPosition.x, initialPosition.y);

      setPosition(initialPosition.scaleNew(parentDimensions.width));
    } else
      updatePosition(
        new Vec2(parentDimensions.width / 2, parentDimensions.height / 2)
      );

    if (initialScale !== null)
      setScale(
        (initialScale * parentDimensions.width) / Math.min(width, height) / 0.5
      );
    else updateScale(0.3, imageSize);

    if (initialRotation !== null) setRotation(initialRotation);
    else updateRotation(0);

    setState(STATES.IDLE);
  };

  // if the parent stickerbook changes size we need to respond
  useEffect(() => {
    if (!imageDetails) return;

    const percentageShift = parentDimensions.percentageShift;
    updatePosition(position.scaleNew(percentageShift));
    updateScale(scale * percentageShift);
  }, [parentDimensions.percentageShift]);

  // if image change we need to reload details
  useEffect(() => {
    setState(STATES.LOADING);

    const img = new Image();
    img.onload = init;
    img.crossOrigin = "anonymous";
    img.src = image;
  }, [image]);

  if (state === STATES.LOADING) return;

  return (
    <div
      ref={elementRef}
      className={styles.Sticker}
      tabindex="0"
      style={stickerStyles}
      onFocus={onStickerFocus}
      onKeyDown={onStickerKeyDown}
      onPointerMove={onStickerPointerMove}
      onPointerLeave={onStickerPointerLeave}
      onPointerCancel={onStickerPointerLeave}
    >
      <div className={styles.Sticker__container} style={containerStyles}>
        <img
          className={styles.Sticker__img}
          src={image}
          style={imageStyles}
          alt={alt}
          onPointerDown={onImagePointerDown}
          onPointerUp={onImagePointerUp}
        />
      </div>
      <div className={styles.Sticker__controls} style={controlsStyle}>
        <div
          className={styles["Sticker__controll-pin"]}
          style={controlsPinStyle}
          onPointerDown={onPinPointerDown}
          onPointerUp={onPinPointerUp}
        />
        <div
          className={styles["Sticker__controll-delete"]}
          style={controlsDeleteStyle}
          onPointerDown={onDeletePointerDown}
        />
      </div>
    </div>
  );
}
