import sharp from 'sharp';

async function generatePerfectHero() {
  const heroFlippedSrc = 'portals/cc-global/assets/hero-flipped.webp';
  const heroOriginalSrc = 'portals/cc-global/assets/hero.webp';

  // We want two hero images:
  // 1. Desktop hero: 1920x920.
  // The two presenters are placed on the RIGHT side.
  // The LEFT side (0 to 950px) is an elegant dark navy gradient (#061225) matching the site background.
  // This guarantees that any text on the left (up to 550px wide) has 100% readability AND ZERO overlap with either face!
  //
  // Let's test BOTH orientations of the duo:
  // Version A: Flipped (flop) - blonde on left of duo, brunette on right.
  // Version B: Original - brunette on left of duo, blonde on right (like design-reference.webp).

  // Let's create Version A (flipped duo on right):
  const duoFlipped = await sharp(heroFlippedSrc)
    .extract({ left: 350, top: 0, width: 1250, height: 1080 })
    .resize({ height: 920 })
    .toBuffer();
    
  const duoFlippedMeta = await sharp(duoFlipped).metadata();
  const leftPosA = 1920 - duoFlippedMeta.width;

  const gradientSvgA = Buffer.from(`
    <svg width="1920" height="920" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fadeA" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#061225" stop-opacity="1" />
          <stop offset="42%" stop-color="#061225" stop-opacity="1" />
          <stop offset="55%" stop-color="#061225" stop-opacity="0.85" />
          <stop offset="68%" stop-color="#061225" stop-opacity="0.3" />
          <stop offset="85%" stop-color="#061225" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="bottomFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="80%" stop-color="#061225" stop-opacity="0" />
          <stop offset="100%" stop-color="#061225" stop-opacity="0.8" />
        </linearGradient>
      </defs>
      <rect width="1920" height="920" fill="url(#fadeA)" />
      <rect width="1920" height="920" fill="url(#bottomFade)" />
    </svg>
  `);

  await sharp({
    create: {
      width: 1920,
      height: 920,
      channels: 4,
      background: { r: 6, g: 18, b: 37, alpha: 1 }
    }
  })
  .composite([
    { input: duoFlipped, left: leftPosA, top: 0 },
    { input: gradientSvgA, left: 0, top: 0 }
  ])
  .webp({ quality: 95 })
  .toFile('portals/cc-global/assets/hero-desktop-flipped-right.webp');

  // Version B (original duo on right, as in design-reference.webp):
  const duoOrig = await sharp(heroOriginalSrc)
    .extract({ left: 350, top: 0, width: 1250, height: 1080 })
    .resize({ height: 920 })
    .toBuffer();
    
  const duoOrigMeta = await sharp(duoOrig).metadata();
  const leftPosB = 1920 - duoOrigMeta.width;

  await sharp({
    create: {
      width: 1920,
      height: 920,
      channels: 4,
      background: { r: 6, g: 18, b: 37, alpha: 1 }
    }
  })
  .composite([
    { input: duoOrig, left: leftPosB, top: 0 },
    { input: gradientSvgA, left: 0, top: 0 }
  ])
  .webp({ quality: 95 })
  .toFile('portals/cc-global/assets/hero-desktop-orig-right.webp');

  // 2. Mobile Hero: 750x1000 (portrait).
  // On mobile (like extracted_phone_ref.png):
  // The two presenters are framed from chest up in the upper 60% of the image.
  // The bottom 40% has a dark gradient to #061225 for the tagline and buttons.
  // The faces are completely in the upper half, completely free of any text!
  const mobileCropFlipped = await sharp(heroFlippedSrc)
    .extract({ left: 400, top: 50, width: 1100, height: 1000 })
    .resize(750, 750, { fit: 'cover', position: 'top' })
    .toBuffer();

  const mobileCropOrig = await sharp(heroOriginalSrc)
    .extract({ left: 450, top: 50, width: 1100, height: 1000 })
    .resize(750, 750, { fit: 'cover', position: 'top' })
    .toBuffer();

  const mobileGradientSvg = Buffer.from(`
    <svg width="750" height="1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mobFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#061225" stop-opacity="0.1" />
          <stop offset="45%" stop-color="#061225" stop-opacity="0.15" />
          <stop offset="65%" stop-color="#061225" stop-opacity="0.8" />
          <stop offset="85%" stop-color="#061225" stop-opacity="0.98" />
          <stop offset="100%" stop-color="#061225" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect width="750" height="1000" fill="url(#mobFade)" />
    </svg>
  `);

  await sharp({
    create: {
      width: 750,
      height: 1000,
      channels: 4,
      background: { r: 6, g: 18, b: 37, alpha: 1 }
    }
  })
  .composite([
    { input: mobileCropFlipped, left: 0, top: 0 },
    { input: mobileGradientSvg, left: 0, top: 0 }
  ])
  .webp({ quality: 95 })
  .toFile('portals/cc-global/assets/hero-mobile-flipped.webp');

  await sharp({
    create: {
      width: 750,
      height: 1000,
      channels: 4,
      background: { r: 6, g: 18, b: 37, alpha: 1 }
    }
  })
  .composite([
    { input: mobileCropOrig, left: 0, top: 0 },
    { input: mobileGradientSvg, left: 0, top: 0 }
  ])
  .webp({ quality: 95 })
  .toFile('portals/cc-global/assets/hero-mobile-orig.webp');

  console.log('All hero variations generated successfully!');
}

generatePerfectHero().catch(console.error);
