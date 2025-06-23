const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create a 512x512 canvas
const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

// Fill with Bolt green color from the design reference
ctx.fillStyle = '#34D186';
ctx.fillRect(0, 0, 512, 512);

// Add a white letter "M" in the center
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 280px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('M', 256, 256);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
fs.writeFileSync(iconPath, buffer);

console.log('Icon created successfully at:', iconPath);
