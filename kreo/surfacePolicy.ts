export type KreoSlidesVendorSurfaceStatus = 'enabled' | 'hidden' | 'blocked';

export type KreoSlidesVendorSurface =
  | 'ai'
  | 'import'
  | 'export'
  | 'templates'
  | 'cloud'
  | 'sync'
  | 'imageLibrary'
  | 'media'
  | 'print'
  | 'demo'
  | 'text'
  | 'shape'
  | 'line'
  | 'chart'
  | 'table'
  | 'equation'
  | 'symbol'
  | 'present'
  | 'design'
  | 'style'
  | 'position'
  | 'animation'
  | 'notes'
  | 'selection'
  | 'search';

export const KREO_SLIDES_VENDOR_SURFACE_POLICY: Record<KreoSlidesVendorSurface, KreoSlidesVendorSurfaceStatus> = {
  ai: 'hidden',
  import: 'hidden',
  export: 'hidden',
  templates: 'hidden',
  cloud: 'hidden',
  sync: 'hidden',
  imageLibrary: 'hidden',
  media: 'hidden',
  print: 'hidden',
  demo: 'hidden',
  text: 'enabled',
  shape: 'enabled',
  line: 'enabled',
  chart: 'enabled',
  table: 'enabled',
  equation: 'enabled',
  symbol: 'enabled',
  present: 'enabled',
  design: 'enabled',
  style: 'enabled',
  position: 'enabled',
  animation: 'enabled',
  notes: 'enabled',
  selection: 'enabled',
  search: 'enabled',
};

export function isKreoSlidesVendorSurfaceEnabled(surface: KreoSlidesVendorSurface): boolean {
  return KREO_SLIDES_VENDOR_SURFACE_POLICY[surface] === 'enabled';
}

export function isKreoSlidesVendorSurfaceUnsupported(surface: KreoSlidesVendorSurface): boolean {
  return KREO_SLIDES_VENDOR_SURFACE_POLICY[surface] !== 'enabled';
}
