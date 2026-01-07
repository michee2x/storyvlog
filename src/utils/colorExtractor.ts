import * as ImageManipulator from 'expo-image-manipulator';
import * as jpeg from 'jpeg-js';
import { Buffer } from 'buffer';

export interface ExtractedColors {
  primary: string;
  secondary: string;
  background: string;
  accent: string;
}

// Cache to avoid re-extracting colors for the same images
const colorCache = new Map<string, ExtractedColors>();

/**
 * Extracts colors from an image by decoding the actual JPEG data
 * Uses expo-image-manipulator to resize and jpeg-js to decode raw pixels
 */
export async function extractColorsFromImage(
  imageUri: string | { uri: string } | number
): Promise<ExtractedColors> {
  try {
    // Convert image source to URI string
    let uri: string;
    if (typeof imageUri === 'string') {
      uri = imageUri;
    } else if (typeof imageUri === 'object' && 'uri' in imageUri) {
      uri = imageUri.uri;
    } else {
      return getFallbackColors();
    }

    // Check cache first
    if (colorCache.has(uri)) {
      return colorCache.get(uri)!;
    }

    console.log('🎨 Extracting pixel colors from:', uri);

    // Downsample the image to a small size for performance
    // 50x50 is detailed enough for dominant color extraction
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 50, height: 50 } }],
      { 
        compress: 1, // Max quality to get actual colors
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true 
      }
    );

    if (!manipResult.base64) {
      console.warn('⚠️ No base64 data returned');
      return getFallbackColors();
    }

    // Decode base64 to Buffer
    // React Native's Buffer polyfill or built-in needs to be handled
    const rawData = Buffer.from(manipResult.base64, 'base64');
    
    // Decode JPEG data to get raw pixels { width, height, data }
    // data is a Uint8Array [r, g, b, a, r, g, b, a, ...]
    const decodedImage = jpeg.decode(rawData, { useTArray: true });
    
    // Analyze the raw pixel data
    const colors = analyzeRawPixels(decodedImage.data);

    // Cache the result
    colorCache.set(uri, colors);

    console.log('✅ Extracted actual colors:', colors);
    return colors;
  } catch (error) {
    console.error('❌ Error extracting colors:', error);
    return getFallbackColors();
  }
}

/**
 * Analyzes raw pixel data (RGBA) to extract dominant colors
 */
function analyzeRawPixels(data: Uint8Array): ExtractedColors {
  let rTotal = 0, gTotal = 0, bTotal = 0;
  let count = 0;
  const colorBuckets = new Map<string, number>();
  
  // Iterate strictly through the data array
  // Format is [R, G, B, A, R, G, B, A, ...]
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // alpha is data[i + 3], usually 255 for JPEG
    
    // Skip very dark or very bright pixels to find the "content" color
    const brightness = (r + g + b) / 3;
    if (brightness > 20 && brightness < 235) {
      rTotal += r;
      gTotal += g;
      bTotal += b;
      count++;

      // Quantize colors to buckets for dominant color finding
      // Round to nearest 10 to group similar colors
      const qr = Math.round(r / 10) * 10;
      const qg = Math.round(g / 10) * 10;
      const qb = Math.round(b / 10) * 10;
      const key = `${qr},${qg},${qb}`;
      colorBuckets.set(key, (colorBuckets.get(key) || 0) + 1);
    }
  }
  
  if (count === 0) {
    return getFallbackColors();
  }

  // Find dominant color bucket
  let dominantColorKey = '';
  let maxCount = 0;
  for (const [key, val] of colorBuckets.entries()) {
    if (val > maxCount) {
      maxCount = val;
      dominantColorKey = key;
    }
  }
  
  // Parse dominant color
  let domR = 0, domG = 0, domB = 0;
  if (dominantColorKey) {
    const parts = dominantColorKey.split(',').map(Number);
    domR = parts[0];
    domG = parts[1];
    domB = parts[2];
  } else {
    // Fallback to average if clustering fails
    domR = Math.round(rTotal / count);
    domG = Math.round(gTotal / count);
    domB = Math.round(bTotal / count);
  }

  // Convert to HSL for generating the palette
  const hsl = rgbToHsl(domR, domG, domB);
  
  // Generate palette
  // Maintain the hue but adjust lightness/saturation for different roles
  
  // Primary: The dominant color, darkened slightly if too bright
  const primary = hslToHex(hsl.h, hsl.s, Math.min(hsl.l, 0.25));
  
  // Secondary: Same hue, slightly lighter/more saturated
  const secondary = hslToHex(hsl.h, Math.min(hsl.s + 0.1, 1), Math.min(hsl.l + 0.1, 0.35));
  
  // Background: Very dark version of the hue
  const background = hslToHex(hsl.h, hsl.s * 0.5, 0.05); // Almost black, tinted
  
  // Accent: High saturation/lightness version for contrast
  const accent = hslToHex(hsl.h, 0.9, 0.6);

  return { primary, secondary, background, accent };
}

/**
 * Converts RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return { h: h * 360, s, l };
}

/**
 * Converts HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360; // normalized to 0-1
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function getFallbackColors(): ExtractedColors {
  return {
    primary: '#1a1a2e',
    secondary: '#16213e',
    background: '#0f0f1a',
    accent: '#FF2D55',
  };
}

export function clearColorCache(): void {
  colorCache.clear();
}
