import { createCanvas, loadImage } from '@napi-rs/canvas';

export default async function handler(req, res) {
    // 1. Parametreleri al
    const { username = 'Test', message = 'Sunucumuza hos geldin!' } = req.query;
    let { avatarUrl } = req.query;
    if (!avatarUrl) avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';

    try {
        // 2. Tuvale boyut ver (Genis: 800, Yüksek: 300)
        const canvas = createCanvas(800, 300);
        const ctx = canvas.getContext('2d');

        // 3. Arka plan (Renkli ve çizgili)
        ctx.fillStyle = '#2C2F33';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#5865F2';
        ctx.fillRect(0, 0, canvas.width, 10);

        // 4. Avatar (Sade, kutu icinde)
        const avatar = await loadImage(avatarUrl);
        const avatarX = 50;
        const avatarY = canvas.height / 2 - 75;
        ctx.drawImage(avatar, avatarX, avatarY, 150, 150);
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 5;
        ctx.strokeRect(avatarX, avatarY, 150, 150);

        // 5. Kullanici Adi (SARI ve buyuk)
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#FFD966';
        ctx.fillText(username, 240, canvas.height / 2 - 20);

        // 6. Mesaj (BEYAZ)
        ctx.font = '28px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(message, 240, canvas.height / 2 + 40);

        // 7. Resmi gonder
        const buffer = canvas.toBuffer('image/png');
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(buffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gorsel olusturulamadi' });
    }
}
