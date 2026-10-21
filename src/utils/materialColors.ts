import { ColorScheme, ThemeStyle } from '../types';

// Convert hex to HSL
export function hexToHsl(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Convert HSL to Hex
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Generate M3 Tonal Color Scheme from Seed Color
export function generateM3Scheme(seedHex: string, isDark: boolean): ColorScheme {
  const [h, s] = hexToHsl(seedHex);
  const chroma = Math.min(Math.max(s, 25), 65);

  if (!isDark) {
    // Light mode tonal values
    return {
      primary: hslToHex(h, chroma, 38),
      onPrimary: '#ffffff',
      primaryContainer: hslToHex(h, Math.min(chroma + 10, 70), 90),
      onPrimaryContainer: hslToHex(h, chroma, 15),
      secondary: hslToHex((h + 20) % 360, Math.max(chroma - 20, 15), 45),
      secondaryContainer: hslToHex((h + 20) % 360, Math.max(chroma - 20, 20), 92),
      onSecondaryContainer: hslToHex((h + 20) % 360, chroma, 18),
      surface: hslToHex(h, 10, 98),
      surfaceVariant: hslToHex(h, 15, 93),
      surfaceContainer: hslToHex(h, 12, 95),
      surfaceContainerHigh: hslToHex(h, 14, 91),
      onSurface: hslToHex(h, 10, 12),
      onSurfaceVariant: hslToHex(h, 12, 32),
      outline: hslToHex(h, 10, 55),
      outlineVariant: hslToHex(h, 12, 82),
      tertiary: hslToHex((h + 60) % 360, chroma, 40),
      tertiaryContainer: hslToHex((h + 60) % 360, chroma, 90),
    };
  } else {
    // Dark mode tonal values
    return {
      primary: hslToHex(h, chroma, 78),
      onPrimary: hslToHex(h, chroma, 15),
      primaryContainer: hslToHex(h, chroma, 25),
      onPrimaryContainer: hslToHex(h, chroma, 92),
      secondary: hslToHex((h + 20) % 360, Math.max(chroma - 20, 20), 75),
      secondaryContainer: hslToHex((h + 20) % 360, Math.max(chroma - 20, 25), 28),
      onSecondaryContainer: hslToHex((h + 20) % 360, chroma, 90),
      surface: hslToHex(h, 8, 10),
      surfaceVariant: hslToHex(h, 10, 16),
      surfaceContainer: hslToHex(h, 10, 14),
      surfaceContainerHigh: hslToHex(h, 12, 18),
      onSurface: hslToHex(h, 10, 92),
      onSurfaceVariant: hslToHex(h, 12, 75),
      outline: hslToHex(h, 10, 48),
      outlineVariant: hslToHex(h, 12, 28),
      tertiary: hslToHex((h + 60) % 360, chroma, 75),
      tertiaryContainer: hslToHex((h + 60) % 360, chroma, 25),
    };
  }
}

// Preset themes with Material You seed colors
export const THEME_PRESETS: Record<
  ThemeStyle,
  { name: string; seed: string; wallpaper?: string }
> = {
  monet_dynamic: {
    name: 'Dynamic Monet (Sage)',
    seed: '#4F6650',
    wallpaper: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
  },
  sage: {
    name: 'Pixel Botanic',
    seed: '#386A20',
    wallpaper: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
  ocean: {
    name: 'Pacific Blue',
    seed: '#00658B',
    wallpaper: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80',
  },
  lavender: {
    name: 'Pixel Iris',
    seed: '#6B4EA2',
    wallpaper: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  },
  sunset: {
    name: 'Terra Cotta',
    seed: '#A04000',
    wallpaper: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=800&q=80',
  },
  rose: {
    name: 'Blush Rose',
    seed: '#984061',
    wallpaper: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&w=800&q=80',
  },
  amber: {
    name: 'Desert Gold',
    seed: '#825500',
    wallpaper: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  },
  slate: {
    name: 'Monochrome Slate',
    seed: '#4A6267',
    wallpaper: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
  custom: {
    name: 'Custom Wallpaper Seed',
    seed: '#4F6650',
  },
};

// Extract dominant color from image (HTML Image or canvas)
export async function extractSeedColorFromImage(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('#4F6650');
          return;
        }

        // Downsample to 64x64 for performance and color blending
        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);

        const imgData = ctx.getImageData(0, 0, 64, 64).data;
        let rTotal = 0;
        let gTotal = 0;
        let bTotal = 0;
        let count = 0;

        // Sample pixels with reasonable saturation and brightness
        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a > 200) {
            // Filter out near-pure white or near-pure black
            const brightness = (r + g + b) / 3;
            if (brightness > 35 && brightness < 225) {
              rTotal += r;
              gTotal += g;
              bTotal += b;
              count++;
            }
          }
        }

        if (count === 0) {
          resolve('#4F6650');
          return;
        }

        const avgR = Math.round(rTotal / count);
        const avgG = Math.round(gTotal / count);
        const avgB = Math.round(bTotal / count);

        const hex = `#${avgR.toString(16).padStart(2, '0')}${avgG
          .toString(16)
          .padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`;
        resolve(hex);
      } catch {
        resolve('#4F6650');
      }
    };
    img.onerror = () => {
      resolve('#4F6650');
    };
    img.src = imageUrl;
  });
}
