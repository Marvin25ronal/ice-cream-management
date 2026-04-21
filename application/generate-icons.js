const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputImage = path.join(
  __dirname,
  'assets',
  'images',
  'logo',
  'LOGO-17.png',
);

const iconSizes = {
  'mipmap-mdpi': { size: 48, round: 48 },
  'mipmap-hdpi': { size: 72, round: 72 },
  'mipmap-xhdpi': { size: 96, round: 96 },
  'mipmap-xxhdpi': { size: 144, round: 144 },
  'mipmap-xxxhdpi': { size: 192, round: 192 },
};

async function generateIcons() {
  console.log('🎨 Generando íconos de Android...\n');

  for (const [folder, sizes] of Object.entries(iconSizes)) {
    const outputDir = path.join(
      __dirname,
      'android',
      'app',
      'src',
      'main',
      'res',
      folder,
    );

    // Asegurar que el directorio existe
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generar ic_launcher.png (ícono cuadrado)
    const launcherPath = path.join(outputDir, 'ic_launcher.png');
    await sharp(inputImage)
      .resize(sizes.size, sizes.size, {
        fit: 'cover',
        position: 'center',
      })
      .toFile(launcherPath);

    console.log(
      `✅ Generado: ${folder}/ic_launcher.png (${sizes.size}x${sizes.size})`,
    );

    // Generar ic_launcher_round.png (ícono redondo)
    const roundPath = path.join(outputDir, 'ic_launcher_round.png');

    // Para el ícono redondo, primero redimensionamos y luego aplicamos una máscara circular
    const roundSize = sizes.round;
    const buffer = await sharp(inputImage)
      .resize(roundSize, roundSize, {
        fit: 'cover',
        position: 'center',
      })
      .toBuffer();

    // Crear una máscara circular
    const circle = Buffer.from(
      `<svg width="${roundSize}" height="${roundSize}">
        <circle cx="${roundSize / 2}" cy="${roundSize / 2}" r="${
        roundSize / 2
      }" fill="white"/>
      </svg>`,
    );

    await sharp(buffer)
      .composite([
        {
          input: circle,
          blend: 'dest-in',
        },
      ])
      .toFile(roundPath);

    console.log(
      `✅ Generado: ${folder}/ic_launcher_round.png (${roundSize}x${roundSize})`,
    );
  }

  console.log('\n🎉 ¡Todos los íconos se generaron exitosamente!');
  console.log('📱 Los íconos están listos para tu aplicación Android.');
}

generateIcons().catch(err => {
  console.error('❌ Error al generar íconos:', err);
  process.exit(1);
});
