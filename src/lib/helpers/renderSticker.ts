import { createTexture, createRenderer } from "wtc-simplegl"
import { Vec2, Mat3 } from "wtc-math"

import type { StickerItem } from "../types"

type Size = [number, number]

interface Components {
  gl: WebGL2RenderingContext
  initialized: boolean
  canvas: HTMLCanvasElement
  renderer: ReturnType<typeof createRenderer>
}

const vert = `#version 300 es

in vec2 position;
in vec2 uv;
out vec2 v_uv;
uniform vec2 u_resolution;
uniform mat3 u_transform;
void main() {
  v_uv = uv;

  vec2 pos = (vec3(position, 1) * u_transform).xy;

  // gl_Position = vec4(position, 0, 1);
  gl_Position = vec4(pos / u_resolution * 2., 0, 1);
}`

const frag = `#version 300 es

precision highp float;
in vec2 v_uv;
out vec4 color;
uniform sampler2D s_main;
uniform vec2 u_resolution;
void main() {
  vec2 uv = v_uv;

  color = texture(s_main, uv);
}`

const components: Components = {} as Components
let dims: Vec2

export function renderSticker(
  sticker: StickerItem,
  loadedImage: HTMLImageElement,
  canvasSize: Size
) {
  if (
    typeof sticker.position === "undefined" ||
    typeof sticker.position.x === "undefined" ||
    typeof sticker.position.y === "undefined" ||
    isNaN(sticker.position.x) ||
    isNaN(sticker.position.y)
  ) {
    throw Error("Sticker position is not defined")
  }

  if (typeof sticker.scale === "undefined" || isNaN(sticker.scale)) {
    throw Error("Sticker scale is not defined")
  }

  if (typeof sticker.rotation === "undefined" || isNaN(sticker.rotation)) {
    throw Error("Sticker rotation is not defined")
  }

  initApplication(canvasSize)

  const { gl, canvas: c } = components

  const texture = createTexture(gl, {
    img: loadedImage,
    minFilter: gl.LINEAR_MIPMAP_LINEAR,
  })

  const d = new Vec2(loadedImage.width, loadedImage.height)

  const size = new Mat3(d.width, 0, 0, 0, d.height, 0, 0, 0, 1)

  // const position = sticker.position.subtractNew(new Vec2(0.5)).scale(c.width);

  const position = sticker.position.clone()

  position.y = 1 - position.y
  position.multiply(dims).subtract(dims.scaleNew(0.5))

  const scale = (sticker.scale * c.width) / Math.min(d.x, d.y) / 0.5

  const a = sticker.rotation

  const rotation = new Mat3(
    Math.cos(a),
    Math.sin(a),
    0,
    -Math.sin(a),
    Math.cos(a),
    0,
    0,
    0,
    1
  )
  // rotation = rotationPoint.multiplyNew(rotation).multiply(rotationPoint.invertNew())
  const transform = new Mat3(
    scale,
    0,
    position.x,
    0,
    scale,
    position.y,
    0,
    0,
    1
  )

  const sizeTransformationMatrix = size
    .multiplyNew(rotation)
    .multiply(transform)

  // const sizeTransformationMatrix = rotation;

  renderProgram(gl, 0, texture, [
    ["u_transform", sizeTransformationMatrix.array],
  ])

  return components.canvas
}

function initApplication(size: Size) {
  let c = components.canvas

  if (components.initialized !== true) {
    c = document.createElement("canvas")

    const gl = c.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    })!

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.clearColor(0, 0, 0, 0)

    components.canvas = c
    components.gl = gl

    initProgram(gl)

    components.renderer.bindVAOs()

    components.initialized = true
  }

  c.width = size[0]
  c.height = size[1]

  dims = new Vec2(c.width, c.height)

  return c
}

function initProgram(gl: WebGL2RenderingContext) {
  const position = new Float32Array([
    -0.5, -0.5, 0.5, -0.5, 0.5, 0.5,

    0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
  ])
  const uvs = new Float32Array([0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0])

  components.renderer = createRenderer(gl, {
    vert,
    frag,
    attributes: {
      position: { data: position, size: 2 },
      uv: { data: uvs, size: 2 },
    },
    count: 6,
  })
}

function renderProgram(
  gl: WebGL2RenderingContext,
  delta: number,
  texture: WebGLTexture,
  uniforms: Array<[string, unknown]>
) {
  // render to the canvas (setting null for target)
  // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

  // Bind the read texture - this sis what was rendered last frame
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  // bind the output texture uniform
  components.renderer.bindUniform("s_main", 0)
  components.renderer.bindUniform("u_time", delta * 0.001)
  components.renderer.bindUniform("u_resolution", [
    gl.canvas.width,
    gl.canvas.height,
  ])

  for (const [name, value] of uniforms)
    components.renderer.bindUniform(name, value)

  // Render the output
  components.renderer.render({
    width: gl.canvas.width,
    height: gl.canvas.height,
  })
}
