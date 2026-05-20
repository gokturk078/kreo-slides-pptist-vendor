export const enum KEYS {
  C = 'C',
  X = 'X',
  Z = 'Z',
  Y = 'Y',
  A = 'A',
  G = 'G',
  L = 'L',
  F = 'F',
  D = 'D',
  B = 'B',
  P = 'P',
  O = 'O',
  R = 'R',
  T = 'T',
  MINUS = '-',
  EQUAL = '=',
  DIGIT_0 = '0',
  DELETE = 'DELETE',
  UP = 'ARROWUP',
  DOWN = 'ARROWDOWN',
  LEFT = 'ARROWLEFT',
  RIGHT = 'ARROWRIGHT',
  ENTER = 'ENTER',
  SPACE = ' ',
  TAB = 'TAB',
  BACKSPACE = 'BACKSPACE',
  ESC = 'ESCAPE',
  PAGEUP = 'PAGEUP',
  PAGEDOWN = 'PAGEDOWN',
  F5 = 'F5',
}

interface HotkeyItem {
  type: string
  children: {
    label: string
    value?: string
  }[] 
}

export const HOTKEY_DOC: HotkeyItem[] = [
  {
    type: 'General',
    children: [
      { label: 'Cut', value: 'Ctrl + X' },
      { label: 'Copy', value: 'Ctrl + C' },
      { label: 'Paste', value: 'Ctrl + V' },
      { label: 'Paste as plain text', value: 'Ctrl + Shift + V' },
      { label: 'Duplicate selection', value: 'Ctrl + D' },
      { label: 'Select all', value: 'Ctrl + A' },
      { label: 'Undo', value: 'Ctrl + Z' },
      { label: 'Redo', value: 'Ctrl + Y' },
      { label: 'Delete', value: 'Delete / Backspace' },
      { label: 'Multi-select', value: 'Ctrl / Shift' },
      { label: 'Find and replace', value: 'Ctrl + F' },
      { label: 'Print', value: 'Ctrl + P' },
      { label: 'Close', value: 'ESC' },
    ],
  },
  {
    type: 'Present',
    children: [
      { label: 'Start from beginning', value: 'F5' },
      { label: 'Start from current slide', value: 'Shift + F5' },
      { label: 'Previous slide', value: '↑ / ← / PgUp' },
      { label: 'Next slide', value: '↓ / → / PgDown' },
      { label: 'Next slide', value: 'Enter / Space' },
      { label: 'Exit presentation', value: 'ESC' },
    ],
  },
  {
    type: 'Canvas',
    children: [
      { label: 'Open selected slide', value: 'Enter' },
      { label: 'Pan canvas', value: 'Space + drag' },
      { label: 'Fit screen', value: 'Ctrl + 0' },
      { label: 'Zoom in', value: 'Ctrl + =' },
      { label: 'Zoom out', value: 'Ctrl + -' },
      { label: 'Move selection up', value: '↑' },
      { label: 'Move selection down', value: '↓' },
      { label: 'Previous slide', value: '← / PgUp' },
      { label: 'Next slide', value: '→ / PgDown' },
      { label: 'Quick text box', value: 'Double-click blank area / T' },
      { label: 'Rectangle', value: 'R' },
      { label: 'Circle', value: 'O' },
      { label: 'Line', value: 'L' },
      { label: 'Finish custom shape', value: 'Enter' },
    ],
  },
  {
    type: 'Element',
    children: [
      { label: 'Move element', value: '↑ / ← / ↓ / →' },
      { label: 'Lock element', value: 'Ctrl + L' },
      { label: 'Group', value: 'Ctrl + G' },
      { label: 'Ungroup', value: 'Ctrl + Shift + G' },
      { label: 'Bring to front', value: 'Alt + F' },
      { label: 'Send to back', value: 'Alt + B' },
      { label: 'Resize from center', value: 'Ctrl / Shift' },
      { label: 'Copy while dragging', value: 'Ctrl + drag' },
      { label: 'Keep line angle', value: 'Ctrl / Shift' },
      { label: 'Focus next element', value: 'Tab' },
      { label: 'Confirm image crop', value: 'Enter' },
      { label: 'Finish custom shape', value: 'Enter' },
    ],
  },
  {
    type: 'Table Editing',
    children: [
      { label: 'Focus next cell', value: 'Tab' },
      { label: 'Move active cell', value: '↑ / ← / ↓ / →' },
      { label: 'Insert row above', value: 'Ctrl + ↑' },
      { label: 'Insert row below', value: 'Ctrl + ↓' },
      { label: 'Insert column left', value: 'Ctrl + ←' },
      { label: 'Insert column right', value: 'Ctrl + →' },
    ],
  },
  {
    type: 'Chart Data',
    children: [
      { label: 'Focus next row', value: 'Enter' },
    ],
  },
  {
    type: 'Text Editing',
    children: [
      { label: 'Bold', value: 'Ctrl + B' },
      { label: 'Italic', value: 'Ctrl + I' },
      { label: 'Underline', value: 'Ctrl + U' },
      { label: 'Code', value: 'Ctrl + E' },
      { label: 'Superscript', value: 'Ctrl + ;' },
      { label: 'Subscript', value: `Ctrl + '` },
      { label: 'Select paragraph', value: `ESC` },
    ],
  },
  {
    type: 'Paste And Drag',
    children: [
      { label: 'Add image - paste image from clipboard' },
      { label: 'Add image - drag local image onto canvas' },
      { label: 'Add image - paste SVG onto canvas' },
      { label: 'Add image - paste a Pexels image link' },
      { label: 'Add text - paste text from clipboard' },
      { label: 'Add text - drag selected text onto canvas' },
      { label: 'Text editing - markdown tables and quotes are supported' },
    ],
  },
]
