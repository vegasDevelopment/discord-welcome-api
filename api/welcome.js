import { createCanvas, loadImage } from '@napi-rs/canvas';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function handler(req, res) {
    const { username = 'Test', message = 'Sunucumuza hos geldin!' } = req.query;
    let { avatarUrl } = req.query;

    if (!avatarUrl) avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';

    try {
        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');

        // Arka plan gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#4158D0');
        gradient.addColorStop(1, '#C850C0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Kenarlık efekti
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 10;
        ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

        // Avatar
        const avatarImage = await loadImage(avatarUrl);
        const avatarSize = 150;
        const avatarX = 70;
        const avatarY = canvas.height / 2 - avatarSize / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // Gölge ayarları
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;

        // Kullanıcı adı
        ctx.font = 'bold 36px "Segoe UI", "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(username, avatarX + avatarSize + 30, canvas.height / 2 - 20);

        // Hoş geldin mesajı
        ctx.font = '24px "Segoe UI", "Arial", sans-serif';
        ctx.fillStyle = '#f0f0f0';
        ctx.fillText(message, avatarX + avatarSize + 30, canvas.height / 2 + 30);

        // Gölgeyi temizle
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        const buffer = canvas.toBuffer('image/png');
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(buffer);

    } catch (error) {
        console.error('Görsel oluşturulurken hata:', error);
        res.status(500).json({ error: 'Görsel oluşturulamadı', detail: error.message });
    }
}
