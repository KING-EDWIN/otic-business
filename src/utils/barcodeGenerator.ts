// Barcode Generation Utility
// This utility generates barcodes for products without existing barcodes

import JsBarcode from 'jsbarcode'

export interface BarcodeConfig {
  format: 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39' | 'ITF14' | 'MSI' | 'pharmacode' | 'codabar'
  width: number
  height: number
  displayValue: boolean
  fontSize: number
  margin: number
  background: string
  lineColor: string
}

export const defaultBarcodeConfig: BarcodeConfig = {
  format: 'CODE128',
  width: 2,
  height: 100,
  displayValue: true,
  fontSize: 12,
  margin: 10,
  background: '#ffffff',
  lineColor: '#000000'
}

/**
 * Generate a barcode image from text
 * @param text - The text to encode as barcode
 * @param config - Barcode configuration options
 * @returns Promise<string> - Base64 encoded image data URL
 */
export const generateBarcodeImage = async (
  text: string, 
  config: Partial<BarcodeConfig> = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not create canvas context'))
        return
      }

      // Merge config with defaults
      const finalConfig = { ...defaultBarcodeConfig, ...config }

      // Generate barcode
      JsBarcode(canvas, text, {
        format: finalConfig.format,
        width: finalConfig.width,
        height: finalConfig.height,
        displayValue: finalConfig.displayValue,
        fontSize: finalConfig.fontSize,
        margin: finalConfig.margin,
        background: finalConfig.background,
        lineColor: finalConfig.lineColor,
        textAlign: 'center',
        textPosition: 'bottom',
        textMargin: 2
      })

      // Convert canvas to data URL
      const dataURL = canvas.toDataURL('image/png')
      resolve(dataURL)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Generate a barcode and return as blob for download
 * @param text - The text to encode as barcode
 * @param filename - The filename for download
 * @param config - Barcode configuration options
 * @returns Promise<Blob> - The barcode image as blob
 */
export const generateBarcodeBlob = async (
  text: string,
  filename: string = 'barcode.png',
  config: Partial<BarcodeConfig> = {}
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not create canvas context'))
        return
      }

      const finalConfig = { ...defaultBarcodeConfig, ...config }

      JsBarcode(canvas, text, {
        format: finalConfig.format,
        width: finalConfig.width,
        height: finalConfig.height,
        displayValue: finalConfig.displayValue,
        fontSize: finalConfig.fontSize,
        margin: finalConfig.margin,
        background: finalConfig.background,
        lineColor: finalConfig.lineColor,
        textAlign: 'center',
        textPosition: 'bottom',
        textMargin: 2
      })

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Could not create blob'))
        }
      }, 'image/png')
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Generate a business-specific barcode
 * @param businessName - The business name
 * @param productName - The product name
 * @param manufacturer - The manufacturer (optional)
 * @returns string - Generated barcode text
 */
export const generateBusinessBarcode = (
  businessName: string,
  productName: string,
  manufacturer?: string
): string => {
  // Extract first 2 letters of business name
  const businessPrefix = businessName.substring(0, 2).toUpperCase()
  
  // Create product code (first 3 letters of product name)
  const productCode = productName.substring(0, 3).toUpperCase()
  
  // Create manufacturer code (first 2 letters of manufacturer or 'XX')
  const manufacturerCode = manufacturer 
    ? manufacturer.substring(0, 2).toUpperCase()
    : 'XX'
  
  // Generate random number (4 digits)
  const randomNumber = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  
  // Combine all parts
  const barcode = `${businessPrefix}${productCode}${manufacturerCode}${randomNumber}`
  
  return barcode
}

/**
 * Validate barcode format
 * @param barcode - The barcode to validate
 * @param format - The expected format
 * @returns boolean - Whether the barcode is valid
 */
export const validateBarcode = (barcode: string, format: string = 'CODE128'): boolean => {
  try {
    // Basic validation - check if barcode contains only valid characters
    const validChars = /^[0-9A-Za-z]+$/
    
    if (!validChars.test(barcode)) {
      return false
    }

    // Format-specific validation
    switch (format) {
      case 'EAN13':
        return barcode.length === 13 && /^\d+$/.test(barcode)
      case 'EAN8':
        return barcode.length === 8 && /^\d+$/.test(barcode)
      case 'UPC':
        return barcode.length === 12 && /^\d+$/.test(barcode)
      case 'CODE39':
        return barcode.length >= 1 && barcode.length <= 43
      case 'CODE128':
        return barcode.length >= 1 && barcode.length <= 80
      default:
        return barcode.length >= 1 && barcode.length <= 100
    }
  } catch (error) {
    console.error('Barcode validation error:', error)
    return false
  }
}

/**
 * Generate multiple barcodes for batch printing
 * @param products - Array of products with barcode information
 * @param config - Barcode configuration options
 * @returns Promise<string[]> - Array of base64 encoded barcode images
 */
export const generateBatchBarcodes = async (
  products: Array<{ name: string; barcode: string; brand?: string; manufacturer?: string }>,
  config: Partial<BarcodeConfig> = {}
): Promise<string[]> => {
  const promises = products.map(product => 
    generateBarcodeImage(product.barcode, config)
  )
  
  return Promise.all(promises)
}

/**
 * Create a printable barcode label
 * @param product - Product information
 * @param barcodeImage - Base64 encoded barcode image
 * @returns string - HTML string for printing
 */
export const createBarcodeLabel = (
  product: { name: string; barcode: string; brand?: string; manufacturer?: string; retail_price?: number },
  barcodeImage: string
): string => {
  return `
    <div style="
      width: 3in;
      height: 2in;
      border: 1px solid #ccc;
      padding: 8px;
      font-family: Arial, sans-serif;
      font-size: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    ">
      <div>
        <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">
          ${product.name}
        </div>
        ${product.brand ? `<div style="margin-bottom: 2px;">Brand: ${product.brand}</div>` : ''}
        ${product.manufacturer ? `<div style="margin-bottom: 2px;">Manufacturer: ${product.manufacturer}</div>` : ''}
        ${product.retail_price ? `<div style="margin-bottom: 4px;">Price: ${product.retail_price}</div>` : ''}
      </div>
      
      <div style="border-top: 1px dashed #ccc; padding-top: 4px; margin-top: 4px;">
        <img src="${barcodeImage}" style="width: 100%; height: auto;" alt="Barcode" />
        <div style="text-align: center; font-size: 8px; margin-top: 2px;">
          ${product.barcode}
        </div>
      </div>
    </div>
  `
}

/**
 * Download barcode as image file
 * @param barcodeImage - Base64 encoded barcode image
 * @param filename - The filename for download
 */
export const downloadBarcodeImage = (barcodeImage: string, filename: string = 'barcode.png'): void => {
  const link = document.createElement('a')
  link.href = barcodeImage
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Print barcode label
 * @param product - Product information
 * @param barcodeImage - Base64 encoded barcode image
 */
export const printBarcodeLabel = (
  product: { name: string; barcode: string; brand?: string; manufacturer?: string; retail_price?: number },
  barcodeImage: string
): void => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const labelHTML = createBarcodeLabel(product, barcodeImage)
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Barcode - ${product.name}</title>
        <style>
          body { margin: 0; padding: 20px; }
          @media print {
            body { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        ${labelHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `)
  
  printWindow.document.close()
}
