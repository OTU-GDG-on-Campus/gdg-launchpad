// Client image validation and native canvas cropping; uploads remain behind the API seam.

import type { ProfileMediaKind } from '@/types'

export function validateProfileImage(file: Pick<File, 'type' | 'size'>, kind: ProfileMediaKind) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('Choose a JPG, PNG, or WebP image.')
  const max = (kind === 'avatar' ? 5 : 10) * 1024 * 1024
  if (!file.size || file.size > max)
    throw new Error(`Choose an image smaller than ${kind === 'avatar' ? 5 : 10} MB.`)
}

export function cropRectangle(
  width: number,
  height: number,
  ratio: number,
  zoom: number,
  x: number,
  y: number,
) {
  const cropWidth = Math.min(width, height * ratio) / zoom
  const cropHeight = cropWidth / ratio
  return {
    x: ((width - cropWidth) * x) / 100,
    y: ((height - cropHeight) * y) / 100,
    width: cropWidth,
    height: cropHeight,
  }
}

export async function cropProfileImage(
  file: File,
  kind: ProfileMediaKind,
  zoom: number,
  x: number,
  y: number,
): Promise<File> {
  validateProfileImage(file, kind)
  const bitmap = await createImageBitmap(file)
  try {
    if (bitmap.width * bitmap.height > 40_000_000)
      throw new Error('Choose an image with fewer than 40 megapixels.')
    const crop = cropRectangle(bitmap.width, bitmap.height, kind === 'avatar' ? 1 : 3, zoom, x, y)
    const canvas = document.createElement('canvas')
    canvas.width = kind === 'avatar' ? 512 : 1500
    canvas.height = kind === 'avatar' ? 512 : 500
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Your browser cannot crop this image.')
    context.drawImage(
      bitmap,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      canvas.width,
      canvas.height,
    )
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Could not process this image.'))),
        'image/webp',
        0.9,
      ),
    )
    return new File([blob], `${kind}.webp`, { type: 'image/webp' })
  } finally {
    bitmap.close()
  }
}
