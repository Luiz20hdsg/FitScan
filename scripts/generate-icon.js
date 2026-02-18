#!/usr/bin/env node
/**
 * FitScan App Icon Generator
 * Generates the gradient flash icon for iOS and Android
 * Uses Node.js canvas to draw the icon programmatically
 */

const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

// Colors from our theme
const GRADIENT_START = '#6366F1'; // Indigo
const GRADIENT_END = '#06B6D4';   // Cyan
const BACKGROUND = '#0A0A0F';

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, size, size);
  
  // Gradient circle
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.38;
  
  // Create gradient
  const gradient = ctx.createLinearGradient(
    centerX - radius, centerY - radius,
    centerX + radius, centerY + radius
  );
  gradient.addColorStop(0, GRADIENT_START);
  gradient.addColorStop(1, GRADIENT_END);
  
  // Draw rounded rect (iOS style)
  const cornerRadius = size * 0.22;
  ctx.fillStyle = BACKGROUND;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, cornerRadius);
  ctx.fill();
  
  // Inner gradient rounded rect
  const padding = size * 0.08;
  const innerSize = size - padding * 2;
  const innerRadius = size * 0.18;
  
  // Full background gradient
  const bgGradient = ctx.createLinearGradient(0, 0, size, size);
  bgGradient.addColorStop(0, '#0F0F1A');
  bgGradient.addColorStop(0.5, '#12121A');
  bgGradient.addColorStop(1, '#0A0A0F');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, size, size);
  
  // Central icon area with gradient
  const iconSize = size * 0.52;
  const iconX = (size - iconSize) / 2;
  const iconY = (size - iconSize) / 2;
  const iconRadius = iconSize * 0.25;
  
  const iconGradient = ctx.createLinearGradient(iconX, iconY, iconX + iconSize, iconY + iconSize);
  iconGradient.addColorStop(0, GRADIENT_START);
  iconGradient.addColorStop(1, GRADIENT_END);
  
  ctx.fillStyle = iconGradient;
  ctx.beginPath();
  ctx.roundRect(iconX, iconY, iconSize, iconSize, iconRadius);
  ctx.fill();
  
  // Draw lightning bolt (flash icon) - simplified geometric shape
  const boltCenterX = size / 2;
  const boltCenterY = size / 2;
  const boltScale = size * 0.012;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  // Lightning bolt path - relative to center
  ctx.moveTo(boltCenterX + 2 * boltScale, boltCenterY - 12 * boltScale);
  ctx.lineTo(boltCenterX - 5 * boltScale, boltCenterY + 1 * boltScale);
  ctx.lineTo(boltCenterX - 1 * boltScale, boltCenterY + 1 * boltScale);
  ctx.lineTo(boltCenterX - 2 * boltScale, boltCenterY + 12 * boltScale);
  ctx.lineTo(boltCenterX + 5 * boltScale, boltCenterY - 1 * boltScale);
  ctx.lineTo(boltCenterX + 1 * boltScale, boltCenterY - 1 * boltScale);
  ctx.closePath();
  ctx.fill();
  
  return canvas;
}

function generateRoundIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Transparent background
  ctx.clearRect(0, 0, size, size);
  
  // Circular gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, GRADIENT_START);
  gradient.addColorStop(1, GRADIENT_END);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw lightning bolt
  const boltCenterX = size / 2;
  const boltCenterY = size / 2;
  const boltScale = size * 0.018;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(boltCenterX + 2 * boltScale, boltCenterY - 12 * boltScale);
  ctx.lineTo(boltCenterX - 5 * boltScale, boltCenterY + 1 * boltScale);
  ctx.lineTo(boltCenterX - 1 * boltScale, boltCenterY + 1 * boltScale);
  ctx.lineTo(boltCenterX - 2 * boltScale, boltCenterY + 12 * boltScale);
  ctx.lineTo(boltCenterX + 5 * boltScale, boltCenterY - 1 * boltScale);
  ctx.lineTo(boltCenterX + 1 * boltScale, boltCenterY - 1 * boltScale);
  ctx.closePath();
  ctx.fill();
  
  return canvas;
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  
  // Android mipmap sizes
  const androidSizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
  };
  
  // iOS sizes (size * scale)
  const iosSizes = [
    { size: 20, scale: 2, filename: 'icon-20@2x.png' },
    { size: 20, scale: 3, filename: 'icon-20@3x.png' },
    { size: 29, scale: 2, filename: 'icon-29@2x.png' },
    { size: 29, scale: 3, filename: 'icon-29@3x.png' },
    { size: 40, scale: 2, filename: 'icon-40@2x.png' },
    { size: 40, scale: 3, filename: 'icon-40@3x.png' },
    { size: 60, scale: 2, filename: 'icon-60@2x.png' },
    { size: 60, scale: 3, filename: 'icon-60@3x.png' },
    { size: 1024, scale: 1, filename: 'icon-1024.png' },
  ];
  
  console.log('🎨 Generating FitScan app icons...\n');
  
  // Generate Android icons
  for (const [folder, size] of Object.entries(androidSizes)) {
    const dir = path.join(projectRoot, 'android/app/src/main/res', folder);
    
    // Square icon
    const squareCanvas = generateIcon(size);
    const squareBuffer = squareCanvas.toBuffer('image/png');
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), squareBuffer);
    
    // Round icon
    const roundCanvas = generateRoundIcon(size);
    const roundBuffer = roundCanvas.toBuffer('image/png');
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), roundBuffer);
    
    console.log(`  ✅ Android ${folder}: ${size}x${size}px`);
  }
  
  // Generate iOS icons
  const iosDir = path.join(projectRoot, 'ios/FitScan/Images.xcassets/AppIcon.appiconset');
  
  for (const { size, scale, filename } of iosSizes) {
    const pixelSize = size * scale;
    const canvas = generateIcon(pixelSize);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iosDir, filename), buffer);
    console.log(`  ✅ iOS ${filename}: ${pixelSize}x${pixelSize}px`);
  }
  
  // Update iOS Contents.json
  const contentsJson = {
    images: iosSizes.map(({ size, scale, filename }) => ({
      filename,
      idiom: size === 1024 ? 'ios-marketing' : 'iphone',
      scale: `${scale}x`,
      size: `${size}x${size}`,
    })),
    info: { author: 'xcode', version: 1 },
  };
  
  fs.writeFileSync(
    path.join(iosDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );
  
  console.log('\n✅ All icons generated successfully!');
  console.log('📱 iOS icons: ios/FitScan/Images.xcassets/AppIcon.appiconset/');
  console.log('🤖 Android icons: android/app/src/main/res/mipmap-*/');
}

main().catch(console.error);
