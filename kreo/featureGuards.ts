import { isKreoSlidesVendorSurfaceUnsupported } from './surfacePolicy';

const UNSUPPORTED_SELECTORS = [
  '.github-link',
  '.ai-menu',
  '.aippt-content',
  '.import-section',
  '.import-grid',
  '.import-block',
  '.statement',
  '.templates',
  '.export-dialog',
  '.image-lib-panel',
  '.markup-panel',
].join(',');

const UNSUPPORTED_CLICKABLE_SELECTOR = [
  'button',
  'a',
  '.menu-item',
  '.group-menu-item',
  '.popover-menu-item',
  '.import-block',
  '.handler-item',
  '.insert-handler-item',
  '[role="button"]',
].join(',');

const USER_CONTENT_SELECTOR = [
  '.viewport',
  '.thumbnail',
  '.thumbnail-slide',
  '.ProseMirror',
  '[contenteditable="true"]',
  '.editable-element',
  '.element-content',
  '.text-element',
  '.table-element',
  '.chart-element',
].join(',');

function source(value: string): string {
  return decodeURIComponent(value);
}

const UNSUPPORTED_TEXT_MARKERS = [
  'AIPPT',
  source('AI%E7%94%9F%E6%88%90PPT'),
  source('%E6%99%BA%E8%83%BD%E7%94%9F%E6%88%90'),
  source('%E5%AF%BC%E5%85%A5'),
  source('%E5%AF%BC%E5%87%BA'),
  source('%E4%B8%8B%E8%BD%BD'),
  source('%E6%89%93%E5%8D%B0'),
  source('%E6%A8%A1%E6%9D%BF'),
  source('%E5%9C%A8%E7%BA%BF%E5%9B%BE%E5%BA%93'),
  source('%E5%9B%BE%E5%BA%93'),
  source('%E9%9F%B3%E8%A7%86%E9%A2%91'),
  source('%E8%A7%86%E9%A2%91'),
  source('%E9%9F%B3%E9%A2%91'),
  source('%E4%BA%91'),
  source('%E7%99%BB%E5%BD%95'),
  source('%E5%90%8C%E6%AD%A5'),
  source('%E6%9C%8D%E5%8A%A1%E5%99%A8'),
  source('%E4%BB%85%E4%BE%9B%E6%B5%8B%E8%AF%95'),
  source('%E6%BC%94%E7%A4%BA'),
  source('%E6%84%8F%E8%A7%81%E5%8F%8D%E9%A6%88'),
  source('%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98'),
  source('%E9%87%8D%E7%BD%AE%E5%B9%BB%E7%81%AF%E7%89%87'),
  source('%E5%B9%BB%E7%81%AF%E7%89%87%E7%B1%BB%E5%9E%8B%E6%A0%87%E6%B3%A8'),
  'AI deck',
  'AI prompt',
  'Import',
  'Export',
  'Download',
  'Print',
  'Template',
  'Templates',
  'Cloud',
  'Sync',
  'Login',
  'Server',
  'Image library',
  'Online image',
  'Media URL',
  'Video URL',
  'Audio URL',
  'PPTX',
  'PPTIST',
  'JSON',
];

const UNSUPPORTED_PORTAL_SELECTOR = [
  '.tippy-box',
  '.modal',
  '.drawer',
  '.menu-content',
  '.popover-content',
  '.fullscreen-spin',
].join(',');

function hideElement(element: HTMLElement): void {
  element.style.display = 'none';
  element.setAttribute('aria-hidden', 'true');
  element.setAttribute('data-kreo-slides-guarded', 'true');
}

function isInsideUserContent(element: HTMLElement): boolean {
  return Boolean(element.closest(USER_CONTENT_SELECTOR));
}

function getElementChromeText(element: HTMLElement): string {
  const text = element.textContent ?? '';
  const title = element.getAttribute('title') ?? '';
  const ariaLabel = element.getAttribute('aria-label') ?? '';
  const placeholder = element.getAttribute('placeholder') ?? '';
  return `${text} ${title} ${ariaLabel} ${placeholder}`.trim();
}

function isUnsupportedElement(element: HTMLElement): boolean {
  if (isInsideUserContent(element)) return false;
  if (element.matches(UNSUPPORTED_SELECTORS)) return true;
  if (element.querySelector('.ai, .aippt-content, .import-grid, .import-section')) return true;

  const combined = getElementChromeText(element);
  if (!combined) return false;

  return UNSUPPORTED_TEXT_MARKERS.some((marker) => marker && combined.includes(marker));
}

function hideUnsupportedMenuItems(root: HTMLElement): void {
  if (!root.isConnected) return;

  root.querySelectorAll<HTMLElement>(UNSUPPORTED_SELECTORS).forEach((element) => {
    if (!isInsideUserContent(element)) hideElement(element);
  });

  root.querySelectorAll<HTMLElement>(UNSUPPORTED_CLICKABLE_SELECTOR).forEach((element) => {
    if (isUnsupportedElement(element)) hideElement(element);
  });
}

function hideUnsupportedPortals(): void {
  if (!document.body.classList.contains('kreo-slides-engine-active')) return;

  document.body.querySelectorAll<HTMLElement>(UNSUPPORTED_PORTAL_SELECTOR).forEach((portalRoot) => {
    hideUnsupportedMenuItems(portalRoot);
    if (isUnsupportedElement(portalRoot)) hideElement(portalRoot);
  });
}

function guardUnsupportedPanels(root: HTMLElement): void {
  if (isKreoSlidesVendorSurfaceUnsupported('export')) {
    root.querySelectorAll<HTMLElement>('.export-dialog').forEach(hideElement);
  }
  if (isKreoSlidesVendorSurfaceUnsupported('templates')) {
    root.querySelectorAll<HTMLElement>('.templates, .select-btn').forEach(hideElement);
  }
  if (isKreoSlidesVendorSurfaceUnsupported('imageLibrary')) {
    root.querySelectorAll<HTMLElement>('.image-lib-panel').forEach(hideElement);
  }
}

export function installKreoSlidesFeatureGuards(root: HTMLElement): () => void {
  let frame = 0;

  const apply = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      hideUnsupportedMenuItems(root);
      guardUnsupportedPanels(root);
      hideUnsupportedPortals();
    });
  };

  apply();

  const rootObserver = new MutationObserver(() => apply());
  rootObserver.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['title', 'aria-label', 'placeholder', 'class'],
  });

  const bodyObserver = new MutationObserver(() => apply());
  bodyObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['title', 'aria-label', 'placeholder', 'class'],
  });

  return () => {
    if (frame) cancelAnimationFrame(frame);
    rootObserver.disconnect();
    bodyObserver.disconnect();
  };
}
