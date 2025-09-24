// This script creates placeholder icons for the app
// In production, replace these with actual designed icons

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon with eco-friendly theme
const createSVG = (size, text = '🌿') => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2E7D32"/>
  <rect width="${size}" height="${size}" fill="#4CAF50" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" fill="white" text-anchor="middle" dy=".3em">${text}</text>
</svg>`;
};

// Create a simple PNG placeholder (base64)
const createPNGBase64 = () => {
  // A simple 1x1 green pixel as base64
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
};

// Generate placeholder files
console.log('Creating placeholder icon files...');

// icon.png - 1024x1024
fs.writeFileSync(
  path.join(__dirname, 'icon.png'),
  Buffer.from(createPNGBase64(), 'base64')
);

// adaptive-icon.png - 1024x1024
fs.writeFileSync(
  path.join(__dirname, 'adaptive-icon.png'),
  Buffer.from(createPNGBase64(), 'base64')
);

// splash.png - 1284x2778
fs.writeFileSync(
  path.join(__dirname, 'splash.png'),
  Buffer.from(createPNGBase64(), 'base64')
);

// favicon.png - 48x48
fs.writeFileSync(
  path.join(__dirname, 'favicon.png'),
  Buffer.from(createPNGBase64(), 'base64')
);

console.log('✅ Placeholder icons created successfully!');
console.log('Note: Replace these with actual designed icons before production.');