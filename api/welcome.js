const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

// Görsellerin yolu (Vercel'de doğru yolu bulmak için)
const getImagePath = (filename) => {
    // Önce api klasörünün bir üstüne bak (proje kökü)
    const paths = [
        path.join(process.cwd(), filename),           // /vercel/path0/hoşgeldin.jpg
        path.join(process.cwd(), '..', filename),     // /vercel/path0/../hoşgeldin.jpg
        path.join(__dirname, '..', filename),         // /api/../hoşgeldin.jpg
        path.join(__dirname, filename)                // /api/hoşgeldin.jpg
    ];
    
    for (const p of paths) {
        if (fs.existsSync(p)) {
            console.log(`✅ Resim bulundu: ${p}`);
            return p;
        }
    }
    console.error(`❌ Resim bulunamadı: ${filename}`);
    return null;
};

// Görselleri yükle
let bgWelcome = null;
let bgGoodbye = null;

async function loadImages() {
    const welcomePath = getImagePath('hoşgeldin.jpg');
    const goodbyePath = getImagePath('IMG_20260417_173121.jpg');
    
    try {
        if (welcomePath) {
            bgWelcome = await loadImage(welcomePath);
            console.log('✅ Hoşgeldin resmi yüklendi');
        }
        if (goodbyePath) {
            bgGoodbye = await loadImage(goodbyePath);
            console.log('✅ Görüşürüz resmi yüklendi');
        }
    } catch (err) {
        console.error('❌ Resim yükleme hatası:', err.message);
    }
}

// Vercel serverless function export
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    console.log('📥 İstek geldi:', req.method, req.url);
    console.log('Query:', req.query);
    
    // GET kontrolü
    if (req.method !== 'GET') {
        return res.status(405).send('Method not allowed');
    }
    
    try {
        const { type, avatarUrl } = req.query;
        
        // Parametre kontrolü
        if (!type) {
            return res.status(400).json({ error: 'type parametresi gerekli (welcome veya goodbye)' });
        }
        if (!avatarUrl) {
            return res.status(400).json({ error: 'avatarUrl parametresi gerekli' });
        }
        
        // Görseller yüklenmemişse yükle
        if (!bgWelcome || !bgGoodbye) {
            await loadImages();
        }
        
        // Arka plan seçimi
        let background;
        if (type === 'welcome') background = bgWelcome;
        else if (type === 'goodbye') background = bgGoodbye;
        else {
            return res.status(400).json({ error: 'type welcome veya goodbye olmalı' });
        }
        
        if (!background) {
            return res.status(500).json({ 
                error: 'Arka plan resmi yüklenemedi',
                files: fs.readdirSync(process.cwd())
            });
        }
        
        console.log('📸 Avatar yükleniyor:', avatarUrl);
        
        // Avatarı yükle
        let avatar;
        try {
            avatar = await loadImage(avatarUrl);
        } catch (err) {
            console.error('Avatar yüklenemedi:', err.message);
            return res.status(400).json({ error: 'Avatar yüklenemedi: ' + err.message });
        }
        
        console.log('🎨 Canvas oluşturuluyor...');
        
        // Canvas oluştur
        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');
        
        // Arka planı çiz
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        
        // Profil resmi konumu
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.2;
        
        // Yuvarlak kesme
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, centerX - radius, centerY - radius, radius * 2, radius * 2);
        ctx.restore();
        
        // Renkli halkalar
        const colors = type === 'welcome' 
            ? ['#00FF00', '#32CD32', '#ADFF2F', '#7CFC00']
            : ['#FF4500', '#FF6347', '#FF0000', '#DC143C'];
        
        for (let i = 0; i < colors.length; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 5 + i * 6, 0, Math.PI * 2);
            ctx.strokeStyle = colors[i % colors.length];
            ctx.lineWidth = 5;
            ctx.stroke();
        }
        
        // Beyaz iç çerçeve
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        console.log('✅ Başarılı, PNG gönderiliyor...');
        
        // PNG olarak gönder
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(canvas.toBuffer('image/png'));
        
    } catch (err) {
        console.error('❌ Fatal hata:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ 
            error: err.message,
            stack: err.stack 
        });
    }
};

// Başlangıçta görselleri yükle
loadImages();
