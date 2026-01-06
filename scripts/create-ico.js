const sharp = require('sharp');
const fs = require('fs');

async function createIco() {
    // Read the PNG and resize to 256x256 if needed
    const icon = await sharp('build/icon.png')
        .resize(256, 256)
        .png()
        .toBuffer();

    // Create ICO header (16 + 1 image)
    const width = 256;
    const height = 256;

    // ICO format: header (6 bytes) + directory entry (16 bytes) + image data
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);      // Reserved
    header.writeUInt16LE(1, 2);      // Type: 1 = ICO
    header.writeUInt16LE(1, 4);      // Number of images

    const dirEntry = Buffer.alloc(16);
    dirEntry.writeUInt8(0, 0);       // Width (0 = 256)
    dirEntry.writeUInt8(0, 1);       // Height (0 = 256)
    dirEntry.writeUInt8(0, 2);       // Color palette
    dirEntry.writeUInt8(0, 3);       // Reserved
    dirEntry.writeUInt16LE(1, 4);    // Color planes
    dirEntry.writeUInt16LE(32, 6);   // Bits per pixel
    dirEntry.writeUInt32LE(icon.length, 8);  // Size of image data
    dirEntry.writeUInt32LE(22, 12);  // Offset to image data

    const ico = Buffer.concat([header, dirEntry, icon]);
    fs.writeFileSync('build/icon.ico', ico);
    console.log('Created build/icon.ico');
}

createIco().catch(console.error);
