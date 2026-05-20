interface ImageSize {
  width: number
  height: number
}

/**

 */
export const getImageSize = (src: string): Promise<ImageSize> => {
  return new Promise(resolve => {
    const img = document.createElement('img')
    img.src = src
    img.style.opacity = '0'
    document.body.appendChild(img)

    img.onload = () => {
      const imgWidth = img.clientWidth
      const imgHeight = img.clientHeight
    
      img.onload = null
      img.onerror = null

      document.body.removeChild(img)

      resolve({ width: imgWidth, height: imgHeight })
    }

    img.onerror = () => {
      img.onload = null
      img.onerror = null
    }
  })
}

/**

 */
export const getImageDataURL = (file: File): Promise<string> => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      resolve(reader.result as string)
    })
    reader.readAsDataURL(file)
  })
}

/**

 */
export const isSVGString = (text: string): boolean => {
  const svgRegex = /<svg[\s\S]*?>[\s\S]*?<\/svg>/i
  if (!svgRegex.test(text)) return false

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'image/svg+xml')
    return doc.documentElement.nodeName === 'svg'
  } 
  catch {
    return false
  }
}

/**

 */
export const svg2File = (svg: string): File => {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  return new File([blob], `${Date.now()}.svg`, { type: 'image/svg+xml' })
}