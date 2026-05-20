export type KreoSlidesVendorEngineApi = {
  getDocument: () => unknown;
  getSlideIndex: () => number;
  getCanvasPercentage: () => number;
  selectSlide: (index: number) => void;
  addSlide: () => void;
  duplicateSlide: (index?: number) => void;
  deleteSlide: (index?: number) => void;
  insertTextBox: () => void;
  insertShape: () => void;
  insertLine: () => void;
  insertChart: () => void;
  insertTable: () => void;
  insertImageDataUrl: (dataUrl: string) => void;
  getSelectionSnapshot: () => KreoSlidesVendorSelectionSnapshot;
  selectElementById: (id: string | null) => void;
  moveSelectedElementsByClientDelta: (delta: { x: number; y: number }) => void;
  moveSelectedElementsBySlideDelta: (delta: { x: number; y: number }) => void;
  resizeSelectedElementBySlideDelta: (resize: {
    handle: KreoSlidesResizeHandle;
    delta: { x: number; y: number };
  }) => void;
  updateSelectedElementFrame: (frame: Partial<KreoSlidesElementFrame>) => void;
  commitSelectedElementMove: () => void;
  duplicateSelectedElements: () => void;
  deleteSelectedElements: () => void;
  arrangeSelectedElements: (command: 'front' | 'back' | 'forward' | 'backward') => void;
  undo: () => void;
  redo: () => void;
  fitCanvas: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  updateCurrentSlideBackground: (color: string) => void;
  updateActiveTextContent: (content: string) => void;
  updateActiveTextStyle: (style: KreoSlidesVendorTextStylePatch) => void;
  updateActiveShapeStyle: (style: KreoSlidesVendorShapeStylePatch) => void;
  updateActiveImageStyle: (style: KreoSlidesVendorImageStylePatch) => void;
  setDocument: (data: unknown) => void | Promise<void>;
  destroy: () => void;
};

export type KreoSlidesResizeHandle =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left';

export type KreoSlidesElementFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type KreoSlidesVendorSelectionSnapshot = {
  id: string | null;
  type: string | null;
};

export type KreoSlidesVendorTextStylePatch = {
  color?: string;
  fontSize?: number;
  fontFamily?: string;
};

export type KreoSlidesVendorShapeStylePatch = {
  fill?: string;
  borderColor?: string;
  borderWidth?: number;
};

export type KreoSlidesVendorImageStylePatch = {
  opacity?: number;
  radius?: number;
};

export type KreoSlidesVendorMountOptions = {
  initialDocument?: unknown;
  locale?: string;
  labels?: Record<string, string>;
  readOnly?: boolean;
  onReady?: (api: KreoSlidesVendorEngineApi) => void;
  onChange?: (payload: { document: unknown }) => void;
  onError?: (error: unknown) => void;
};

export type KreoPptistRuntimeDocument = {
  version: 1;
  app: 'pptist';
  title: string;
  viewport: {
    width: number;
    height: number;
  };
  theme?: Record<string, unknown>;
  slides: Array<Record<string, unknown>>;
};
