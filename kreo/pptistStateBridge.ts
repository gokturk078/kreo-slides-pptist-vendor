import { nanoid } from 'nanoid';
import { useMainStore, useSlidesStore, useSnapshotStore } from '@/store';
import type { Slide, SlideBackground, SlideTheme } from '@/types/slides';
import type { KreoPptistRuntimeDocument } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function normalizeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizePositiveNumber(value: unknown, fallback: number): number {
  const number = normalizeNumber(value, fallback);
  return number > 0 ? number : fallback;
}

function normalizeBackground(value: unknown, fallbackColor: string): SlideBackground | undefined {
  if (typeof value === 'string' && value.trim()) return { type: 'solid', color: value };
  if (!isRecord(value)) return { type: 'solid', color: fallbackColor };

  if (value.type === 'solid') {
    return {
      ...value,
      type: 'solid',
      color: normalizeString(value.color, fallbackColor),
    } as SlideBackground;
  }

  if (value.type === 'image' || value.type === 'gradient') return value as SlideBackground;

  return { type: 'solid', color: fallbackColor };
}

function normalizeTheme(value: unknown): SlideTheme {
  const theme = isRecord(value) ? value : {};
  const themeColors = Array.isArray(theme.themeColors)
    ? theme.themeColors.filter((color): color is string => typeof color === 'string')
    : [];

  return {
    backgroundColor: normalizeString(theme.backgroundColor ?? theme.background, '#ffffff'),
    themeColors: themeColors.length > 0 ? themeColors : ['#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#4472c4', '#70ad47'],
    fontColor: normalizeString(theme.fontColor, '#333333'),
    fontName: normalizeString(theme.fontName ?? theme.fontFamily, ''),
    outline: isRecord(theme.outline)
      ? (theme.outline as SlideTheme['outline'])
      : { width: 2, color: '#525252', style: 'solid' },
    shadow: isRecord(theme.shadow)
      ? (theme.shadow as SlideTheme['shadow'])
      : { h: 3, v: 3, blur: 2, color: '#808080' },
  };
}

function normalizeSlide(value: unknown, index: number, theme: SlideTheme): Slide {
  if (!isRecord(value)) {
    return {
      id: nanoid(10),
      elements: [],
      background: { type: 'solid', color: theme.backgroundColor },
    };
  }

  return {
    ...value,
    id: normalizeString(value.id, `slide-${index + 1}`),
    elements: Array.isArray(value.elements) ? (value.elements as Slide['elements']) : [],
    background: normalizeBackground(value.background, theme.backgroundColor),
  } as Slide;
}

export function normalizePptistDocument(value: unknown): KreoPptistRuntimeDocument {
  const input = isRecord(value) ? value : {};
  const viewport = isRecord(input.viewport) ? input.viewport : {};
  const theme = normalizeTheme(input.theme);
  const rawSlides = Array.isArray(input.slides) ? input.slides : [];
  const slides = rawSlides.length > 0
    ? rawSlides.map((slide, index) => normalizeSlide(slide, index, theme))
    : [
        {
          id: 'slide-1',
          elements: [],
          background: { type: 'solid', color: theme.backgroundColor },
        } satisfies Slide,
      ];

  return {
    version: 1,
    app: 'pptist',
    title: normalizeString(input.title, 'Untitled Presentation'),
    viewport: {
      width: normalizePositiveNumber(viewport.width, 1280),
      height: normalizePositiveNumber(viewport.height, 720),
    },
    theme,
    slides: slides as unknown as Array<Record<string, unknown>>,
  };
}

export function applyPptistDocumentToStores(value: unknown): KreoPptistRuntimeDocument {
  const document = normalizePptistDocument(value);
  const slidesStore = useSlidesStore();
  const mainStore = useMainStore();
  const theme = normalizeTheme(document.theme);
  const viewportWidth = normalizePositiveNumber(document.viewport.width, 1280);
  const viewportHeight = normalizePositiveNumber(document.viewport.height, 720);

  slidesStore.setTitle(document.title);
  slidesStore.setTheme(theme);
  slidesStore.setViewportSize(viewportWidth);
  slidesStore.setViewportRatio(viewportHeight / viewportWidth);
  slidesStore.setSlides(document.slides as unknown as Slide[]);
  slidesStore.updateSlideIndex(0);
  mainStore.setActiveElementIdList([]);

  return document;
}

export function readPptistDocumentFromStores(): KreoPptistRuntimeDocument {
  const slidesStore = useSlidesStore();
  const viewportWidth = normalizePositiveNumber(slidesStore.viewportSize, 1280);
  const viewportHeight = viewportWidth * normalizePositiveNumber(slidesStore.viewportRatio, 0.5625);

  return {
    version: 1,
    app: 'pptist',
    title: normalizeString(slidesStore.title, 'Untitled Presentation'),
    viewport: {
      width: viewportWidth,
      height: viewportHeight,
    },
    theme: JSON.parse(JSON.stringify(slidesStore.theme)) as Record<string, unknown>,
    slides: JSON.parse(JSON.stringify(slidesStore.slides)) as Array<Record<string, unknown>>,
  };
}

export async function initializePptistSnapshotStore(): Promise<void> {
  try {
    const snapshotStore = useSnapshotStore();
    await snapshotStore.initSnapshotDatabase();
  } catch (error) {
    console.warn('[KreoSlides vendor] Snapshot initialization failed:', error);
  }
}
