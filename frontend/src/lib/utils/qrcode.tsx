import * as React from "react";

// =========================================================================
// Pure TypeScript QR Code Generator (Model 2, Byte Mode, ISO/IEC 18004)
// Zero external dependencies, pure scalable SVG output for 300+ DPI print.
// =========================================================================

// Galois Field (256) tables for Reed-Solomon error correction
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGaloisField() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = val;
    GF256_EXP[i + 255] = val;
    GF256_LOG[val] = i;
    val <<= 1;
    if (val & 256) {
      val ^= 0x11d; // generator polynomial x^8 + x^4 + x^3 + x^2 + 1
    }
  }
  GF256_LOG[0] = 0;
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const nextPoly = new Uint8Array(poly.length + 1);
    const factor = GF256_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMul(poly[j], factor);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }
  return poly;
}

function calculateReedSolomon(data: Uint8Array, ecCount: number): Uint8Array {
  const genPoly = rsGeneratorPoly(ecCount);
  const msg = new Uint8Array(data.length + ecCount);
  msg.set(data);

  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < genPoly.length; j++) {
        msg[i + j] ^= gfMul(genPoly[j], coef);
      }
    }
  }
  return msg.slice(data.length);
}

// Table of capacities for QR Versions 1 to 6 (Error correction level M)
// [totalCodewords, ecCodewordsPerBlock, numBlocks]
const QR_SPECS: Record<number, { totalCodewords: number; ecCount: number; dataCodewords: number }> = {
  1: { totalCodewords: 26, ecCount: 10, dataCodewords: 16 }, // up to 14 bytes
  2: { totalCodewords: 44, ecCount: 16, dataCodewords: 28 }, // up to 26 bytes
  3: { totalCodewords: 70, ecCount: 26, dataCodewords: 44 }, // up to 42 bytes
  4: { totalCodewords: 100, ecCount: 36, dataCodewords: 64 }, // up to 62 bytes
  5: { totalCodewords: 134, ecCount: 48, dataCodewords: 86 }, // up to 84 bytes
  6: { totalCodewords: 172, ecCount: 64, dataCodewords: 108 }, // up to 106 bytes
  7: { totalCodewords: 196, ecCount: 72, dataCodewords: 124 }, // up to 122 bytes
};

function selectVersion(byteCount: number): number {
  for (let v = 1; v <= 7; v++) {
    const spec = QR_SPECS[v];
    // 4 bits mode + 8 bits count + data bytes
    const requiredBits = 4 + 8 + byteCount * 8;
    if (requiredBits <= spec.dataCodewords * 8) {
      return v;
    }
  }
  return 7;
}

export function generateQRCodeMatrix(text: string): boolean[][] {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(text);
  const version = selectVersion(rawBytes.length);
  const spec = QR_SPECS[version];
  const size = 17 + 4 * version;

  // 1. Bitstream assembly in Byte Mode (0100)
  const bitArray: number[] = [];
  function pushBits(val: number, bits: number) {
    for (let i = bits - 1; i >= 0; i--) {
      bitArray.push((val >>> i) & 1);
    }
  }

  // Mode indicator for 8-bit byte: 0100
  pushBits(0b0100, 4);
  // Character count indicator (8 bits for version 1-9)
  pushBits(rawBytes.length, 8);
  // Data bytes
  for (let i = 0; i < rawBytes.length; i++) {
    pushBits(rawBytes[i], 8);
  }

  // Terminator (up to 4 zeroes)
  const capacityBits = spec.dataCodewords * 8;
  const termBits = Math.min(4, capacityBits - bitArray.length);
  for (let i = 0; i < termBits; i++) bitArray.push(0);

  // Pad to multiple of 8
  while (bitArray.length % 8 !== 0) bitArray.push(0);

  // Pad bytes (0xEC, 0x11)
  const padPatterns = [0b11101100, 0b00010001];
  let padIdx = 0;
  while (bitArray.length < capacityBits) {
    pushBits(padPatterns[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bitstream to data bytes
  const dataBytes = new Uint8Array(spec.dataCodewords);
  for (let i = 0; i < spec.dataCodewords; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitArray[i * 8 + b];
    }
    dataBytes[i] = byteVal;
  }

  // 2. Reed-Solomon Error Correction
  const ecBytes = calculateReedSolomon(dataBytes, spec.ecCount);

  // Combined final codeword stream
  const allCodewords = new Uint8Array(spec.totalCodewords);
  allCodewords.set(dataBytes, 0);
  allCodewords.set(ecBytes, dataBytes.length);

  // 3. Matrix layout
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const tr = row + r;
        const tc = col + c;
        if (tr >= 0 && tr < size && tc >= 0 && tc < size) {
          reserved[tr][tc] = true;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            matrix[tr][tc] =
              r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          } else {
            matrix[tr][tc] = false;
          }
        }
      }
    }
  }

  // Place 3 Finder Patterns
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Alignment Pattern for Version >= 2
  if (version >= 2) {
    const alignCoords: Record<number, number[]> = {
      2: [6, 18],
      3: [6, 22],
      4: [6, 26],
      5: [6, 30],
      6: [6, 34],
      7: [6, 22, 38],
    };
    const coords = alignCoords[version] || [6, size - 7];
    for (const r of coords) {
      for (const c of coords) {
        if (!reserved[r][c]) {
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              reserved[r + dr][c + dc] = true;
              matrix[r + dr][c + dc] =
                Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
            }
          }
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) {
      reserved[6][i] = true;
      matrix[6][i] = i % 2 === 0;
    }
    if (!reserved[i][6]) {
      reserved[i][6] = true;
      matrix[i][6] = i % 2 === 0;
    }
  }

  // Dark module
  reserved[4 * version + 9][8] = true;
  matrix[4 * version + 9][8] = true;

  // Reserve format information regions
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      reserved[8][i] = true;
      reserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = true;
    reserved[size - 1 - i][8] = true;
  }

  // 4. Data module placement (right to left 2-column zig-zag)
  let bitIdx = 0;
  const totalBits = allCodewords.length * 8;
  let upwards = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // skip vertical timing column

    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (let c = 0; c < 2; c++) {
        const col = right - c;
        if (!reserved[row][col]) {
          let bit = false;
          if (bitIdx < totalBits) {
            const byteNum = Math.floor(bitIdx / 8);
            const bitNum = 7 - (bitIdx % 8);
            bit = ((allCodewords[byteNum] >>> bitNum) & 1) === 1;
            bitIdx++;
          }

          // Apply standard Mask 0: (row + col) % 2 == 0
          const mask = (row + col) % 2 === 0;
          matrix[row][col] = bit !== mask;
        }
      }
    }
    upwards = !upwards;
  }

  // 5. Write Format Information (Level M = 00, Mask 0 = 000 => 00000 => BCH 101010000010010)
  const formatInfo = 0b101010000010010;
  for (let i = 0; i < 15; i++) {
    const bit = ((formatInfo >>> (14 - i)) & 1) === 1;
    // Around top-left
    if (i < 6) matrix[8][i] = bit;
    else if (i === 6) matrix[8][7] = bit;
    else if (i === 7) matrix[8][8] = bit;
    else if (i === 8) matrix[7][8] = bit;
    else matrix[14 - i][8] = bit;

    // Split across top-right and bottom-left
    if (i < 8) matrix[size - 1 - i][8] = bit;
    else matrix[8][size - 15 + i] = bit;
  }

  return matrix;
}

export interface QRCodeSVGProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
  includeMargin?: boolean;
}

export function QRCodeSVG({
  value,
  size = 140,
  fgColor = "#1A1816",
  bgColor = "#FFFFFF",
  className,
  includeMargin = true,
}: QRCodeSVGProps) {
  const matrix = React.useMemo(() => {
    try {
      return generateQRCodeMatrix(value);
    } catch {
      // Fallback matrix in case of excessive payload
      return generateQRCodeMatrix("PJ-JEWELLERY-ORD");
    }
  }, [value]);

  const margin = includeMargin ? 2 : 0;
  const matrixSize = matrix.length;
  const viewBoxSize = matrixSize + margin * 2;

  // Generate SVG path for crisp single-path rendering
  const pathData = React.useMemo(() => {
    let d = "";
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r][c]) {
          const x = c + margin;
          const y = r + margin;
          d += `M${x},${y}h1v1h-1z `;
        }
      }
    }
    return d;
  }, [matrix, matrixSize, margin]);

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR Code for ${value}`}
    >
      <rect width={viewBoxSize} height={viewBoxSize} fill={bgColor} />
      <path d={pathData} fill={fgColor} />
    </svg>
  );
}

