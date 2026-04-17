const { WelcomeCard } = require('@devraikou/imagecord');

export default async function handler(req, res) {
    const { username, avatarUrl, serverName, memberCount } = req.query;
    
    try {
        const card = new WelcomeCard()
            .setUsername(username || "Guest")
            .setAvatar(avatarUrl || "https://cdn.discordapp.com/embed/avatars/0.png")
            .setServerName(serverName || "Sunucu")
            .setMemberCount(parseInt(memberCount) || 1);
        
        const buffer = await card.render();
        res.setHeader('Content-Type', 'image/png');
        res.send(buffer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
