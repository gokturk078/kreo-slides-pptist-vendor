type LabelMap = Record<string, string>;

type TextReplacement = {
  source: string;
  labelKey: string;
  fallback: string;
};

const CJK_PATTERN = /[\u3040-\u30ff\u3400-\u9fff]/u;
const CJK_GLOBAL_PATTERN = /[\u3040-\u30ff\u3400-\u9fff]+/gu;
const TRANSLATABLE_ATTRIBUTES = ['title', 'aria-label', 'placeholder'];
const TRANSLATABLE_BODY_SELECTOR = [
  '.tippy-box',
  '.modal',
  '.drawer',
  '.message',
  '.fullscreen-spin',
  '.contextmenu',
  '.menu-content',
  '.popover-content',
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

function label(labels: LabelMap, key: string, fallback: string): string {
  return labels[key] || fallback;
}

const TEXT_REPLACEMENTS: TextReplacement[] = [
  { source: source('%E6%B7%BB%E5%8A%A0%E5%B9%BB%E7%81%AF%E7%89%87'), labelKey: 'toolbar.addSlide', fallback: 'Add slide' },
  { source: source('%E6%96%B0%E5%B9%BB%E7%81%AF%E7%89%87'), labelKey: 'slideList.newSlide', fallback: 'New slide' },
  { source: source('%E5%A4%8D%E5%88%B6'), labelKey: 'common.duplicate', fallback: 'Duplicate' },
  { source: source('%E5%88%A0%E9%99%A4'), labelKey: 'common.delete', fallback: 'Delete' },
  { source: source('%E5%89%AA%E5%88%87'), labelKey: 'contextMenu.cut', fallback: 'Cut' },
  { source: source('%E5%A4%8D%E5%88%B6'), labelKey: 'contextMenu.copy', fallback: 'Copy' },
  { source: source('%E7%B2%98%E8%B4%B4'), labelKey: 'contextMenu.paste', fallback: 'Paste' },
  { source: source('%E7%B2%98%E8%B4%B4%E4%B8%BA%E7%BA%AF%E6%96%87%E6%9C%AC'), labelKey: 'contextMenu.pastePlainText', fallback: 'Paste as plain text' },
  { source: source('%E5%85%A8%E9%80%89'), labelKey: 'contextMenu.selectAll', fallback: 'Select all' },
  { source: source('%E6%92%A4%E9%94%80%EF%BC%88Ctrl%20%2B%20Z%EF%BC%89'), labelKey: 'toolbar.undo', fallback: 'Undo (Ctrl + Z)' },
  { source: source('%E9%87%8D%E5%81%9A%EF%BC%88Ctrl%20%2B%20Y%EF%BC%89'), labelKey: 'toolbar.redo', fallback: 'Redo (Ctrl + Y)' },
  { source: source('%E6%89%B9%E6%B3%A8%E9%9D%A2%E6%9D%BF'), labelKey: 'comments.comments', fallback: 'Comments' },
  { source: source('%E9%80%89%E6%8B%A9%E7%AA%97%E6%A0%BC'), labelKey: 'menus.selectionPane', fallback: 'Selection pane' },
  { source: source('%E6%9F%A5%E6%89%BE%2F%E6%9B%BF%E6%8D%A2%EF%BC%88Ctrl%20%2B%20F%EF%BC%89'), labelKey: 'menus.findReplace', fallback: 'Find and replace (Ctrl + F)' },
  { source: source('%E6%9F%A5%E6%89%BE%E6%9B%BF%E6%8D%A2'), labelKey: 'menus.findReplace', fallback: 'Find and replace' },
  { source: source('%E6%8F%92%E5%85%A5%E6%96%87%E5%AD%97'), labelKey: 'toolbar.textBox', fallback: 'Insert text' },
  { source: source('%E6%96%87%E5%AD%97'), labelKey: 'toolbar.textBox', fallback: 'Text' },
  { source: source('%E6%96%87%E6%9C%AC%E6%A1%86'), labelKey: 'toolbar.textBox', fallback: 'Text box' },
  { source: source('%E6%A8%AA%E5%90%91%E6%96%87%E6%9C%AC%E6%A1%86'), labelKey: 'text.horizontalTextBox', fallback: 'Horizontal text box' },
  { source: source('%E7%AB%96%E5%90%91%E6%96%87%E6%9C%AC%E6%A1%86'), labelKey: 'text.verticalTextBox', fallback: 'Vertical text box' },
  { source: source('%E5%AD%97%E4%BD%93'), labelKey: 'text.font', fallback: 'Font' },
  { source: source('%E5%AD%97%E5%8F%B7'), labelKey: 'text.fontSize', fallback: 'Font size' },
  { source: source('%E5%AD%97%E4%BD%93%E9%A2%9C%E8%89%B2'), labelKey: 'text.fontColor', fallback: 'Font color' },
  { source: source('%E5%8A%A0%E7%B2%97'), labelKey: 'text.bold', fallback: 'Bold' },
  { source: source('%E6%96%9C%E4%BD%93'), labelKey: 'text.italic', fallback: 'Italic' },
  { source: source('%E4%B8%8B%E5%88%92%E7%BA%BF'), labelKey: 'text.underline', fallback: 'Underline' },
  { source: source('%E5%88%A0%E9%99%A4%E7%BA%BF'), labelKey: 'text.strikethrough', fallback: 'Strikethrough' },
  { source: source('%E4%B8%8A%E8%A7%92%E6%A0%87'), labelKey: 'text.superscript', fallback: 'Superscript' },
  { source: source('%E4%B8%8B%E8%A7%92%E6%A0%87'), labelKey: 'text.subscript', fallback: 'Subscript' },
  { source: source('%E8%A1%8C%E5%86%85%E4%BB%A3%E7%A0%81'), labelKey: 'text.code', fallback: 'Code' },
  { source: source('%E5%BC%95%E7%94%A8'), labelKey: 'text.quote', fallback: 'Quote' },
  { source: source('%E5%B7%A6%E5%AF%B9%E9%BD%90'), labelKey: 'text.alignLeft', fallback: 'Align left' },
  { source: source('%E5%B1%85%E4%B8%AD%E5%AF%B9%E9%BD%90'), labelKey: 'text.alignCenter', fallback: 'Align center' },
  { source: source('%E5%8F%B3%E5%AF%B9%E9%BD%90'), labelKey: 'text.alignRight', fallback: 'Align right' },
  { source: source('%E4%B8%A4%E7%AB%AF%E5%AF%B9%E9%BD%90'), labelKey: 'text.justify', fallback: 'Justify' },
  { source: source('%E8%A1%8C%E9%AB%98'), labelKey: 'text.lineHeight', fallback: 'Line height' },
  { source: source('%E6%AE%B5%E8%90%BD%E9%97%B4%E8%B7%9D'), labelKey: 'text.paragraphSpacing', fallback: 'Paragraph spacing' },
  { source: source('%E5%AD%97%E7%AC%A6%E9%97%B4%E8%B7%9D'), labelKey: 'text.characterSpacing', fallback: 'Character spacing' },
  { source: source('%E6%90%9C%E7%B4%A2%E5%AD%97%E4%BD%93'), labelKey: 'text.searchFont', fallback: 'Search font' },
  { source: source('%E6%8F%92%E5%85%A5%E5%BD%A2%E7%8A%B6'), labelKey: 'toolbar.shape', fallback: 'Insert shape' },
  { source: source('%E5%BD%A2%E7%8A%B6'), labelKey: 'toolbar.shape', fallback: 'Shape' },
  { source: source('%E9%A2%84%E8%AE%BE%E5%BD%A2%E7%8A%B6'), labelKey: 'shape.presetShapes', fallback: 'Preset shapes' },
  { source: source('%E8%87%AA%E7%94%B1%E7%BB%98%E5%88%B6'), labelKey: 'shape.freeDraw', fallback: 'Free draw' },
  { source: source('%E7%9F%A9%E5%BD%A2'), labelKey: 'shape.rectangle', fallback: 'Rectangle' },
  { source: source('%E5%9C%86%E5%BD%A2'), labelKey: 'shape.circle', fallback: 'Circle' },
  { source: source('%E5%9C%86%E8%A7%92%E7%9F%A9%E5%BD%A2'), labelKey: 'shape.roundedRectangle', fallback: 'Rounded rectangle' },
  { source: source('%E4%B8%89%E8%A7%92%E5%BD%A2'), labelKey: 'shape.triangle', fallback: 'Triangle' },
  { source: source('%E8%8F%B1%E5%BD%A2'), labelKey: 'shape.diamond', fallback: 'Diamond' },
  { source: source('%E7%AE%AD%E5%A4%B4'), labelKey: 'shape.arrows', fallback: 'Arrows' },
  { source: source('%E6%98%9F%E5%BD%A2'), labelKey: 'shape.star', fallback: 'Star' },
  { source: source('%E5%9F%BA%E6%9C%AC%E5%BD%A2%E7%8A%B6'), labelKey: 'shape.basicShapes', fallback: 'Basic shapes' },
  { source: source('%E5%B8%B8%E7%94%A8%E5%BD%A2%E7%8A%B6'), labelKey: 'shape.basicShapes', fallback: 'Basic shapes' },
  { source: source('%E5%85%B6%E4%BB%96%E5%BD%A2%E7%8A%B6'), labelKey: 'shape.otherShapes', fallback: 'Other shapes' },
  { source: source('%E7%BA%BF%E6%80%A7'), labelKey: 'shape.linear', fallback: 'Linear shapes' },
  { source: source('%E6%8F%92%E5%85%A5%E5%9B%BE%E7%89%87'), labelKey: 'toolbar.image', fallback: 'Insert image' },
  { source: source('%E5%9B%BE%E7%89%87'), labelKey: 'toolbar.image', fallback: 'Image' },
  { source: source('%E4%B8%8A%E4%BC%A0%E5%9B%BE%E7%89%87'), labelKey: 'image.uploadImage', fallback: 'Upload image' },
  { source: source('%E5%9C%A8%E7%BA%BF%E5%9B%BE%E5%BA%93'), labelKey: 'image.onlineImage', fallback: 'Image library' },
  { source: source('%E6%9B%BF%E6%8D%A2%E5%9B%BE%E7%89%87'), labelKey: 'image.replaceImage', fallback: 'Replace image' },
  { source: source('%E8%A3%81%E5%89%AA%E5%9B%BE%E7%89%87'), labelKey: 'image.cropImage', fallback: 'Crop image' },
  { source: source('%E7%A1%AE%E8%AE%A4%E5%9B%BE%E7%89%87%E8%A3%81%E5%89%AA'), labelKey: 'image.confirmCrop', fallback: 'Confirm crop' },
  { source: source('%E6%8F%92%E5%85%A5%E7%BA%BF%E6%9D%A1'), labelKey: 'toolbar.line', fallback: 'Insert line' },
  { source: source('%E7%BA%BF%E6%9D%A1'), labelKey: 'toolbar.line', fallback: 'Line' },
  { source: source('%E7%9B%B4%E7%BA%BF'), labelKey: 'lineTools.straightLine', fallback: 'Straight line' },
  { source: source('%E6%8A%98%E7%BA%BF'), labelKey: 'lineTools.polyline', fallback: 'Polyline' },
  { source: source('%E6%9B%B2%E7%BA%BF'), labelKey: 'lineTools.curve', fallback: 'Curve' },
  { source: source('%E5%B9%B3%E6%BB%91%E6%9B%B2%E7%BA%BF'), labelKey: 'lineTools.smoothCurve', fallback: 'Smooth curve' },
  { source: source('%E7%BA%BF%E6%9D%A1%E6%A0%B7%E5%BC%8F'), labelKey: 'lineTools.lineStyle', fallback: 'Line style' },
  { source: source('%E7%BA%BF%E6%9D%A1%E9%A2%9C%E8%89%B2'), labelKey: 'lineTools.lineColor', fallback: 'Line color' },
  { source: source('%E7%BA%BF%E6%9D%A1%E7%B2%97%E7%BB%86'), labelKey: 'lineTools.lineWidth', fallback: 'Line width' },
  { source: source('%E8%B5%B7%E7%82%B9%E7%AE%AD%E5%A4%B4'), labelKey: 'lineTools.startArrow', fallback: 'Start arrow' },
  { source: source('%E7%BB%88%E7%82%B9%E7%AE%AD%E5%A4%B4'), labelKey: 'lineTools.endArrow', fallback: 'End arrow' },
  { source: source('%E6%8F%92%E5%85%A5%E5%9B%BE%E8%A1%A8'), labelKey: 'toolbar.chart', fallback: 'Insert chart' },
  { source: source('%E5%9B%BE%E8%A1%A8'), labelKey: 'toolbar.chart', fallback: 'Chart' },
  { source: source('%E6%9F%B1%E7%8A%B6%E5%9B%BE'), labelKey: 'chart.bar', fallback: 'Bar chart' },
  { source: source('%E6%9D%A1%E5%BD%A2%E5%9B%BE'), labelKey: 'chart.horizontalBar', fallback: 'Horizontal bar chart' },
  { source: source('%E6%8A%98%E7%BA%BF%E5%9B%BE'), labelKey: 'chart.line', fallback: 'Line chart' },
  { source: source('%E9%9D%A2%E7%A7%AF%E5%9B%BE'), labelKey: 'chart.area', fallback: 'Area chart' },
  { source: source('%E6%95%A3%E7%82%B9%E5%9B%BE'), labelKey: 'chart.scatter', fallback: 'Scatter chart' },
  { source: source('%E9%A5%BC%E5%9B%BE'), labelKey: 'chart.pie', fallback: 'Pie chart' },
  { source: source('%E7%8E%AF%E5%BD%A2%E5%9B%BE'), labelKey: 'chart.doughnut', fallback: 'Doughnut chart' },
  { source: source('%E9%9B%B7%E8%BE%BE%E5%9B%BE'), labelKey: 'chart.radar', fallback: 'Radar chart' },
  { source: source('%E7%BC%96%E8%BE%91%E6%95%B0%E6%8D%AE'), labelKey: 'chart.editChart', fallback: 'Edit chart' },
  { source: source('%E5%9B%BE%E8%A1%A8%E6%95%B0%E6%8D%AE'), labelKey: 'chart.chartData', fallback: 'Chart data' },
  { source: source('%E6%B8%85%E7%A9%BA%E6%95%B0%E6%8D%AE'), labelKey: 'dialogs.clearData', fallback: 'Clear data' },
  { source: source('%E6%8F%92%E5%85%A5%E8%A1%A8%E6%A0%BC'), labelKey: 'toolbar.table', fallback: 'Insert table' },
  { source: source('%E8%A1%A8%E6%A0%BC'), labelKey: 'tableTools.table', fallback: 'Table' },
  { source: source('%E8%87%AA%E5%AE%9A%E4%B9%89'), labelKey: 'tableTools.custom', fallback: 'Custom' },
  { source: source('%E8%A1%8C'), labelKey: 'tableTools.rows', fallback: 'Rows' },
  { source: source('%E5%88%97'), labelKey: 'tableTools.columns', fallback: 'Columns' },
  { source: source('%E6%8F%92%E5%85%A5%E5%88%97'), labelKey: 'tableTools.insertColumn', fallback: 'Insert column' },
  { source: source('%E6%8F%92%E5%85%A5%E8%A1%8C'), labelKey: 'tableTools.insertRow', fallback: 'Insert row' },
  { source: source('%E5%88%B0%E5%B7%A6%E4%BE%A7'), labelKey: 'tableTools.insertLeft', fallback: 'Insert left' },
  { source: source('%E5%88%B0%E5%8F%B3%E4%BE%A7'), labelKey: 'tableTools.insertRight', fallback: 'Insert right' },
  { source: source('%E5%88%B0%E4%B8%8A%E6%96%B9'), labelKey: 'tableTools.insertAbove', fallback: 'Insert above' },
  { source: source('%E5%88%B0%E4%B8%8B%E6%96%B9'), labelKey: 'tableTools.insertBelow', fallback: 'Insert below' },
  { source: source('%E5%88%A0%E9%99%A4%E5%88%97'), labelKey: 'tableTools.deleteColumn', fallback: 'Delete column' },
  { source: source('%E5%88%A0%E9%99%A4%E8%A1%8C'), labelKey: 'tableTools.deleteRow', fallback: 'Delete row' },
  { source: source('%E5%90%88%E5%B9%B6%E5%8D%95%E5%85%83%E6%A0%BC'), labelKey: 'tableTools.mergeCells', fallback: 'Merge cells' },
  { source: source('%E5%8F%96%E6%B6%88%E5%90%88%E5%B9%B6%E5%8D%95%E5%85%83%E6%A0%BC'), labelKey: 'tableTools.splitCells', fallback: 'Split cells' },
  { source: source('%E9%80%89%E4%B8%AD%E5%BD%93%E5%89%8D%E5%88%97'), labelKey: 'tableTools.selectColumn', fallback: 'Select column' },
  { source: source('%E9%80%89%E4%B8%AD%E5%BD%93%E5%89%8D%E8%A1%8C'), labelKey: 'tableTools.selectRow', fallback: 'Select row' },
  { source: source('%E9%80%89%E4%B8%AD%E5%85%A8%E9%83%A8%E5%8D%95%E5%85%83%E6%A0%BC'), labelKey: 'tableTools.selectAllCells', fallback: 'Select all cells' },
  { source: source('%E6%8F%92%E5%85%A5%E5%85%AC%E5%BC%8F'), labelKey: 'toolbar.equation', fallback: 'Insert equation' },
  { source: source('%E5%85%AC%E5%BC%8F'), labelKey: 'toolbar.equation', fallback: 'Equation' },
  { source: source('%E8%BE%93%E5%85%A5%20LaTeX%20%E5%85%AC%E5%BC%8F'), labelKey: 'equation.enterLatexEquation', fallback: 'Enter LaTeX equation' },
  { source: source('%E5%85%AC%E5%BC%8F%E9%A2%84%E8%A7%88'), labelKey: 'equation.equationPreview', fallback: 'Equation preview' },
  { source: source('%E5%B8%B8%E7%94%A8%E7%AC%A6%E5%8F%B7'), labelKey: 'equation.commonSymbols', fallback: 'Common symbols' },
  { source: source('%E9%A2%84%E8%AE%BE%E5%85%AC%E5%BC%8F'), labelKey: 'equation.presetEquations', fallback: 'Preset equations' },
  { source: source('%E6%95%B0%E5%AD%A6'), labelKey: 'equation.math', fallback: 'Math' },
  { source: source('%E8%BF%90%E7%AE%97%E7%AC%A6'), labelKey: 'equation.operators', fallback: 'Operators' },
  { source: source('%E5%87%BD%E6%95%B0'), labelKey: 'equation.functions', fallback: 'Functions' },
  { source: source('%E5%B8%8C%E8%85%8A%E5%AD%97%E6%AF%8D'), labelKey: 'equation.greekLetters', fallback: 'Greek letters' },
  { source: source('%E6%8F%92%E5%85%A5%E9%9F%B3%E8%A7%86%E9%A2%91'), labelKey: 'toolbar.media', fallback: 'Insert media' },
  { source: source('%E9%9F%B3%E8%A7%86%E9%A2%91'), labelKey: 'toolbar.media', fallback: 'Media' },
  { source: source('%E8%A7%86%E9%A2%91'), labelKey: 'media.video', fallback: 'Video' },
  { source: source('%E9%9F%B3%E9%A2%91'), labelKey: 'media.audio', fallback: 'Audio' },
  { source: source('%E4%B8%8A%E4%BC%A0%E6%9C%AC%E5%9C%B0%E8%A7%86%E9%A2%91'), labelKey: 'media.uploadLocalVideo', fallback: 'Upload local video' },
  { source: source('%E4%B8%8A%E4%BC%A0%E6%9C%AC%E5%9C%B0%E9%9F%B3%E9%A2%91'), labelKey: 'media.uploadLocalAudio', fallback: 'Upload local audio' },
  { source: source('%E8%AF%B7%E8%BE%93%E5%85%A5%E9%9F%B3%E8%A7%86%E9%A2%91%E5%9C%B0%E5%9D%80'), labelKey: 'media.videoUrl', fallback: 'Video URL' },
  { source: source('%E5%80%8D%E9%80%9F'), labelKey: 'media.playbackSpeed', fallback: 'Playback speed' },
  { source: source('%E5%BE%AA%E7%8E%AF%E5%BC%80'), labelKey: 'media.loopOn', fallback: 'Loop on' },
  { source: source('%E5%BE%AA%E7%8E%AF%E5%85%B3'), labelKey: 'media.loopOff', fallback: 'Loop off' },
  { source: source('%E8%A7%86%E9%A2%91%E5%8A%A0%E8%BD%BD%E5%A4%B1%E8%B4%A5'), labelKey: 'media.loadFailed', fallback: 'Media failed to load' },
  { source: source('%E6%8F%92%E5%85%A5%E7%AC%A6%E5%8F%B7'), labelKey: 'toolbar.symbol', fallback: 'Insert symbol' },
  { source: source('%E7%AC%A6%E5%8F%B7'), labelKey: 'toolbar.symbol', fallback: 'Symbol' },
  { source: source('%E5%AD%97%E6%AF%8D'), labelKey: 'symbolPanel.letters', fallback: 'Letters' },
  { source: source('%E6%95%B0%E5%AD%97'), labelKey: 'symbolPanel.numbers', fallback: 'Numbers' },
  { source: source('%E7%AC%A6%E5%8F%B7'), labelKey: 'symbolPanel.shapes', fallback: 'Symbols' },
  { source: source('%E7%94%BB%E5%B8%83%E7%BC%A9%E5%B0%8F%EF%BC%88Ctrl%20%2B%20-%EF%BC%89'), labelKey: 'toolbar.zoomOut', fallback: 'Zoom out (Ctrl + -)' },
  { source: source('%E7%94%BB%E5%B8%83%E6%94%BE%E5%A4%A7%EF%BC%88Ctrl%20%2B%20%3D%EF%BC%89'), labelKey: 'toolbar.zoomIn', fallback: 'Zoom in (Ctrl + =)' },
  { source: source('%E9%80%82%E5%BA%94%E5%B1%8F%E5%B9%95%EF%BC%88Ctrl%20%2B%200%EF%BC%89'), labelKey: 'toolbar.fitScreen', fallback: 'Fit screen (Ctrl + 0)' },
  { source: source('%E9%80%82%E5%BA%94%E5%B1%8F%E5%B9%95'), labelKey: 'toolbar.fitScreen', fallback: 'Fit screen' },
  { source: source('%E8%AE%BE%E8%AE%A1'), labelKey: 'designPanel.design', fallback: 'Design' },
  { source: source('%E5%88%87%E6%8D%A2'), labelKey: 'panels.transition', fallback: 'Transition' },
  { source: source('%E5%8A%A8%E7%94%BB'), labelKey: 'animationPanel.animation', fallback: 'Animation' },
  { source: source('%E6%A0%B7%E5%BC%8F%EF%BC%88%E5%A4%9A%E9%80%89%EF%BC%89'), labelKey: 'stylePanel.style', fallback: 'Style (multiple)' },
  { source: source('%E4%BD%8D%E7%BD%AE%EF%BC%88%E5%A4%9A%E9%80%89%EF%BC%89'), labelKey: 'positionPanel.position', fallback: 'Position (multiple)' },
  { source: source('%E6%A0%B7%E5%BC%8F'), labelKey: 'stylePanel.style', fallback: 'Style' },
  { source: source('%E4%BD%8D%E7%BD%AE'), labelKey: 'positionPanel.position', fallback: 'Position' },
  { source: source('%E8%83%8C%E6%99%AF%E5%A1%AB%E5%85%85'), labelKey: 'designPanel.backgroundFill', fallback: 'Background fill' },
  { source: source('%E7%BA%AF%E8%89%B2%E5%A1%AB%E5%85%85'), labelKey: 'designPanel.solidFill', fallback: 'Solid fill' },
  { source: source('%E5%9B%BE%E7%89%87%E5%A1%AB%E5%85%85'), labelKey: 'designPanel.imageFill', fallback: 'Image fill' },
  { source: source('%E6%B8%90%E5%8F%98%E5%A1%AB%E5%85%85'), labelKey: 'designPanel.gradientFill', fallback: 'Gradient fill' },
  { source: source('%E5%AE%BD%E5%B1%8F'), labelKey: 'designPanel.aspectRatio', fallback: 'Wide screen' },
  { source: source('%E5%AE%BD%E5%B1%8F%2016%20%3A%209'), labelKey: 'designPanel.wide169', fallback: 'Wide 16:9' },
  { source: source('%E5%AE%BD%E5%B1%8F%2016%20%3A%2010'), labelKey: 'designPanel.wide1610', fallback: 'Wide 16:10' },
  { source: source('%E6%A0%87%E5%87%86%204%20%3A%203'), labelKey: 'designPanel.standard43', fallback: 'Standard 4:3' },
  { source: source('%E7%BA%B8%E5%BC%A0%20A3%20%2F%20A4'), labelKey: 'designPanel.paperA', fallback: 'Paper A3/A4' },
  { source: source('%E7%AB%96%E5%90%91%20A3%20%2F%20A4'), labelKey: 'designPanel.portraitA', fallback: 'Portrait A3/A4' },
  { source: source('%E7%94%BB%E5%B8%83%E5%B0%BA%E5%AF%B8'), labelKey: 'designPanel.canvasSize', fallback: 'Canvas size' },
  { source: source('%E5%85%A8%E5%B1%80%E4%B8%BB%E9%A2%98'), labelKey: 'designPanel.globalTheme', fallback: 'Global theme' },
  { source: source('%E5%AD%97%E4%BD%93%EF%BC%9A'), labelKey: 'text.font', fallback: 'Font:' },
  { source: source('%E5%AD%97%E4%BD%93%E9%A2%9C%E8%89%B2%EF%BC%9A'), labelKey: 'text.fontColor', fallback: 'Font color:' },
  { source: source('%E8%83%8C%E6%99%AF%E9%A2%9C%E8%89%B2%EF%BC%9A'), labelKey: 'designPanel.backgroundColor', fallback: 'Background color:' },
  { source: source('%E4%B8%BB%E9%A2%98%E8%89%B2%EF%BC%9A'), labelKey: 'designPanel.themeColor', fallback: 'Theme color:' },
  { source: source('%E8%BE%B9%E6%A1%86%E6%A0%B7%E5%BC%8F%EF%BC%9A'), labelKey: 'designPanel.borderStyle', fallback: 'Border style:' },
  { source: source('%E8%BE%B9%E6%A1%86%E9%A2%9C%E8%89%B2%EF%BC%9A'), labelKey: 'designPanel.borderColor', fallback: 'Border color:' },
  { source: source('%E8%BE%B9%E6%A1%86%E7%B2%97%E7%BB%86%EF%BC%9A'), labelKey: 'designPanel.borderWidth', fallback: 'Border width:' },
  { source: source('%E6%B0%B4%E5%B9%B3%E9%98%B4%E5%BD%B1%EF%BC%9A'), labelKey: 'designPanel.horizontalShadow', fallback: 'Horizontal shadow:' },
  { source: source('%E5%9E%82%E7%9B%B4%E9%98%B4%E5%BD%B1%EF%BC%9A'), labelKey: 'designPanel.verticalShadow', fallback: 'Vertical shadow:' },
  { source: source('%E6%A8%A1%E7%B3%8A%E8%B7%9D%E7%A6%BB%EF%BC%9A'), labelKey: 'designPanel.blurDistance', fallback: 'Blur distance:' },
  { source: source('%E9%98%B4%E5%BD%B1%E9%A2%9C%E8%89%B2%EF%BC%9A'), labelKey: 'designPanel.shadowColor', fallback: 'Shadow color:' },
  { source: source('%E9%A2%84%E7%BD%AE%E4%B8%BB%E9%A2%98'), labelKey: 'designPanel.presetThemes', fallback: 'Preset themes' },
  { source: source('%E5%BA%94%E7%94%A8%E8%83%8C%E6%99%AF%E5%88%B0%E5%85%A8%E9%83%A8'), labelKey: 'designPanel.applyBackgroundToAll', fallback: 'Apply background to all' },
  { source: source('%E5%BA%94%E7%94%A8%E4%B8%BB%E9%A2%98%E5%88%B0%E5%85%A8%E9%83%A8'), labelKey: 'designPanel.applyThemeToAll', fallback: 'Apply theme to all' },
  { source: source('%E5%85%A8%E5%B1%80%E7%BB%9F%E4%B8%80%E5%AD%97%E4%BD%93'), labelKey: 'designPanel.unifyFont', fallback: 'Unify font' },
  { source: source('%E4%BB%8E%E5%B9%BB%E7%81%AF%E7%89%87%E6%8F%90%E5%8F%96%E4%B8%BB%E9%A2%98'), labelKey: 'designPanel.extractThemeFromSlide', fallback: 'Extract theme from slide' },
  { source: source('%E8%AE%BE%E7%BD%AE'), labelKey: 'designPanel.setTheme', fallback: 'Set theme' },
  { source: source('%E8%AE%BE%E7%BD%AE%E5%B9%B6%E5%BA%94%E7%94%A8'), labelKey: 'designPanel.setAndApply', fallback: 'Set and apply' },
  { source: source('%E6%9B%B4%E5%A4%9A'), labelKey: 'common.more', fallback: 'More' },
  { source: source('%E5%8F%96%E6%B6%88'), labelKey: 'common.cancel', fallback: 'Cancel' },
  { source: source('%E7%A1%AE%E8%AE%A4'), labelKey: 'common.confirm', fallback: 'Confirm' },
  { source: source('%E5%85%B3%E9%97%AD'), labelKey: 'common.close', fallback: 'Close' },
  { source: source('%E8%AF%B7%E8%BE%93%E5%85%A5%E7%BD%91%E9%A1%B5%E9%93%BE%E6%8E%A5%E5%9C%B0%E5%9D%80'), labelKey: 'dialogs.webLink', fallback: 'Enter web link' },
  { source: source('%E9%A2%84%E8%A7%88%EF%BC%9A'), labelKey: 'dialogs.preview', fallback: 'Preview:' },
  { source: source('%E7%BD%91%E9%A1%B5%E9%93%BE%E6%8E%A5'), labelKey: 'dialogs.webLink', fallback: 'Web link' },
  { source: source('%E5%B9%BB%E7%81%AF%E7%89%87%E9%A1%B5%E9%9D%A2'), labelKey: 'dialogs.slidePage', fallback: 'Slide page' },
  { source: source('%E4%B8%8D%E6%98%AF%E6%AD%A3%E7%A1%AE%E7%9A%84%E7%BD%91%E9%A1%B5%E9%93%BE%E6%8E%A5%E5%9C%B0%E5%9D%80'), labelKey: 'dialogs.invalidWebLink', fallback: 'Enter a valid web link.' },
  { source: source('%E6%97%A0'), labelKey: 'common.none', fallback: 'None' },
  { source: source('%E9%9A%8F%E6%9C%BA'), labelKey: 'animationPanel.random', fallback: 'Random' },
  { source: source('%E6%B7%A1%E5%85%A5%E6%B7%A1%E5%87%BA'), labelKey: 'animationPanel.fadeInOut', fallback: 'Fade in/out' },
  { source: source('%E5%B7%A6%E5%8F%B3%E6%8E%A8%E7%A7%BB'), labelKey: 'transition.pushLeftRight', fallback: 'Push left or right' },
  { source: source('%E4%B8%8A%E4%B8%8B%E6%8E%A8%E7%A7%BB'), labelKey: 'transition.pushUpDown', fallback: 'Push up or down' },
  { source: source('%E6%94%BE%E5%A4%A7'), labelKey: 'animationPanel.zoomIn', fallback: 'Zoom in' },
  { source: source('%E7%BC%A9%E5%B0%8F'), labelKey: 'animationPanel.zoomOut', fallback: 'Zoom out' },
  { source: source('%E5%BA%94%E7%94%A8%E5%88%B0%E5%85%A8%E9%83%A8'), labelKey: 'common.applyToAll', fallback: 'Apply to all' },
  { source: source('%E7%82%B9%E5%87%BB%E8%BE%93%E5%85%A5%E6%BC%94%E8%AE%B2%E8%80%85%E5%A4%87%E6%B3%A8'), labelKey: 'comments.speakerNotes', fallback: 'Click to add speaker notes' },
  { source: source('%E6%9C%AA%E5%91%BD%E5%90%8D%E6%BC%94%E7%A4%BA%E6%96%87%E7%A8%BF'), labelKey: 'status.untitledPresentation', fallback: 'Untitled Presentation' },
  { source: source('%E5%AE%98%E6%96%B9%E5%88%B6%E4%BD%9C'), labelKey: 'status.officialTemplate', fallback: 'Official template' },
  { source: source('%E7%A4%BE%E5%8C%BA%E8%B4%A1%E7%8C%AE%2B%E5%AE%98%E6%96%B9%E6%B7%B1%E5%BA%A6%E5%AE%8C%E5%96%84%E4%BC%98%E5%8C%96'), labelKey: 'status.communityTemplate', fallback: 'Community template' },
  { source: source('%E5%B1%B1%E6%B2%B3%E6%98%A0%E7%BA%A2'), labelKey: 'themePanel.warmOrange', fallback: 'Warm Orange' },
  { source: source('%E9%83%BD%E5%B8%82%E8%93%9D%E8%B0%83'), labelKey: 'themePanel.modernBlue', fallback: 'Modern Blue' },
  { source: source('%E6%99%BA%E6%84%9F%E5%87%A0%E4%BD%95'), labelKey: 'themePanel.professionalSlate', fallback: 'Professional Slate' },
  { source: source('%E6%9F%94%E5%85%89%E8%8E%AB%E5%85%B0%E8%BF%AA'), labelKey: 'themePanel.softPastel', fallback: 'Soft Pastel' },
  { source: source('%E7%AE%80%E7%BA%A6%E7%BB%BF%E6%84%8F'), labelKey: 'themePanel.freshGreen', fallback: 'Fresh Green' },
  { source: source('%E6%9A%96%E8%89%B2%E5%A4%8D%E5%8F%A4'), labelKey: 'themePanel.warmOrange', fallback: 'Warm Orange' },
  { source: source('%E6%B7%B1%E9%82%83%E6%B2%89%E7%A8%B3'), labelKey: 'themePanel.executiveDark', fallback: 'Executive Dark' },
  { source: source('%E6%B5%85%E8%93%9D%E5%B0%8F%E6%B8%85%E6%96%B0'), labelKey: 'themePanel.cleanWhite', fallback: 'Clean White' },
  { source: source('%E5%8A%A0%E8%BD%BD%E4%B8%AD...'), labelKey: 'common.loading', fallback: 'Loading...' },
  { source: source('%E6%95%B0%E6%8D%AE%E5%88%9D%E5%A7%8B%E5%8C%96%E4%B8%AD%EF%BC%8C%E8%AF%B7%E7%A8%8D%E7%AD%89%20...'), labelKey: 'status.loadingPresentation', fallback: 'Loading presentation data...' },
  { source: source('%E4%BB%8E%E5%A4%B4%E5%BC%80%E5%A7%8B'), labelKey: 'present.startFromBeginning', fallback: 'Start from beginning' },
  { source: source('%E4%BB%8E%E5%BD%93%E5%89%8D%E9%A1%B5%E5%BC%80%E5%A7%8B'), labelKey: 'present.startFromCurrentSlide', fallback: 'Start from current slide' },
  { source: source('%E6%A0%87%E5%B0%BA'), labelKey: 'menus.ruler', fallback: 'Ruler' },
  { source: source('%E7%BD%91%E6%A0%BC%E7%BA%BF'), labelKey: 'menus.grid', fallback: 'Grid' },
  { source: source('%E4%B8%8D%E4%BD%BF%E7%94%A8'), labelKey: 'menus.noGrid', fallback: 'None' },
  { source: source('%E5%B0%8F'), labelKey: 'menus.small', fallback: 'Small' },
  { source: source('%E4%B8%AD'), labelKey: 'menus.medium', fallback: 'Medium' },
  { source: source('%E5%A4%A7'), labelKey: 'menus.large', fallback: 'Large' },
  { source: source('%E9%87%8D%E7%BD%AE%E5%BD%93%E5%89%8D%E9%A1%B5'), labelKey: 'menus.resetCurrentSlide', fallback: 'Reset current slide' },
  { source: source('%E5%B9%BB%E7%81%AF%E7%89%87%E6%94%BE%E6%98%A0'), labelKey: 'menus.slideshow', fallback: 'Slideshow' },
];

const UNSUPPORTED_REPLACEMENTS: TextReplacement[] = [
  { source: source('AI%E7%94%9F%E6%88%90PPT'), labelKey: 'guards.aiComingSoon', fallback: 'KreoSlides AI will be connected in a later phase.' },
  { source: source('%E8%BE%93%E5%85%A5%E4%B8%80%E5%8F%A5%E8%AF%9D%EF%BC%8C%E6%99%BA%E8%83%BD%E7%94%9F%E6%88%90%E6%BC%94%E7%A4%BA%E6%96%87%E7%A8%BF'), labelKey: 'guards.aiComingSoon', fallback: 'KreoSlides AI will be connected in a later phase.' },
  { source: source('%E5%AF%BC%E5%85%A5%E6%96%87%E4%BB%B6'), labelKey: 'guards.pptxImportComingSoon', fallback: 'PPTX import will be connected in a later KreoSlides phase.' },
  { source: source('%E5%AF%BC%E5%87%BA%E6%96%87%E4%BB%B6'), labelKey: 'guards.exportComingSoon', fallback: 'Export will be connected in a later KreoSlides phase.' },
  { source: source('%E5%AF%BC%E5%87%BA'), labelKey: 'guards.exportComingSoon', fallback: 'Export will be connected in a later KreoSlides phase.' },
  { source: source('%E9%87%8D%E7%BD%AE%E5%B9%BB%E7%81%AF%E7%89%87'), labelKey: 'guards.unsupportedVendorFeature', fallback: 'This vendor feature is disabled in KreoSlides.' },
  { source: source('%E5%B9%BB%E7%81%AF%E7%89%87%E7%B1%BB%E5%9E%8B%E6%A0%87%E6%B3%A8'), labelKey: 'guards.unsupportedVendorFeature', fallback: 'This vendor feature is disabled in KreoSlides.' },
  { source: source('%E6%84%8F%E8%A7%81%E5%8F%8D%E9%A6%88'), labelKey: 'guards.unsupportedVendorFeature', fallback: 'This vendor feature is disabled in KreoSlides.' },
  { source: source('%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98'), labelKey: 'guards.unsupportedVendorFeature', fallback: 'This vendor feature is disabled in KreoSlides.' },
  { source: source('%E6%B3%A8%EF%BC%9A%E6%9C%AC%E7%AB%99%E4%BB%85%E4%BD%9C%E6%B5%8B%E8%AF%95%2F%E6%BC%94%E7%A4%BA%EF%BC%8C%E4%B8%8D%E6%8F%90%E4%BE%9B%E4%BB%BB%E4%BD%95%E5%BD%A2%E5%BC%8F%E7%9A%84%E6%9C%8D%E5%8A%A1'), labelKey: 'guards.unsupportedVendorFeature', fallback: 'This vendor feature is disabled in KreoSlides.' },
  { source: source('%E6%AD%A3%E5%9C%A8%E5%AF%BC%E5%85%A5...'), labelKey: 'common.loading', fallback: 'Loading...' },
];

const ALL_REPLACEMENTS = [...UNSUPPORTED_REPLACEMENTS, ...TEXT_REPLACEMENTS];

function hasSourceText(value: string): boolean {
  return CJK_PATTERN.test(value) || ALL_REPLACEMENTS.some(({ source }) => value.includes(source));
}

function preserveWhitespace(original: string, replacement: string): string {
  const leading = original.match(/^\s*/)?.[0] ?? '';
  const trailing = original.match(/\s*$/)?.[0] ?? '';
  return `${leading}${replacement}${trailing}`;
}

function translateText(value: string, labels: LabelMap): string {
  const trimmed = value.trim();
  const exact = ALL_REPLACEMENTS.find(({ source }) => source === trimmed);
  if (exact) return preserveWhitespace(value, label(labels, exact.labelKey, exact.fallback));

  const slideToken = source('%E5%B9%BB%E7%81%AF%E7%89%87');
  if (trimmed.includes(slideToken) && trimmed.includes('/')) {
    return value.replaceAll(slideToken, label(labels, 'status.slide', 'Slide'));
  }

  let result = value;
  for (const { source, labelKey, fallback } of ALL_REPLACEMENTS) {
    if (result.includes(source)) result = result.replaceAll(source, label(labels, labelKey, fallback));
  }

  if (CJK_PATTERN.test(result)) {
    result = result.replace(CJK_GLOBAL_PATTERN, '').replace(/\s{2,}/g, ' ').trim();
    return result ? preserveWhitespace(value, result) : '';
  }

  return result;
}

function shouldSkipNode(node: Node): boolean {
  const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node instanceof Element ? node : null;
  return Boolean(element?.closest(USER_CONTENT_SELECTOR));
}

function translateElementText(root: HTMLElement, labels: LabelMap): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let current = walker.nextNode();

  while (current) {
    const textNode = current as Text;
    const value = textNode.nodeValue ?? '';
    if (value.trim() && hasSourceText(value)) {
      textNode.nodeValue = translateText(value, labels);
    }
    current = walker.nextNode();
  }
}

function translateElementAttributes(root: HTMLElement, labels: LabelMap): void {
  const elements = root.querySelectorAll<HTMLElement>('*');

  elements.forEach((element) => {
    if (element.closest(USER_CONTENT_SELECTOR)) return;
    for (const attribute of TRANSLATABLE_ATTRIBUTES) {
      const value = element.getAttribute(attribute);
      if (value && hasSourceText(value)) element.setAttribute(attribute, translateText(value, labels));
    }
  });
}

function translateRoot(root: HTMLElement, labels: LabelMap): void {
  translateElementText(root, labels);
  translateElementAttributes(root, labels);
}

function getBodyPortalRoots(): HTMLElement[] {
  if (!document.body.classList.contains('kreo-slides-engine-active')) return [];
  return Array.from(document.body.querySelectorAll<HTMLElement>(TRANSLATABLE_BODY_SELECTOR));
}

export function installKreoSlidesLocaleBridge(
  root: HTMLElement,
  labels: LabelMap = {}
): () => void {
  let frame = 0;

  const translate = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      translateRoot(root, labels);
      getBodyPortalRoots().forEach((portalRoot) => translateRoot(portalRoot, labels));
    });
  };

  translate();

  const rootObserver = new MutationObserver(() => translate());
  rootObserver.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: TRANSLATABLE_ATTRIBUTES,
  });

  const bodyObserver = new MutationObserver(() => translate());
  bodyObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class', ...TRANSLATABLE_ATTRIBUTES],
  });

  return () => {
    if (frame) cancelAnimationFrame(frame);
    rootObserver.disconnect();
    bodyObserver.disconnect();
  };
}
