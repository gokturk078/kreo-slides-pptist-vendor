export const enum ShapePathFormulasKeys {
  ROUND_RECT = 'roundRect',
  ROUND_RECT_DIAGONAL = 'roundRectDiagonal',
  ROUND_RECT_SINGLE = 'roundRectSingle',
  ROUND_RECT_SAMESIDE = 'roundRectSameSide',
  CUT_RECT_DIAGONAL = 'cutRectDiagonal',
  CUT_RECT_SINGLE = 'cutRectSingle',
  CUT_RECT_SAMESIDE = 'cutRectSameSide',
  CUT_ROUND_RECT = 'cutRoundRect',
  MESSAGE = 'message',
  ROUND_MESSAGE = 'roundMessage',
  L = 'L',
  RING_RECT = 'ringRect',
  PLUS = 'plus',
  TRIANGLE = 'triangle',
  PARALLELOGRAM_LEFT = 'parallelogramLeft',
  PARALLELOGRAM_RIGHT = 'parallelogramRight',
  TRAPEZOID = 'trapezoid',
  BULLET = 'bullet',
  INDICATOR = 'indicator',
  DONUT = 'donut',
  DIAGSTRIPE = 'diagStripe',
}

export const enum ElementTypes {
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  LINE = 'line',
  CHART = 'chart',
  TABLE = 'table',
  LATEX = 'latex',
  VIDEO = 'video',
  AUDIO = 'audio',
}

/**

 * 

 * 

 * 
 * rotate: Gradient angle（Linear gradient）
 */
export type GradientType = 'linear' | 'radial'
export type GradientColor = {
  pos: number
  color: string
}
export interface Gradient {
  type: GradientType
  colors: GradientColor[]
  rotate: number
}

export type LineStyleType = 'solid' | 'dashed' | 'dotted'

/**

 * 

 * 

 * 

 * 
 * color: Shadow color
 */
export interface PPTElementShadow {
  h: number
  v: number
  blur: number
  color: string
}

/**

 * 

 * 

 * 
 * color?: Border color
 */
export interface PPTElementOutline {
  style?: LineStyleType
  width?: number
  color?: string
}

export type ElementLinkType = 'web' | 'slide'

/**

 * 

 * 

 */
export interface PPTElementLink {
  type: ElementLinkType
  target: string
}

export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export type TextAlignVertical = 'top' | 'middle' | 'bottom' 

/**

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 
 * link?: Hyperlink
 * 

 */
interface PPTBaseElement {
  id: string
  left: number
  top: number
  lock?: boolean
  groupId?: string
  width: number
  height: number
  rotate: number
  link?: PPTElementLink
  name?: string
}

export type TextType = 'title' | 'subtitle' | 'content' | 'item' | 'itemTitle' | 'notes' | 'header' | 'footer' | 'partNumber' | 'itemNumber'
export type TextInset = [number, number, number, number]

/**

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 */
export interface PPTTextElement extends PPTBaseElement {
  type: 'text'
  content: string
  defaultFontName: string
  defaultColor: string
  outline?: PPTElementOutline
  fill?: string
  lineHeight?: number
  wordSpace?: number
  opacity?: number
  shadow?: PPTElementShadow
  paragraphSpace?: number
  vertical?: boolean
  textType?: TextType
  inset?: TextInset
}

/**

 * 
 * flipH?: Flip horizontal
 * 
 * flipV?: Flip vertical
 */
export interface ImageOrShapeFlip {
  flipH?: boolean
  flipV?: boolean
}

/**

 * 
 * https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter
 * 

 * 

 * 

 * 

 * 

 * 

 * 

 */
export type ImageElementFilterKeys = 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'saturate' | 'hue-rotate' | 'opacity' | 'sepia' | 'invert'
export interface ImageElementFilters {
  'blur'?: string
  'brightness'?: string
  'contrast'?: string
  'grayscale'?: string
  'saturate'?: string
  'hue-rotate'?: string
  'sepia'?: string
  'invert'?: string
  'opacity'?: string
}

export type ImageClipDataRange = [[number, number], [number, number]]

/**
 * ImageCrop
 * 

 * 

 */
export interface ImageElementClip {
  range: ImageClipDataRange
  shape: string
}

export type ImageType = 'pageFigure' | 'itemFigure' | 'background'

/**

 * 

 * 

 * 

 * 

 * 

 * 

 * 
 * flipH?: Flip horizontal
 * 
 * flipV?: Flip vertical
 * 

 * 

 * 

 * 
 * imageType?: ImageType
 */
export interface PPTImageElement extends PPTBaseElement {
  type: 'image'
  fixedRatio: boolean
  src: string
  outline?: PPTElementOutline
  filters?: ImageElementFilters
  clip?: ImageElementClip
  flipH?: boolean
  flipV?: boolean
  shadow?: PPTElementShadow
  radius?: number
  colorMask?: string
  imageType?: ImageType
}

/**

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 */
export interface ShapeText {
  content: string
  defaultFontName: string
  defaultColor: string
  align: TextAlignVertical
  lineHeight?: number
  wordSpace?: number
  paragraphSpace?: number
  inset?: TextInset
  type?: TextType
}

/**

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 
 * opacity?: Opacity
 * 
 * flipH?: Flip horizontal
 * 
 * flipV?: Flip vertical
 * 

 * 

 * 

 * 

 * 

 */
export interface PPTShapeElement extends PPTBaseElement {
  type: 'shape'
  viewBox: [number, number]
  path: string
  fixedRatio: boolean
  fill: string
  gradient?: Gradient
  pattern?: string
  outline?: PPTElementOutline
  opacity?: number
  flipH?: boolean
  flipV?: boolean
  shadow?: PPTElementShadow
  special?: boolean
  text?: ShapeText
  pathFormula?: ShapePathFormulasKeys
  keypoints?: number[]
}

export type LinePoint = '' | 'arrow' | 'dot' 
export type Broken2LineDirection = 'horizontal' | 'vertical'

/**

 * 

 * 

 * 

 * 

 * 
 * color: Line color
 * 

 * 

 * 

 * 

 * 

 * 

 * 

 */
export interface PPTLineElement extends Omit<PPTBaseElement, 'height' | 'rotate'> {
  type: 'line'
  start: [number, number]
  end: [number, number]
  style: LineStyleType
  color: string
  points: [LinePoint, LinePoint]
  shadow?: PPTElementShadow
  broken?: [number, number]
  broken2?: [number, number]
  broken2Direction?: Broken2LineDirection
  curve?: [number, number]
  cubic?: [[number, number], [number, number]]
}

export type ChartType = 'bar' | 'column' | 'line' | 'pie' | 'ring' | 'area' | 'radar' | 'scatter'

export interface ChartOptions {
  lineSmooth?: boolean
  stack?: boolean
}

export interface ChartData {
  labels: string[]
  legends: string[]
  series: number[][]
}

/**

 * 

 * 

 * 

 * 

 * 

 * 

 * 
 * themeColors: Theme color
 * 

 * 
 * lineColor?: Grid color
 */
export interface PPTChartElement extends PPTBaseElement {
  type: 'chart'
  fill?: string
  chartType: ChartType
  data: ChartData
  options?: ChartOptions
  outline?: PPTElementOutline
  themeColors: string[]
  textColor?: string
  lineColor?: string
}

/**

 * 
 * bold?: Bold
 * 
 * em?: Italic
 * 
 * underline?: Underline
 * 

 * 

 * 

 * 
 * fontsize?: FontLargeSmall
 * 
 * fontname?: Font
 * 

 */
export interface TableCellStyle {
  bold?: boolean
  em?: boolean
  underline?: boolean
  strikethrough?: boolean
  color?: string
  backcolor?: string
  fontsize?: string
  fontname?: string
  align?: TextAlign
  vAlign?: TextAlignVertical
}

/**

 * 

 * 

 * 

 * 

 * 

 */
export interface TableCell {
  id: string
  colspan: number
  rowspan: number
  text: string
  style?: TableCellStyle
}

/**

 * 
 * color: Theme color
 * 

 * 

 * 

 * 

 */
export interface TableTheme {
  color: string
  rowHeader: boolean
  rowFooter: boolean
  colHeader: boolean
  colFooter: boolean
}

/**

 * 

 * 

 * 

 * 

 * 

 * 

 */
export interface PPTTableElement extends PPTBaseElement {
  type: 'table'
  outline: PPTElementOutline
  theme?: TableTheme
  colWidths: number[]
  cellMinHeight: number
  data: TableCell[][]
}

/**

 * 

 * 

 * 
 * path: svg path
 * 

 * 

 * 

 * 

 */
export interface PPTLatexElement extends PPTBaseElement {
  type: 'latex'
  latex: string
  path: string
  color: string
  strokeWidth: number
  viewBox: [number, number]
  fixedRatio: boolean
}

/**

 * 

 * 

 * 
 * autoplay: Autoplay
 * 

 * 

 */
export interface PPTVideoElement extends PPTBaseElement {
  type: 'video'
  src: string
  autoplay: boolean
  poster?: string
  ext?: string
}

/**

 * 

 * 

 * 
 * color: Icon color
 * 
 * loop: Loop playback
 * 
 * autoplay: Autoplay
 * 

 * 

 */
export interface PPTAudioElement extends PPTBaseElement {
  type: 'audio'
  fixedRatio: boolean
  color: string
  loop: boolean
  autoplay: boolean
  src: string
  ext?: string
}

export type PPTElement = PPTTextElement | PPTImageElement | PPTShapeElement | PPTLineElement | PPTChartElement | PPTTableElement | PPTLatexElement | PPTVideoElement | PPTAudioElement

export type AnimationType = 'in' | 'out' | 'attention'
export type AnimationTrigger = 'click' | 'meantime' | 'auto'

/**

 * 
 * id: Animationid
 * 

 * 

 * 

 * 

 * 

 */
export interface PPTAnimation {
  id: string
  elId: string
  effect: string
  type: AnimationType
  duration: number
  trigger: AnimationTrigger
}

export type SlideBackgroundType = 'solid' | 'image' | 'gradient'
export type SlideBackgroundImageSize = 'cover' | 'contain' | 'repeat'
export interface SlideBackgroundImage {
  src: string
  size: SlideBackgroundImageSize,
}

/**

 * 

 * 

 * 

 * 

 */
export interface SlideBackground {
  type: SlideBackgroundType
  color?: string
  image?: SlideBackgroundImage
  gradient?: Gradient
}

export type TurningMode = 'no' | 'fade' | 'slideX' | 'slideY' | 'random' | 'slideX3D' | 'slideY3D' | 'rotate' | 'scaleY' | 'scaleX' | 'scale' | 'scaleReverse'

export interface NoteReply {
  id: string
  content: string
  time: number
  user: string
}

export interface Note {
  id: string
  content: string
  time: number
  user: string
  elId?: string
  replies?: NoteReply[]
}

export interface SectionTag {
  id: string
  title?: string
}

export type SlideType = 'cover' | 'contents' | 'transition' | 'content' | 'end'

/**

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 * 

 */
export interface Slide {
  id: string
  elements: PPTElement[]
  notes?: Note[]
  remark?: string
  background?: SlideBackground
  animations?: PPTAnimation[]
  turningMode?: TurningMode
  sectionTag?: SectionTag
  type?: SlideType
}

/**

 * 

 * 

 * 

 * 
 * fontName: Font
 */
export interface SlideTheme {
  backgroundColor: string
  themeColors: string[]
  fontColor: string
  fontName: string
  outline: PPTElementOutline
  shadow: PPTElementShadow
}

export interface SlideTemplate {
  name: string
  id: string
  cover: string
  origin?: string
}
