const { WelcomeCard } = require('imagecord');

export default async function handler(req, res) {
    // CORS ayarları (bot'un başka domainden çağırması için)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { username, avatarUrl, serverName, memberCount, theme = 'dark' } = 
        req.method === 'GET' ? req.query : req.body;

    if (!username || !avatarUrl) {
        return res.status(400).json({ error: 'username ve avatarUrl gerekli' });
    }

    try {
        const card = new WelcomeCard()
            .setUsername(username)
            .setAvatar(avatarUrl)
            .setServerName(serverName || 'Sunucumuz')
            .setMemberCount(parseInt(memberCount) || 0)
            .setTheme(theme);

        const buffer = await card.render();
        
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Görsel oluşturulamadı' });
    }
}
