const sample = {
  name: 'STRATASPHERE',
  style: 'WEST COAST IPA',
  abv: '6.2',
  ibu: '56',
  malt: 'Lager, Munich, Dextrin',
  hops: 'Magnum, Strata, Citra, Trident SLVO, Trident T90',
  yeast: 'WHC LAX',
};

const form = document.querySelector('#label-form');
const canvas = document.querySelector('#label-canvas');
const context = canvas.getContext('2d');
const labelImage = new Image();
let imageReady = false;

labelImage.addEventListener('load', () => {
  imageReady = true;
  renderLabel();
});
labelImage.addEventListener('error', () => {
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#171815';
  context.font = '700 28px sans-serif';
  context.textAlign = 'center';
  context.fillText('Label artwork could not be loaded.', canvas.width / 2, canvas.height / 2);
});
labelImage.src = 'StratasphereWCIPA.png';

form.addEventListener('input', renderLabel);

document.querySelector('#reset-button').addEventListener('click', () => {
  for (const [key, value] of Object.entries(sample)) {
    form.elements.namedItem(key).value = value;
  }
  renderLabel();
});

document.querySelector('#download-button').addEventListener('click', () => {
  if (!imageReady) return;
  const anchor = document.createElement('a');
  const beerName = valueOf('name').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'beer-label';
  anchor.download = `${beerName}-label.png`;
  anchor.href = canvas.toDataURL('image/png');
  anchor.click();
});

function valueOf(name) {
  return form.elements.namedItem(name).value.trim();
}

function fittedFont(text, maxWidth, initialSize, family = 'Barlow Condensed, Arial Narrow, Impact, sans-serif', weight = 800) {
  let size = initialSize;
  context.font = `${weight} ${size}px ${family}`;
  while (context.measureText(text).width > maxWidth && size > 12) {
    size -= 2;
    context.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function drawCentered(text, x, baseline, maxWidth, initialSize, color = '#080909', weight = 800, scaleY = 1) {
  if (!text) return;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  const size = fittedFont(text, maxWidth, initialSize, undefined, weight);
  context.font = `${weight} ${size}px Barlow Condensed, Arial Narrow, Impact, sans-serif`;
  if (scaleY !== 1) {
    context.save();
    context.translate(0, baseline);
    context.scale(1, scaleY);
    context.translate(0, -baseline);
  }
  context.fillText(text, x, baseline, maxWidth);
  if (scaleY !== 1) context.restore();
}

function drawBeerName() {
  const text = valueOf('name').toUpperCase();
  if (!text) return;
  const words = text.split(/\s+/);
  let lines = words.length === 1 ? [text] : words.length === 2 ? words : [];
  if (words.length > 2) {
    context.font = '800 360px Barlow Condensed, Arial Narrow, Impact, sans-serif';
    let bestSplit = 1;
    let smallestMaxWidth = Infinity;
    for (let split = 1; split < words.length; split += 1) {
      const firstLine = words.slice(0, split).join(' ');
      const secondLine = words.slice(split).join(' ');
      const maxLineWidth = Math.max(context.measureText(firstLine).width, context.measureText(secondLine).width);
      if (maxLineWidth < smallestMaxWidth) {
        smallestMaxWidth = maxLineWidth;
        bestSplit = split;
      }
    }
    lines = [words.slice(0, bestSplit).join(' '), words.slice(bestSplit).join(' ')];
  }
  const maxWidth = 910;
  const lineHeight = lines.length === 2 ? 136 : 286;
  const lineCenters = lines.length === 2 ? [543, 693] : [618];

  let size = 360;
  while (size > 12) {
    context.font = `800 ${size}px Barlow Condensed, Arial Narrow, Impact, sans-serif`;
    const metrics = lines.map((line) => context.measureText(line));
    const maxLineWidth = Math.max(...metrics.map((lineMetrics) => lineMetrics.width));
    const maxGlyphHeight = Math.max(...metrics.map((lineMetrics) => lineMetrics.actualBoundingBoxAscent + lineMetrics.actualBoundingBoxDescent || size * 0.8));
    if (maxLineWidth <= maxWidth && maxGlyphHeight <= lineHeight) break;
    size -= 2;
  }
  context.font = `800 ${size}px Barlow Condensed, Arial Narrow, Impact, sans-serif`;
  const metrics = lines.map((line) => context.measureText(line));
  const maxLineWidth = Math.max(...metrics.map((lineMetrics) => lineMetrics.width));
  const maxGlyphHeight = Math.max(...metrics.map((lineMetrics) => lineMetrics.actualBoundingBoxAscent + lineMetrics.actualBoundingBoxDescent || size * 0.8));
  const scaleX = maxWidth / maxLineWidth;
  const scaleY = lineHeight / maxGlyphHeight;

  lines.forEach((line, index) => {
    context.save();
    context.translate(512, lineCenters[index]);
    context.scale(scaleX, scaleY);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#080909';
    context.fillText(line, 0, 0);
    context.restore();
  });
}

function wrapText(text, maxWidth, maxLines, startSize, minSize) {
  const words = text.split(/\s+/).filter(Boolean);
  let size = startSize;
  while (size >= minSize) {
    context.font = `700 ${size}px Barlow Condensed, Arial Narrow, Impact, sans-serif`;
    const lines = [];
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    if (lines.length <= maxLines) return { lines, size };
    size -= 2;
  }
  context.font = `700 ${minSize}px Barlow Condensed, Arial Narrow, Impact, sans-serif`;
  return { lines: [context.measureText(text).width > maxWidth ? `${text.slice(0, 28)}...` : text], size: minSize };
}

function drawIngredient(value, region, initialSize, minSize) {
  const { x, y, width, height, maxLines } = region;
  context.fillStyle = '#f9f9f9';
  context.fillRect(x, y, width, height);
  const content = wrapText(value, width - 30, maxLines, initialSize, minSize);
  context.fillStyle = '#090a0a';
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.font = `700 ${content.size}px Barlow Condensed, Arial Narrow, Impact, sans-serif`;
  const lineHeight = Math.min(content.size * 1.12, (height - 12) / Math.max(content.lines.length, 1));
  const blockHeight = lineHeight * content.lines.length;
  const firstY = y + (height - blockHeight) / 2 + lineHeight / 2;
  content.lines.forEach((line, index) => context.fillText(line, x + 18, firstY + lineHeight * index, width - 34));
}

function renderLabel() {
  if (!imageReady) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(labelImage, 0, 0, canvas.width, canvas.height);

  context.fillStyle = '#f9f9f9';
  context.fillRect(31, 458, 962, 321);
  drawBeerName();

  context.fillStyle = '#080909';
  context.beginPath();
  context.moveTo(74, 797);
  context.lineTo(950, 797);
  context.lineTo(916, 847);
  context.lineTo(950, 897);
  context.lineTo(74, 897);
  context.lineTo(108, 847);
  context.closePath();
  context.fill();
  drawCentered(valueOf('style').toUpperCase(), 512, 869, 810, 68, '#fff', 700);

  context.fillStyle = '#f9f9f9';
  context.fillRect(32, 933, 960, 110);
  context.fillStyle = '#080909';
  context.fillRect(508, 933, 8, 110);
  context.textBaseline = 'middle';
  context.textAlign = 'left';
  context.fillStyle = '#080909';
  const abvGroup = `ABV  ${valueOf('abv') ? `${valueOf('abv')}%` : ''}`;
  const ibuGroup = `IBU  ${valueOf('ibu')}`;
  const abvSize = fittedFont(abvGroup, 440, 67, undefined, 700);
  const ibuSize = fittedFont(ibuGroup, 440, 67, undefined, 700);
  context.font = `700 ${abvSize}px Barlow Condensed, Arial Narrow, Impact, sans-serif`;
  context.textAlign = 'center';
  context.fillText(abvGroup, 268, 989, 440);
  context.font = `700 ${ibuSize}px Barlow Condensed, Arial Narrow, Impact, sans-serif`;
  context.fillText(ibuGroup, 756, 989, 440);

  drawIngredient(valueOf('malt').toUpperCase(), { x: 300, y: 1059, width: 682, height: 103, maxLines: 2 }, 45, 27);
  drawIngredient(valueOf('hops').toUpperCase(), { x: 300, y: 1185, width: 682, height: 101, maxLines: 2 }, 43, 24);
  drawIngredient(valueOf('yeast').toUpperCase(), { x: 300, y: 1302, width: 682, height: 88, maxLines: 2 }, 45, 27);
}