// Minimal type declarations for blueimp-load-image (no bundled types).
// Only the subset of the API used by app/components/My is declared.
declare module "blueimp-load-image" {
  export interface LoadImageOptions {
    maxWidth?: number
    maxHeight?: number
    orientation?: boolean | number
    canvas?: boolean
    cover?: boolean
    contain?: boolean
    crop?: boolean
    [key: string]: unknown
  }

  type LoadImageResult = HTMLCanvasElement | HTMLImageElement

  function loadImage(
    file: File | Blob | string,
    callback: (img: LoadImageResult, data?: unknown) => void,
    options?: LoadImageOptions,
  ): void

  export = loadImage
}
