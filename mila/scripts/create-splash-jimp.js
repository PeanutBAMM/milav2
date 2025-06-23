const Jimp = require('jimp');
const path = require('path');

async function createSplash() {
  try {
    // Create a 2048x2048 image with Bolt green color (recommended splash size)
    const image = new Jimp(2048, 2048, '#34D186');

    // Load font and add text
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);

    // Add "MILA" in the center
    image.print(
      font,
      0,
      0,
      {
        text: 'MILA',
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      2048,
      2048,
    );

    // Save the splash
    const splashPath = path.join(__dirname, '..', 'assets', 'splash.png');
    await image.writeAsync(splashPath);
    console.log('Splash created successfully at:', splashPath);
  } catch (error) {
    console.error('Error creating splash:', error);
  }
}

createSplash();
