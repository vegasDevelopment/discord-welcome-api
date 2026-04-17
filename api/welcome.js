import sharp from 'sharp';

export default async function handler(req, res) {
  const { username = 'Misafir', message = 'Hos geldin!' } = req.query;
  const avatarUrl = req.query.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png';

  try {
    // 1. Avatarı indir ve yuvarlak yap
    const avatarResponse = await fetch(avatarUrl);
    const avatarBuffer = await avatarResponse.arrayBuffer();
    const roundedAvatar = await sharp(Buffer.from(avatarBuffer))
      .resize(150, 150)
      .composite([{ input: Buffer.from(`<svg><circle cx="75" cy="75" r="75" /></svg>`), blend: 'dest-in' }])
      .png()
      .toBuffer();

    // 2. Arka planı ve metinleri SVG ile oluştur
    const svgImage = `
    <svg width="800" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#2C2F33" />
      <rect width="100%" height="10" fill="#5865F2" />
      <text x="240" y="140" font-family="Arial" font-size="42" font-weight="bold" fill="#FFD966">${escapeXml(username)}</text>
      <text x="240" y="200" font-family="Arial" font-size="28" fill="#FFFFFF">${escapeXml(message)}</text>
    </svg>`;
    const background = await sharp(Buffer.from(svgImage)).png().toBuffer();

    // 3. Avatarı arka plana ekle
    const finalImage = await sharp(background)
      .composite([{ input: roundedAvatar, top: 75, left: 50 }])
      .png()
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(finalImage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gorsel olusturulamadi' });
  }
}

// Güvenlik için
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;'; case '>': return '&gt;';
      case '&': return '&amp;'; case '\'': return '&apos;';
      case '"': return '&quot;'; default: return c;
    }
  });
}
