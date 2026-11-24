import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const TARGETS = [
  { file: 'android/app/src/main/res/drawable/splash.png', w: 1080, h: 1920, isLand: false },
  { file: 'android/app/src/main/res/drawable-port-mdpi/splash.png', w: 320, h: 480, isLand: false },
  { file: 'android/app/src/main/res/drawable-port-hdpi/splash.png', w: 480, h: 800, isLand: false },
  { file: 'android/app/src/main/res/drawable-port-xhdpi/splash.png', w: 720, h: 1280, isLand: false },
  { file: 'android/app/src/main/res/drawable-port-xxhdpi/splash.png', w: 960, h: 1600, isLand: false },
  { file: 'android/app/src/main/res/drawable-port-xxxhdpi/splash.png', w: 1280, h: 1920, isLand: false },
  { file: 'android/app/src/main/res/drawable-land-mdpi/splash.png', w: 480, h: 320, isLand: true },
  { file: 'android/app/src/main/res/drawable-land-hdpi/splash.png', w: 800, h: 480, isLand: true },
  { file: 'android/app/src/main/res/drawable-land-xhdpi/splash.png', w: 1280, h: 720, isLand: true },
  { file: 'android/app/src/main/res/drawable-land-xxhdpi/splash.png', w: 1600, h: 960, isLand: true },
  { file: 'android/app/src/main/res/drawable-land-xxxhdpi/splash.png', w: 1920, h: 1280, isLand: true },
];

function generateSvg(w, h, isLand) {
  // qlmanage renders a square thumbnail, so draw on a square canvas (side = the longer edge) and crop the middle w×h afterwards.
  const S = Math.max(w, h);
  const cx = S / 2;
  const cy = S / 2 - h * (isLand ? 0.02 : 0.05); // slightly above centre reads as centred

  // Size everything from the shorter edge so small screens keep the same proportions.
  const minDim = Math.min(w, h);
  const scale = minDim / 1080;
  const badgeSize = Math.round(220 * scale);
  const badgeHalf = badgeSize / 2;

  const titleSize = Math.round(84 * scale);
  const titleY = badgeHalf + Math.round(96 * scale);
  const subSize = Math.round(22 * scale);
  const subY = titleY + Math.round(48 * scale);
  const letterSpacingSub = Math.max(1, Math.round(5 * scale));

  const bottomY = S / 2 + h / 2 - Math.round(80 * scale);
  const bottomSize = Math.round(18 * scale);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <defs>
    <radialGradient id="bgG" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="#14A58D"/>
      <stop offset="52%" stop-color="#0B6B5C"/>
      <stop offset="100%" stop-color="#07473D"/>
    </radialGradient>
    <linearGradient id="emblemG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#16392F"/>
      <stop offset="100%" stop-color="#0B1F17"/>
    </linearGradient>
    <linearGradient id="sunG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFD766"/>
      <stop offset="100%" stop-color="#FFA81D"/>
    </linearGradient>
    <radialGradient id="glowG"><stop offset="0" stop-color="#FFB61D" stop-opacity=".45"/><stop offset="1" stop-color="#FFB61D" stop-opacity="0"/></radialGradient>
    <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="${Math.round(18 * scale)}" stdDeviation="${Math.round(22 * scale)}" flood-color="#04201B" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="${S}" height="${S}" fill="url(#bgG)"/>

  <!-- Center Branding Cluster: the Sunrise Book mark (public/brand/abhyas-mark.svg, 72-unit grid) scaled to badgeSize -->
  <g transform="translate(${cx}, ${cy})">
    <g filter="url(#shadow)" transform="translate(${-badgeHalf}, ${-badgeHalf}) scale(${badgeSize / 72})">
      <rect width="72" height="72" rx="20" fill="url(#emblemG)"/>
      <circle cx="36" cy="32" r="20" fill="url(#glowG)"/>
      <circle cx="36" cy="32" r="10" fill="url(#sunG)"/>
      <path d="M10 45c9-6 19-6 26 0v13c-7-5-17-5-26 0z" fill="#64FCD9"/>
      <path d="M62 45c-9-6-19-6-26 0v13c7-5 17-5 26 0z" fill="#3EE0BC"/>
    </g>

    <!-- Wordmark -->
    <text x="0" y="${titleY}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="${titleSize}" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="${-Math.round(2 * scale)}">abhyas<tspan fill="#FFB61D">.</tspan></text>

    <!-- Subtitle -->
    <text x="0" y="${subY}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="${subSize}" font-weight="700" fill="#64FCD9" text-anchor="middle" letter-spacing="${letterSpacingSub}">CMA INTERMEDIATE · DAILY PRACTICE</text>
  </g>

  <!-- Bottom Hallmark -->
  <g transform="translate(${cx}, ${bottomY})">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="${bottomSize}" font-weight="600" fill="#9FE9D6" text-anchor="middle" letter-spacing="${Math.max(1, Math.round(4 * scale))}">FOR CMA ASPIRANTS</text>
  </g>
</svg>`;
}

fs.mkdirSync('/tmp/splash-gen', { recursive: true });

for (const target of TARGETS) {
  const maxDim = Math.max(target.w, target.h);
  const svgPath = `/tmp/splash-gen/${target.w}x${target.h}.svg`;
  fs.writeFileSync(svgPath, generateSvg(target.w, target.h, target.isLand), 'utf8');

  // Render via qlmanage and crop to exact dimensions
  execSync(`qlmanage -t -s ${maxDim} -o /tmp/splash-gen "${svgPath}" 2>/dev/null`);
  const rawPng = `/tmp/splash-gen/${target.w}x${target.h}.svg.png`;
  fs.mkdirSync(path.dirname(target.file), { recursive: true });
  execSync(`sips --cropToHeightWidth ${target.h} ${target.w} "${rawPng}" --out "${target.file}" >/dev/null 2>&1`);
  console.log(`Generated: ${target.file} (${target.w}x${target.h})`);
}
console.log('All splash screens generated successfully.');
