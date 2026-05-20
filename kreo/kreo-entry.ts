import { createApp } from 'vue';
import { createPinia } from 'pinia';
import type { Pinia } from 'pinia';
import { nanoid } from 'nanoid';

import 'prosemirror-view/style/prosemirror.css';
import 'animate.css';
import '@/assets/styles/prosemirror.scss';
import './kreo-scope.scss';

import Directive from '@/directive';
import KreoPptistApp from './KreoPptistApp.vue';
import { useMainStore, useSlidesStore } from '@/store';
import { SHAPE_LIST } from '@/configs/shapes';
import { LINE_LIST } from '@/configs/lines';
import { createElementIdMap } from '@/utils/element';
import useCreateElement from '@/hooks/useCreateElement';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import useSlideHandler from '@/hooks/useSlideHandler';
import { installKreoSlidesFeatureGuards } from './featureGuards';
import { installKreoSlidesLocaleBridge } from './localeBridge';
import {
  applyPptistDocumentToStores,
  readPptistDocumentFromStores,
} from './pptistStateBridge';
import type {
  KreoSlidesElementFrame,
  KreoSlidesResizeHandle,
  KreoSlidesVendorEngineApi,
  KreoSlidesVendorMountOptions,
} from './types';

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error('KreoSlides vendor runtime failed.');
}

function emitChangeSoon(callback: () => void): () => void {
  let frame = 0;

  return () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      callback();
    });
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

function patchTextContentStyle(
  content: string,
  style: { color?: string; fontSize?: number; fontFamily?: string }
): string {
  if (typeof DOMParser === 'undefined') return content;
  const document = new DOMParser().parseFromString(`<div>${content}</div>`, 'text/html');
  const root = document.body.firstElementChild as HTMLElement | null;
  if (!root) return content;

  const targetElements = root.querySelectorAll('span, p');
  const targets = targetElements.length > 0 ? Array.from(targetElements) : [root];
  for (const target of targets) {
    const htmlElement = target as HTMLElement;
    if (typeof style.color === 'string') htmlElement.style.color = style.color;
    if (typeof style.fontSize === 'number' && Number.isFinite(style.fontSize)) htmlElement.style.fontSize = `${style.fontSize}px`;
    if (typeof style.fontFamily === 'string') htmlElement.style.fontFamily = style.fontFamily;
  }

  return root.innerHTML;
}

function getMinElementSize(type: string): { width: number; height: number } {
  if (type === 'text') return { width: 40, height: 24 };
  if (type === 'line') return { width: 24, height: 2 };
  return { width: 24, height: 24 };
}

function getElementHeight(element: { height?: unknown; type?: unknown; start?: unknown; end?: unknown }): number {
  if (typeof element.height === 'number' && Number.isFinite(element.height)) return element.height;
  if (
    element.type === 'line' &&
    Array.isArray(element.start) &&
    Array.isArray(element.end) &&
    typeof element.start[1] === 'number' &&
    typeof element.end[1] === 'number'
  ) {
    return Math.abs(element.end[1] - element.start[1]);
  }
  return 0;
}

function clampFrameToSlide(
  frame: KreoSlidesElementFrame,
  minSize: { width: number; height: number },
  slideSize: { width: number; height: number }
): KreoSlidesElementFrame {
  const width = Math.max(frame.width, minSize.width);
  const height = Math.max(frame.height, minSize.height);
  const overflowPadding = 80;
  return {
    x: Math.min(Math.max(frame.x, -width + overflowPadding), slideSize.width - overflowPadding),
    y: Math.min(Math.max(frame.y, -height + overflowPadding), slideSize.height - overflowPadding),
    width,
    height,
  };
}

function resizeFrame(
  frame: KreoSlidesElementFrame,
  handle: KreoSlidesResizeHandle,
  delta: { x: number; y: number },
  minSize: { width: number; height: number },
  slideSize: { width: number; height: number }
): KreoSlidesElementFrame {
  let nextX = frame.x;
  let nextY = frame.y;
  let nextWidth = frame.width;
  let nextHeight = frame.height;

  if (handle.includes('left')) {
    nextX = frame.x + delta.x;
    nextWidth = frame.width - delta.x;
    if (nextWidth < minSize.width) {
      nextX = frame.x + frame.width - minSize.width;
      nextWidth = minSize.width;
    }
  }
  if (handle.includes('right')) nextWidth = Math.max(minSize.width, frame.width + delta.x);
  if (handle.includes('top')) {
    nextY = frame.y + delta.y;
    nextHeight = frame.height - delta.y;
    if (nextHeight < minSize.height) {
      nextY = frame.y + frame.height - minSize.height;
      nextHeight = minSize.height;
    }
  }
  if (handle.includes('bottom')) nextHeight = Math.max(minSize.height, frame.height + delta.y);

  return clampFrameToSlide(
    { x: nextX, y: nextY, width: nextWidth, height: nextHeight },
    minSize,
    slideSize
  );
}

export async function mountKreoSlidesVendorEngine(
  container: HTMLElement,
  options: KreoSlidesVendorMountOptions = {}
): Promise<KreoSlidesVendorEngineApi> {
  const root = document.createElement('div');
  root.className = 'kreo-slides-engine-root kreo-slides-engine-scope';
  container.replaceChildren(root);
  document.body.classList.add('kreo-slides-engine-active');

  const pinia: Pinia = createPinia();
  const app = createApp(KreoPptistApp, {
    initialDocument: options.initialDocument,
    onMountedReady: () => {
      options.onReady?.(api);
    },
  });

  let stopLocaleBridge: (() => void) | null = null;
  let stopFeatureGuards: (() => void) | null = null;
  let stopSlidesSubscription: (() => void) | null = null;
  let isDestroyed = false;
  let isApplyingDocument = true;

  const emitChange = emitChangeSoon(() => {
    if (isDestroyed || isApplyingDocument) return;
    options.onChange?.({ document: readPptistDocumentFromStores() });
  });

  const commitChange = () => {
    useHistorySnapshot().addHistorySnapshot();
    emitChange();
  };

  const selectElementById = (id: string | null) => {
    const mainStore = useMainStore();
    const slidesStore = useSlidesStore();
    if (!id) {
      mainStore.setActiveElementIdList([]);
      return;
    }
    const exists = slidesStore.currentSlide?.elements.some((element) => element.id === id);
    if (!exists) return;
    mainStore.setActiveElementIdList([id]);
    mainStore.setHandleElementId(id);
  };

  const moveSelectedElementsBySlideDelta = (delta: { x: number; y: number }) => {
    const mainStore = useMainStore();
    const slidesStore = useSlidesStore();
    const selectedIds = mainStore.activeElementIdList;
    if (!selectedIds.length || !slidesStore.currentSlide) return;
    const slideSize = {
      width: slidesStore.viewportSize,
      height: slidesStore.viewportSize * slidesStore.viewportRatio,
    };
    const elements = slidesStore.currentSlide.elements.map((element) => {
      if (!selectedIds.includes(element.id)) return element;
      const height = getElementHeight(element);
      const frame = clampFrameToSlide(
        {
          x: element.left + delta.x,
          y: element.top + delta.y,
          width: element.width,
          height,
        },
        getMinElementSize(element.type),
        slideSize
      );
      if (element.type === 'line') return { ...element, left: frame.x, top: frame.y };
      return { ...element, left: frame.x, top: frame.y };
    });
    slidesStore.updateSlide({ elements });
    emitChange();
  };

  const updateSelectedElementFrame = (framePatch: Partial<KreoSlidesElementFrame>) => {
    const mainStore = useMainStore();
    const slidesStore = useSlidesStore();
    const activeElement = mainStore.activeElementList[0];
    if (!activeElement || !slidesStore.currentSlide) return;
    if (activeElement.type === 'line') {
      const props: Record<string, unknown> = {};
      if (typeof framePatch.x === 'number' && Number.isFinite(framePatch.x)) props.left = framePatch.x;
      if (typeof framePatch.y === 'number' && Number.isFinite(framePatch.y)) props.top = framePatch.y;
      if (!Object.keys(props).length) return;
      slidesStore.updateElement({ id: activeElement.id, props });
      emitChange();
      return;
    }

    const currentFrame = {
      x: activeElement.left,
      y: activeElement.top,
      width: activeElement.width,
      height: getElementHeight(activeElement),
    };
    const slideSize = {
      width: slidesStore.viewportSize,
      height: slidesStore.viewportSize * slidesStore.viewportRatio,
    };
    const nextFrame = clampFrameToSlide(
      {
        ...currentFrame,
        ...Object.fromEntries(
          Object.entries(framePatch).filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
        ),
      },
      getMinElementSize(activeElement.type),
      slideSize
    );
    slidesStore.updateElement({
      id: activeElement.id,
      props: {
        left: nextFrame.x,
        top: nextFrame.y,
        width: nextFrame.width,
        height: nextFrame.height,
      },
    });
    emitChange();
  };

  const api: KreoSlidesVendorEngineApi = {
    getDocument() {
      return readPptistDocumentFromStores();
    },
    getSlideIndex() {
      return useSlidesStore().slideIndex;
    },
    getCanvasPercentage() {
      return useMainStore().canvasPercentage;
    },
    selectSlide(index: number) {
      const slidesStore = useSlidesStore();
      const nextIndex = Math.min(Math.max(Math.trunc(index), 0), Math.max(slidesStore.slides.length - 1, 0));
      useMainStore().setActiveElementIdList([]);
      slidesStore.updateSlideIndex(nextIndex);
    },
    addSlide() {
      useSlideHandler().createSlide();
    },
    duplicateSlide(index?: number) {
      const slidesStore = useSlidesStore();
      const sourceIndex = typeof index === 'number' ? index : slidesStore.slideIndex;
      const sourceSlide = slidesStore.slides[sourceIndex];
      if (!sourceSlide) return;
      const slide = JSON.parse(JSON.stringify(sourceSlide));
      const { groupIdMap, elIdMap } = createElementIdMap(slide.elements);
      for (const element of slide.elements) {
        element.id = elIdMap[element.id];
        if (element.groupId) element.groupId = groupIdMap[element.groupId];
      }
      slide.id = nanoid(10);
      if (slide.name) slide.name = `${slide.name} copy`;
      useMainStore().setActiveElementIdList([]);
      slidesStore.slides.splice(sourceIndex + 1, 0, slide);
      slidesStore.updateSlideIndex(sourceIndex + 1);
      commitChange();
    },
    deleteSlide(index?: number) {
      const slidesStore = useSlidesStore();
      const sourceIndex = typeof index === 'number' ? index : slidesStore.slideIndex;
      const sourceSlide = slidesStore.slides[sourceIndex];
      if (!sourceSlide) return;
      useSlideHandler().deleteSlide([sourceSlide.id]);
      emitChange();
    },
    insertTextBox() {
      const slidesStore = useSlidesStore();
      const width = Math.min(460, slidesStore.viewportSize * 0.55);
      const height = 90;
      useCreateElement().createTextElement({
        left: (slidesStore.viewportSize - width) / 2,
        top: (slidesStore.viewportSize * slidesStore.viewportRatio - height) / 2,
        width,
        height,
      });
    },
    insertShape() {
      const slidesStore = useSlidesStore();
      const shape = SHAPE_LIST[0]?.children[0];
      if (!shape) return;
      const width = 240;
      const height = 150;
      useCreateElement().createShapeElement({
        left: (slidesStore.viewportSize - width) / 2,
        top: (slidesStore.viewportSize * slidesStore.viewportRatio - height) / 2,
        width,
        height,
      }, shape);
    },
    insertLine() {
      const slidesStore = useSlidesStore();
      const line = LINE_LIST[0]?.children[0];
      if (!line) return;
      const width = 260;
      const height = 2;
      useCreateElement().createLineElement({
        left: (slidesStore.viewportSize - width) / 2,
        top: (slidesStore.viewportSize * slidesStore.viewportRatio) / 2,
        start: [0, 0],
        end: [width, height],
      }, line);
    },
    insertChart() {
      useCreateElement().createChartElement('bar');
    },
    insertTable() {
      useCreateElement().createTableElement(3, 3);
    },
    insertImageDataUrl(dataUrl: string) {
      if (!dataUrl.startsWith('data:image/')) return;
      useCreateElement().createImageElement(dataUrl);
    },
    getSelectionSnapshot() {
      const activeElement = useMainStore().activeElementList[0];
      return {
        id: typeof activeElement?.id === 'string' ? activeElement.id : null,
        type: typeof activeElement?.type === 'string' ? activeElement.type : null,
      };
    },
    selectElementById,
    moveSelectedElementsByClientDelta(delta) {
      const mainStore = useMainStore();
      const scale = mainStore.canvasScale > 0 ? mainStore.canvasScale : 1;
      moveSelectedElementsBySlideDelta({
        x: delta.x / scale,
        y: delta.y / scale,
      });
    },
    moveSelectedElementsBySlideDelta,
    resizeSelectedElementBySlideDelta({ handle, delta }) {
      const mainStore = useMainStore();
      const slidesStore = useSlidesStore();
      const activeElement = mainStore.activeElementList[0];
      if (!activeElement || !slidesStore.currentSlide || activeElement.type === 'line') return;
      const slideSize = {
        width: slidesStore.viewportSize,
        height: slidesStore.viewportSize * slidesStore.viewportRatio,
      };
      const nextFrame = resizeFrame(
        {
          x: activeElement.left,
          y: activeElement.top,
          width: activeElement.width,
          height: getElementHeight(activeElement),
        },
        handle,
        delta,
        getMinElementSize(activeElement.type),
        slideSize
      );
      slidesStore.updateElement({
        id: activeElement.id,
        props: {
          left: nextFrame.x,
          top: nextFrame.y,
          width: nextFrame.width,
          height: nextFrame.height,
        },
      });
      emitChange();
    },
    updateSelectedElementFrame,
    commitSelectedElementMove() {
      commitChange();
    },
    duplicateSelectedElements() {
      const mainStore = useMainStore();
      const slidesStore = useSlidesStore();
      const selectedIds = mainStore.activeElementIdList;
      if (!selectedIds.length || !slidesStore.currentSlide) return;
      const sourceElements = JSON.parse(
        JSON.stringify(slidesStore.currentSlide.elements.filter((element) => selectedIds.includes(element.id)))
      );
      const { groupIdMap, elIdMap } = createElementIdMap(sourceElements);
      const duplicatedElements = sourceElements.map((element) => {
        element.id = elIdMap[element.id];
        element.left += 24;
        element.top += 24;
        if (element.groupId) element.groupId = groupIdMap[element.groupId];
        return element;
      });
      slidesStore.updateSlide({ elements: [...slidesStore.currentSlide.elements, ...duplicatedElements] });
      mainStore.setActiveElementIdList(duplicatedElements.map((element) => element.id));
      commitChange();
    },
    deleteSelectedElements() {
      const mainStore = useMainStore();
      const slidesStore = useSlidesStore();
      const selectedIds = mainStore.activeElementIdList;
      if (!selectedIds.length || !slidesStore.currentSlide) return;
      slidesStore.updateSlide({
        elements: slidesStore.currentSlide.elements.filter((element) => !selectedIds.includes(element.id)),
      });
      mainStore.setActiveElementIdList([]);
      commitChange();
    },
    arrangeSelectedElements(command) {
      const mainStore = useMainStore();
      const slidesStore = useSlidesStore();
      const selectedIds = mainStore.activeElementIdList;
      if (!selectedIds.length || !slidesStore.currentSlide) return;

      const elements = [...slidesStore.currentSlide.elements];
      const isSelected = (id: string) => selectedIds.includes(id);
      if (command === 'front') {
        elements.sort((a, b) => Number(isSelected(a.id)) - Number(isSelected(b.id)));
      }
      else if (command === 'back') {
        elements.sort((a, b) => Number(isSelected(b.id)) - Number(isSelected(a.id)));
      }
      else if (command === 'forward') {
        for (let index = elements.length - 2; index >= 0; index--) {
          if (isSelected(elements[index].id) && !isSelected(elements[index + 1].id)) {
            const item = elements[index];
            elements[index] = elements[index + 1];
            elements[index + 1] = item;
          }
        }
      }
      else {
        for (let index = 1; index < elements.length; index++) {
          if (isSelected(elements[index].id) && !isSelected(elements[index - 1].id)) {
            const item = elements[index];
            elements[index] = elements[index - 1];
            elements[index - 1] = item;
          }
        }
      }
      slidesStore.updateSlide({ elements });
      commitChange();
    },
    undo() {
      useHistorySnapshot().undo();
      emitChange();
    },
    redo() {
      useHistorySnapshot().redo();
      emitChange();
    },
    fitCanvas() {
      const mainStore = useMainStore();
      mainStore.setCanvasDragged(false);
      mainStore.setCanvasPercentage(96);
    },
    zoomIn() {
      const mainStore = useMainStore();
      mainStore.setCanvasDragged(false);
      mainStore.setCanvasPercentage(Math.min(mainStore.canvasPercentage + 10, 180));
    },
    zoomOut() {
      const mainStore = useMainStore();
      mainStore.setCanvasDragged(false);
      mainStore.setCanvasPercentage(Math.max(mainStore.canvasPercentage - 10, 45));
    },
    resetZoom() {
      const mainStore = useMainStore();
      mainStore.setCanvasDragged(false);
      mainStore.setCanvasPercentage(100);
    },
    updateCurrentSlideBackground(color) {
      if (!color) return;
      useSlidesStore().updateSlide({ background: { type: 'solid', color } });
      commitChange();
    },
    updateActiveTextContent(content) {
      const mainStore = useMainStore();
      const slidesStore = useSlidesStore();
      const activeElement = mainStore.activeElementList[0];
      if (!activeElement || activeElement.type !== 'text') return;
      slidesStore.updateElement({
        id: activeElement.id,
        props: { content: `<p>${escapeHtml(content)}</p>` },
      });
      commitChange();
    },
    updateActiveTextStyle(style) {
      const mainStore = useMainStore();
      const slidesStore = useSlidesStore();
      const activeElement = mainStore.activeElementList[0];
      if (!activeElement || activeElement.type !== 'text') return;
      const props: Record<string, unknown> = {};
      if (typeof style.color === 'string') props.defaultColor = style.color;
      if (typeof style.fontFamily === 'string') props.defaultFontName = style.fontFamily;
      const nextContent = patchTextContentStyle(activeElement.content, style);
      if (nextContent !== activeElement.content) props.content = nextContent;
      if (!Object.keys(props).length) return;
      slidesStore.updateElement({ id: activeElement.id, props });
      commitChange();
    },
    updateActiveShapeStyle(style) {
      const mainStore = useMainStore();
      const slidesStore = useSlidesStore();
      const activeElement = mainStore.activeElementList[0];
      if (!activeElement || activeElement.type !== 'shape') return;
      const props: Record<string, unknown> = {};
      if (typeof style.fill === 'string') props.fill = style.fill;
      if (typeof style.borderColor === 'string' || typeof style.borderWidth === 'number') {
        const outline = typeof activeElement.outline === 'object' && activeElement.outline
          ? { ...activeElement.outline }
          : { style: 'solid' };
        if (typeof style.borderColor === 'string') outline.color = style.borderColor;
        if (typeof style.borderWidth === 'number' && Number.isFinite(style.borderWidth)) outline.width = style.borderWidth;
        props.outline = outline;
      }
      if (!Object.keys(props).length) return;
      slidesStore.updateElement({ id: activeElement.id, props });
      commitChange();
    },
    updateActiveImageStyle(style) {
      const mainStore = useMainStore();
      const slidesStore = useSlidesStore();
      const activeElement = mainStore.activeElementList[0];
      if (!activeElement || activeElement.type !== 'image') return;
      const props: Record<string, unknown> = {};
      if (typeof style.opacity === 'number' && Number.isFinite(style.opacity)) {
        props.filters = { ...(activeElement.filters || {}), opacity: `${Math.round(style.opacity)}%` };
      }
      if (typeof style.radius === 'number' && Number.isFinite(style.radius)) props.radius = style.radius;
      if (!Object.keys(props).length) return;
      slidesStore.updateElement({ id: activeElement.id, props });
      commitChange();
    },
    setDocument(data: unknown) {
      try {
        isApplyingDocument = true;
        applyPptistDocumentToStores(data);
      } finally {
        isApplyingDocument = false;
      }
    },
    destroy() {
      if (isDestroyed) return;
      isDestroyed = true;
      stopSlidesSubscription?.();
      stopLocaleBridge?.();
      stopFeatureGuards?.();
      app.unmount();
      container.replaceChildren();
      document.body.classList.remove('kreo-slides-engine-active');
    },
  };

  try {
    app.use(Directive);
    app.use(pinia);
    app.mount(root);

    if (window.innerWidth < 1024) {
      useMainStore().setCanvasDragged(false);
      useMainStore().setCanvasPercentage(96);
    }

    const slidesStore = useSlidesStore();
    stopSlidesSubscription = slidesStore.$subscribe(() => emitChange(), { detached: true });
    stopLocaleBridge = installKreoSlidesLocaleBridge(root, options.labels);
    stopFeatureGuards = installKreoSlidesFeatureGuards(root);
    isApplyingDocument = false;
  } catch (error) {
    options.onError?.(normalizeError(error));
    api.destroy();
    throw error;
  }

  return api;
}

export type {
  KreoSlidesVendorEngineApi,
  KreoSlidesVendorMountOptions,
} from './types';
