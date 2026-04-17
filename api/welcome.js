// api.js
const express = require('express');
const Canvas = require('canvas');
const path = require('path');
const app = express();

// Arka plan resimlerini yükle
const bgWelcome = await Canvas.loadImage(path.join(__dirname, 'hoşgeldin.jpg'));
const bgGoodbye = await Canvas.loadImage(path.join(__dirname, 'IMG_20260417_173121.jpg'));

app.get('/generate', async (req, res) => {
    const type = req.query.type; // 'welcome' veya 'goodbye'
    const avatarUrl = req.query.avatarUrl;

    if (!type || !avatarUrl) {
        return res.status(400).send('type ve avatarUrl parametreleri gerekli');
    }

    let background;
    if (type === 'welcome') background = bgWelcome;
    else if (type === 'goodbye') background = bgGoodbye;
    else return res.status(400).send('type welcome veya goodbye olmalı');

    try {
        // Avatar resmini yükle
        const avatar = await Canvas.loadImage(avatarUrl);
        
        // Arka plan boyutunda canvas oluştur
        const canvas = Canvas.createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');
        
        // Arka planı çiz
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        
        // Profil resminin konumu ve boyutu (örnek: ortada, 200x200)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 120; // daire yarıçapı
        
        // Profil resmini yuvarlak kesip çiz
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, centerX - radius, centerY - radius, radius * 2, radius * 2);
        ctx.restore();
        
        // Renkli halkalar (çok renkli daire efekti)
        const colors = type === 'welcome' 
            ? ['#00FF00', '#32CD32', '#ADFF2F', '#7CFC00'] // hoş geldin yeşil
            : ['#FF4500', '#FF6347', '#FF0000', '#DC143C']; // görüşürüz kırmızı
        
        for (let i = 0; i < colors.length; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 5 + i * 8, 0, Math.PI * 2);
            ctx.strokeStyle = colors[i % colors.length];
            ctx.lineWidth = 6;
            ctx.stroke();
        }
        
        // Beyaz iç çerçeve
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Çıktıyı gönder
        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer());
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Görsel oluşturulurken hata');
    }
});

app.listen(3000, () => console.log('API çalışıyor: http://localhost:3000'));
