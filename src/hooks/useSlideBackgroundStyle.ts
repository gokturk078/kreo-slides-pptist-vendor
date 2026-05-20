import { type Ref, computed } from 'vue'
import type { SlideBackground } from '@/types/slides'

export default (background: Ref<SlideBackground | undefined>) => {
  const backgroundStyle = computed(() => {
    if (!background.value) return { backgroundColor: '#fff' }

    const {
      type,
      color,
      image,
      gradient,
    } = background.value

    if (type === 'solid') return { backgroundColor: color }

    else if (type === 'image' && image) {
      const { src, size } = image
      if (!src) return { backgroundColor: '#fff' }
      if (size === 'repeat') {
        return {
          backgroundImage: `url(${src}`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'contain',
        }
      }
      return {
        backgroundImage: `url(${src}`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: size || 'cover',
      }
    }

    else if (type === 'gradient' && gradient) {
      const { type, colors, rotate } = gradient
      const list = colors.map(item => `${item.color} ${item.pos}%`)

      if (type === 'radial') return { backgroundImage: `radial-gradient(${list.join(',')}` }
      return { backgroundImage: `linear-gradient(${rotate + 90}deg, ${list.join(',')}` }
    }

    return { backgroundColor: '#fff' }
  })

  return {
    backgroundStyle,
  }
}