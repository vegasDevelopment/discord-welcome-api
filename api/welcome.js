import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// __dirname işlevselliği için (ES Module'de gerekli)
const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function handler(req, res) {
    // 1. Parametreleri al
    const { username = 'Test', message = 'Sunucumuza hos geldin!' } = req.query;
    let { avatarUrl } = req.query;

    // Varsayılan avatar
    if (!avatarUrl) avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';

    try {
        // 2. Tuvali oluştur (Genişlik: 800, Yükseklik: 400)
        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');

        // 3. Arka plan (Degradeli)
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#4158D0');
        gradient.addColorStop(1, '#C850C0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 4. Kenarlık efekti
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 10;
        ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

        // 5. Avatarı yükle ve çiz (Daire şeklinde)
        const avatarImage = await loadImage(avatarUrl);
        const avatarSize = 150;
        const avatarX = 70;
        const avatarY = canvas.height / 2 - avatarSize / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // 6. Kullanıcı adını yaz
        ctx.font = 'bold 36px "Segoe UI", "Arial"';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.fillText(username, avatarX + avatarSize + 30, canvas.height / 2 - 20);

        // 7. Hoş geldin mesajını yaz
        ctx.font = '24px "Segoe UI", "Arial"';
        ctx.fillStyle = '#f0f0f0';
        ctx.fillText(message, avatarX + avatarSize + 30, canvas.height / 2 + 30);

        // Gölgeyi kapat
        ctx.shadowColor = 'transparent';

        // 8. Çizimi buffer'a çevir ve gönder
        const buffer = canvas.toBuffer('image/png');
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(buffer);

    } catch (error) {
        console.error('Görsel olusturulurken hata:', error);
        res.status(500).json({ error: 'Görsel olusturulamadi', detail: error.message });
    }
}
