import type { TurningMode } from '@/types/slides'

export const ANIMATION_DEFAULT_DURATION = 1000
export const ANIMATION_DEFAULT_TRIGGER = 'click'
export const ANIMATION_CLASS_PREFIX = 'animate__'

export const ENTER_ANIMATIONS = [
  {
    type: 'bounce',
    name: '',
    children: [
      { name: 'Bounc n', value: 'bounceIn' },
      { name: 'Bounc  eft', value: 'bounceInLeft' },
      { name: 'Bounc  ight', value: 'bounceInRight' },
      { name: 'Bounc  p', value: 'bounceInUp' },
      { name: 'Bounc  own', value: 'bounceInDown' },
    ],
  },
  {
    type: 'fade',
    name: '',
    children: [
      { name: 'Fad n', value: 'fadeIn' },
      { name: 'Fad  own', value: 'fadeInDown' },
      { name: 'Fad  ow ig', value: 'fadeInDownBig' },
      { name: 'Fad  eft', value: 'fadeInLeft' },
      { name: 'Fad  ef ig', value: 'fadeInLeftBig' },
      { name: 'Fad  ight', value: 'fadeInRight' },
      { name: 'Fad  igh ig', value: 'fadeInRightBig' },
      { name: 'Fad  p', value: 'fadeInUp' },
      { name: 'Fad   ig', value: 'fadeInUpBig' },
      { name: 'Fad  o eft', value: 'fadeInTopLeft' },
      { name: 'Fad  o ight', value: 'fadeInTopRight' },
      { name: 'Fad  otto eft', value: 'fadeInBottomLeft' },
      { name: 'Fad  otto ight', value: 'fadeInBottomRight' },
    ],
  },
  {
    type: 'rotate',
    name: '',
    children: [
      { name: 'Rotat n', value: 'rotateIn' },
      { name: 'Rotat  ow eft', value: 'rotateInDownLeft' },
      { name: 'Rotat  ow ight', value: 'rotateInDownRight' },
      { name: 'Rotat   eft', value: 'rotateInUpLeft' },
      { name: 'Rotat   ight', value: 'rotateInUpRight' },
    ],
  },
  {
    type: 'zoom',
    name: 'Contain',
    children: [
      { name: 'Zoo n', value: 'zoomIn' },
      { name: 'Zoo  own', value: 'zoomInDown' },
      { name: 'Zoo  eft', value: 'zoomInLeft' },
      { name: 'Zoo  ight', value: 'zoomInRight' },
      { name: 'Zoo  p', value: 'zoomInUp' },
    ],
  },
  {
    type: 'slide',
    name: '',
    children: [
      { name: 'Slid  own', value: 'slideInDown' },
      { name: 'Slid  eft', value: 'slideInLeft' },
      { name: 'Slid  ight', value: 'slideInRight' },
      { name: 'Slid  p', value: 'slideInUp' },
    ],
  },
  {
    type: 'flip',
    name: '',
    children: [
      { name: 'Fli  ', value: 'flipInX' },
      { name: 'Fli  ', value: 'flipInY' },
    ],
  },
  {
    type: 'back',
    name: 'Zoom in',
    children: [
      { name: 'Bac  own', value: 'backInDown' },
      { name: 'Bac  eft', value: 'backInLeft' },
      { name: 'Bac  ight', value: 'backInRight' },
      { name: 'Bac  p', value: 'backInUp' },
    ],
  },
  {
    type: 'lightSpeed',
    name: '',
    children: [
      { name: 'Ligh pee  ight', value: 'lightSpeedInRight' },
      { name: 'Ligh pee  eft', value: 'lightSpeedInLeft' },
    ],
  },
]

export const EXIT_ANIMATIONS = [
  {
    type: 'bounce',
    name: '',
    children: [
      { name: 'Bounc ut', value: 'bounceOut' },
      { name: 'Bounc u eft', value: 'bounceOutLeft' },
      { name: 'Bounc u ight', value: 'bounceOutRight' },
      { name: 'Bounc u p', value: 'bounceOutUp' },
      { name: 'Bounc u own', value: 'bounceOutDown' },
    ],
  },
  {
    type: 'fade',
    name: '',
    children: [
      { name: 'Fad ut', value: 'fadeOut' },
      { name: 'Fad u own', value: 'fadeOutDown' },
      { name: 'Fad u ow ig', value: 'fadeOutDownBig' },
      { name: 'Fad u eft', value: 'fadeOutLeft' },
      { name: 'Fad u ef ig', value: 'fadeOutLeftBig' },
      { name: 'Fad u ight', value: 'fadeOutRight' },
      { name: 'Fad u igh ig', value: 'fadeOutRightBig' },
      { name: 'Fad u p', value: 'fadeOutUp' },
      { name: 'Fad u  ig', value: 'fadeOutUpBig' },
      { name: 'Fad u o eft', value: 'fadeOutTopLeft' },
      { name: 'Fad u o ight', value: 'fadeOutTopRight' },
      { name: 'Fad u otto eft', value: 'fadeOutBottomLeft' },
      { name: 'Fad u otto ight', value: 'fadeOutBottomRight' },
    ],
  },
  {
    type: 'rotate',
    name: '',
    children: [
      { name: 'Rotat ut', value: 'rotateOut' },
      { name: 'Rotat u ow eft', value: 'rotateOutDownLeft' },
      { name: 'Rotat u ow ight', value: 'rotateOutDownRight' },
      { name: 'Rotat u  eft', value: 'rotateOutUpLeft' },
      { name: 'Rotat u  ight', value: 'rotateOutUpRight' },
    ],
  },
  {
    type: 'zoom',
    name: 'Contain',
    children: [
      { name: 'Zoo ut', value: 'zoomOut' },
      { name: 'Zoo u own', value: 'zoomOutDown' },
      { name: 'Zoo u eft', value: 'zoomOutLeft' },
      { name: 'Zoo u ight', value: 'zoomOutRight' },
      { name: 'Zoo u p', value: 'zoomOutUp' },
    ],
  },
  {
    type: 'slide',
    name: '',
    children: [
      { name: 'Slid u own', value: 'slideOutDown' },
      { name: 'Slid u eft', value: 'slideOutLeft' },
      { name: 'Slid u ight', value: 'slideOutRight' },
      { name: 'Slid u p', value: 'slideOutUp' },
    ],
  },
  {
    type: 'flip',
    name: '',
    children: [
      { name: 'Fli u ', value: 'flipOutX' },
      { name: 'Fli u ', value: 'flipOutY' },
    ],
  },
  {
    type: 'back',
    name: 'Zoom out',
    children: [
      { name: 'Bac u own', value: 'backOutDown' },
      { name: 'Bac u eft', value: 'backOutLeft' },
      { name: 'Bac u ight', value: 'backOutRight' },
      { name: 'Bac u p', value: 'backOutUp' },
    ],
  },
  {
    type: 'lightSpeed',
    name: '',
    children: [
      { name: 'Ligh pee u ight', value: 'lightSpeedOutRight' },
      { name: 'Ligh pee u eft', value: 'lightSpeedOutLeft' },
    ],
  },
]

export const ATTENTION_ANIMATIONS = [
  {
    type: 'shake',
    name: '',
    children: [
      { name: 'Shak ', value: 'shakeX' },
      { name: 'Shak ', value: 'shakeY' },
      { name: 'Hea hake', value: 'headShake' },
      { name: 'Swing', value: 'swing' },
      { name: 'Wobble', value: 'wobble' },
      { name: 'Tada', value: 'tada' },
      { name: 'Jello', value: 'jello' },
    ],
  },
  {
    type: 'other',
    name: '',
    children: [
      { name: 'Bounce', value: 'bounce' },
      { name: 'Flash', value: 'flash' },
      { name: 'Pulse', value: 'pulse' },
      { name: 'Rubbe and', value: 'rubberBand' },
      { name: 'Hear eat', value: 'heartBeat' },
    ],
  },
]

interface SlideAnimation {
  label: string
  value: TurningMode
}

export const SLIDE_ANIMATIONS: SlideAnimation[] = [
  { label: 'None', value: 'no' },
  { label: 'Random', value: 'random' },
  { label: 'Push left or right', value: 'slideX' },
  { label: 'Push up or down', value: 'slideY' },
  { label: 'Push left or right（3D）', value: 'slideX3D' },
  { label: 'Push up or down（3D）', value: 'slideY3D' },
  { label: 'Fade in/out', value: 'fade' },
  { label: '', value: 'rotate' },
  { label: '', value: 'scaleY' },
  { label: '', value: 'scaleX' },
  { label: 'Zoom in', value: 'scale' },
  { label: 'Zoom out', value: 'scaleReverse' },
]