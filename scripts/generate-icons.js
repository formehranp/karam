import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6: RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let scanOffset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[scanOffset++] = 0; // Filter: None
    const rowOffset = y * width * 4;
    for (let x = 0; x < width * 4; x++) {
      scanlines[scanOffset++] = rgbaBuffer[rowOffset + x];
    }
  }

  const compressedData = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function renderIcon(size) {
  const buf = Buffer.alloc(size * size * 4);

  const primaryR = 26;
  const primaryG = 115;
  const primaryB = 232;

  const cornerRadius = size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Rounded rectangle test
      const dx = Math.max(0, Math.max(cornerRadius - x, x - (size - 1 - cornerRadius)));
      const dy = Math.max(0, Math.max(cornerRadius - y, y - (size - 1 - cornerRadius)));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > cornerRadius) {
        // Outside rounded corners: transparent
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      // Inside base background
      buf[idx] = primaryR;
      buf[idx + 1] = primaryG;
      buf[idx + 2] = primaryB;
      buf[idx + 3] = 255;

      // Calendar top bar accent
      const barTop = Math.floor(size * 0.22);
      const barHeight = Math.max(1, Math.floor(size * 0.1));
      if (y >= barTop && y <= barTop + barHeight && x >= size * 0.2 && x <= size * 0.8) {
        buf[idx] = 255;
        buf[idx + 1] = 255;
        buf[idx + 2] = 255;
        buf[idx + 3] = 230;
      }

      // Checkmark check
      // Checkmark points relative to size: (0.33, 0.55) -> (0.47, 0.68) -> (0.72, 0.42)
      const nx = x / size;
      const ny = y / size;

      // Segment 1: (0.32, 0.55) to (0.46, 0.69)
      const distToSeg1 = distToSegment(nx, ny, 0.32, 0.55, 0.46, 0.69);
      // Segment 2: (0.46, 0.69) to (0.72, 0.43)
      const distToSeg2 = distToSegment(nx, ny, 0.46, 0.69, 0.72, 0.43);

      const stroke = size <= 16 ? 0.08 : 0.055;
      if (distToSeg1 < stroke || distToSeg2 < stroke) {
        buf[idx] = 255;
        buf[idx + 1] = 255;
        buf[idx + 2] = 255;
        buf[idx + 3] = 255;
      }
    }
  }

  return encodePNG(size, size, buf);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

const outDir = path.resolve('public/icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const pngBuf = renderIcon(size);
  const filePath = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, pngBuf);
  console.log(`Generated: ${filePath} (${pngBuf.length} bytes)`);
});
