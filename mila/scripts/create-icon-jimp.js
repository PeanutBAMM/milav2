const Jimp = require('jimp');
const path = require('path');

async function createIcon() {
  try {
    // Create a 512x512 image with Bolt green color
    const image = new Jimp(512, 512, '#34D186');

    // Load font and add text
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);

    // Add "M" in the center
    image.print(
      font,
      0,
      0,
      {
        text: 'M',
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      512,
      512,
    );

    // Save the icon
    const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
    await image.writeAsync(iconPath);
    console.log('Icon created successfully at:', iconPath);

    // Also create adaptive icon for Android (same image for now)
    const adaptivePath = path.join(__dirname, '..', 'assets', 'adaptive-icon.png');
    await image.writeAsync(adaptivePath);
    console.log('Adaptive icon created successfully at:', adaptivePath);
  } catch (error) {
    console.error('Error creating icon:', error);
  }
}

createIcon();
