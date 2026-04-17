import { WelcomeCard } from '@devraikou/imagecord';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const params = req.method === 'GET' ? req.query : req.body;
    const { 
        username = 'Yeni Üye',
        avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png',
        serverName = 'Sunucu',
        memberCount = 1,
        theme = 'dark'
    } = params;

    try {
        const card = new WelcomeCard()
            .setUsername(username)
            .setAvatar(avatarUrl)
            .setServerName(serverName)
            .setMemberCount(parseInt(memberCount))
            .setTheme(theme);

        const buffer = await card.render();
        
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(buffer);
    } catch (error) {
        console.error('Hata:', error);
        res.status(500).json({ 
            error: 'Görsel oluşturulamadı',
            details: error.message 
        });
    }
}
