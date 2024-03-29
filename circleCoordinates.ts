import { promises } from 'fs';
import { Resvg } from '@resvg/resvg-js';
import axios from 'axios';

export async function circleCoordinates(
  normalizedX: number,
  normalizedY: number,
  imageUrl: string
) {
  const base64 = await convertImageToBase64(imageUrl);
  const width = 1000;
  const height = 1000;
  const thickness = 5;
  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background image -->
      <image
        href="data:image/png;base64,${base64}"
        preserveAspectRatio="xMidYMid slice"
        width="${width}"
        height="${height}" />

      <!-- Overlay circle -->
      <circle
        cx="${(normalizedX * width).toFixed(2)}"
        cy="${(normalizedY * height).toFixed(2)}"
        r="100"
        stroke="#ffdd00"
        stroke-width="${thickness}"
        fill="transparent" />
  </svg>
  `;
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const filename = `images/${new Date().getTime()}-circled.png`;
  await promises.writeFile(filename, pngBuffer);
  return filename;
}

async function convertImageToBase64(imageUrl: string) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}
