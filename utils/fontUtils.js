'use strict';

const fs = require('fs');
const path = require('path');

function firstExisting(paths) {
  for (const candidate of paths) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return '';
}

function resolveUnicodeFonts() {
  const regular = firstExisting([
    process.env.PDF_FONT_PATH,
    path.join(process.cwd(), 'fonts', 'DejaVuSans.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
    'C:\\Windows\\Fonts\\arial.ttf',
    'C:\\Windows\\Fonts\\calibri.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/Library/Fonts/Arial.ttf',
  ]);

  const bold = firstExisting([
    process.env.PDF_FONT_BOLD_PATH,
    path.join(process.cwd(), 'fonts', 'DejaVuSans-Bold.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf',
    'C:\\Windows\\Fonts\\arialbd.ttf',
    'C:\\Windows\\Fonts\\calibrib.ttf',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/Library/Fonts/Arial Bold.ttf',
  ]) || regular;

  return { regular, bold };
}

module.exports = { resolveUnicodeFonts };
