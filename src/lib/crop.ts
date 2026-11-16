export type SheetKey = 'work1' | 'work2' | 'team1' | 'team2' | 'bts';

export interface SheetSpec {
  url: string;
  width: number;
  height: number;
  cells: readonly [number, number, number, number][];
}

export const SHEETS: Record<SheetKey, SheetSpec> = {
  work1: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261110_224238_b0899b4d-5876-4c63-98d3-8608d8dbe790.png&w=2400&q=85',
    width: 2688,
    height: 1520,
    cells: [
      [0, 0, 1336, 752],
      [1352, 0, 1336, 752],
      [0, 768, 1336, 752],
      [1352, 768, 1336, 752],
    ],
  },
  work2: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261110_224238_aee93a53-873f-470f-afb3-6395c22ab639.png&w=2400&q=85',
    width: 2688,
    height: 1520,
    cells: [
      [0, 0, 1335, 749],
      [1356, 0, 1332, 749],
      [0, 770, 1335, 750],
      [1356, 770, 1332, 750],
    ],
  },
  team1: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261110_224239_be9bd6b1-debb-4a95-aadf-1a36e4d2f557.png&w=1600&q=85',
    width: 1744,
    height: 2336,
    cells: [
      [0, 0, 864, 1156],
      [881, 0, 863, 1156],
      [0, 1175, 864, 1161],
      [881, 1175, 863, 1161],
    ],
  },
  team2: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261110_224238_bfc657e7-cbc1-43fb-a726-e8be5dd42302.png&w=1600&q=85',
    width: 1744,
    height: 2336,
    cells: [
      [0, 0, 864, 1159],
      [880, 0, 864, 1159],
      [0, 1176, 864, 1160],
      [880, 1176, 864, 1160],
    ],
  },
  bts: {
    url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261110_224238_bf8567fa-9d67-4f1e-b4e0-5662c0bf70e4.png&w=1600&q=85',
    width: 1744,
    height: 2336,
    cells: [
      [0, 0, 865, 1160],
      [881, 0, 863, 1160],
      [0, 1176, 865, 1160],
      [881, 1176, 863, 1160],
    ],
  },
};

export interface CropLayout {
  url: string;
  aspectRatio: number;
  widthPct: number;
  heightPct: number;
  leftPct: number;
  topPct: number;
}

const CELL_INSET_PX = 4;

export function computeCropLayout(cropSpec: string): CropLayout {
  const [sheetRaw, cellRaw] = cropSpec.split(':');
  const sheetKey = sheetRaw as SheetKey;
  const sheet = SHEETS[sheetKey];
  if (!sheet) {
    throw new Error(`Unknown sheet key: ${sheetRaw}`);
  }
  const cellIndex = Number(cellRaw);
  const rawRect = sheet.cells[cellIndex];
  if (!rawRect) {
    throw new Error(`Invalid cell index "${cellRaw}" for sheet "${sheetKey}"`);
  }

  const [rawX, rawY, rawW, rawH] = rawRect;
  const cellX = rawX + CELL_INSET_PX;
  const cellY = rawY + CELL_INSET_PX;
  const cellW = rawW - CELL_INSET_PX * 2;
  const cellH = rawH - CELL_INSET_PX * 2;

  return {
    url: sheet.url,
    aspectRatio: cellW / cellH,
    widthPct: (sheet.width / cellW) * 100,
    heightPct: (sheet.height / cellH) * 100,
    leftPct: (-cellX / cellW) * 100,
    topPct: (-cellY / cellH) * 100,
  };
}
