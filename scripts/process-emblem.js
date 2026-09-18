import { Jimp } from 'jimp';
import path from 'path';

const sourceImgPath = '/data/data/com.termux/files/home/.gemini/antigravity-cli/brain/b6ebcd88-d11d-4119-8359-bb2d34e9b969/valenquest_minimal_icon_1789753190354.jpg';
const assetsDir = '/data/data/com.termux/files/home/develop/ValenQuest/www/assets';

async function processEmblem() {
  console.log('Cargando nuevo icono minimalista...');
  const image = await Jimp.read(sourceImgPath);

  // 1. Guardar PNG maestro 1024x1024
  const p1024 = path.join(assetsDir, 'emblem-valen.png');
  await image.write(p1024);
  console.log('Generado:', p1024);

  // 2. Icono 512x512 PWA
  const img512 = image.clone();
  img512.resize({ w: 512, h: 512 });
  const p512 = path.join(assetsDir, 'icon-512.png');
  await img512.write(p512);
  console.log('Generado:', p512);

  // 3. Icono 192x192 PWA
  const img192 = image.clone();
  img192.resize({ w: 192, h: 192 });
  const p192 = path.join(assetsDir, 'icon-192.png');
  await img192.write(p192);
  console.log('Generado:', p192);

  // 4. Icono maskable (adaptativo con safe zone circular al 82%)
  const maskable = new Jimp({ width: 512, height: 512, color: 0xF5EEFAFF });
  const scaledInner = image.clone();
  scaledInner.resize({ w: 430, h: 430 });
  maskable.composite(scaledInner, 41, 41);
  const pMaskable = path.join(assetsDir, 'icon-maskable.png');
  await maskable.write(pMaskable);
  console.log('Generado:', pMaskable);

  console.log('¡Iconos minimalistas procesados con éxito!');
}

processEmblem().catch(err => {
  console.error('Error procesando icono:', err);
  process.exit(1);
});
