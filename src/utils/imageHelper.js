export function compressImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const render = (maxSize, quality) => {
          const canvas = document.createElement('canvas')
          let { width, height } = img

          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)
          return canvas.toDataURL('image/webp', quality)
        }

        // Jaga ukuran tetap di bawah limit 100 KB server
        let result = render(750, 0.85)
        if (result.length > 85000) result = render(600, 0.78)
        if (result.length > 85000) result = render(480, 0.70)

        resolve(result)
      }
      img.onerror = reject
      img.src = event.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}