import sharp from 'sharp';

export default async function handler(req, res) {
    const { username = 'Test', message = 'Sunucumuza hos geldin!' } = req.query;
    let { avatarUrl } = req.query;
    if (!avatarUrl) avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';

    try {
        // 1. Avatarı yuvarlak yap
        const avatarRes = await fetch(avatarUrl);
        const avatarBuf = await avatarRes.arrayBuffer();
        const roundedAvatar = await sharp(Buffer.from(avatarBuf))
            .resize(150, 150)
            .composite([{
                input: Buffer.from(`<svg><circle cx="75" cy="75" r="75" fill="black"/></svg>`),
                blend: 'dest-in'
            }])
            .png()
            .toBuffer();

        // 2. Arka plan (düz renk - Discord koyu tema)
        const background = await sharp({
            create: {
                width: 800,
                height: 400,
                channels: 3,
                background: { r: 44, g: 47, b: 51 }
            }
        }).png().toBuffer();

        // 3. Metinleri SVG ile ekle
        const svg = Buffer.from(`<svg width="800" height="400">
            <rect x="25" y="25" width="750" height="350" fill="none" stroke="#5865F2" stroke-width="8"/>
            <text x="250" y="190" font-family="Arial" font-size="42" font-weight="bold" fill="white">${username}</text>
            <text x="250" y="240" font-family="Arial" font-size="26" fill="#b9bbbe">${message}</text>
        </svg>`);

        const withText = await sharp(background)
            .composite([{ input: svg }])
            .png()
            .toBuffer();

        // 4. Avatarı ekle
        const final = await sharp(withText)
            .composite([{ input: roundedAvatar, left: 70, top: 125 }])
            .png()
            .toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(final);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}
