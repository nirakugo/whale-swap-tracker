const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Simulasi data whale buy (ganti dengan API tracker kamu)
const whaleData = {
    time: new Date().toLocaleString(),
    token: "PEPE",
    ca: "3XxYxZAbcDeFgHijKlmN...",
    dex: "Raydium",
    swap: "120 SOL → 500M PEPE",
    liquidity: "$250,000",
    owner: "15%",
    burn: "5%",
    status: "SAFE"
};

async function sendToTelegram(data) {
    const message = `
🐳 *WHALE BUY DETECTED* 🐳
=========================
🕒 *Time:* ${data.time}
💎 *Token:* ${data.token}
📜 *CA:* \`${data.ca}\`
🔗 *DEX:* ${data.dex}
💰 *Swap:* ${data.swap}
💧 *Liquidity:* ${data.liquidity}
🧑‍💼 *Owner Hold:* ${data.owner}
🔥 *Burn:* ${data.burn}
🚦 *Status:* ${data.status === 'SAFE' ? '✅ SAFE' : '⚠️ RUG'}
[🔍 View on Dexscreener](https://dexscreener.com/solana/${data.ca})
=========================
    `;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: "Markdown"
        });
        console.log('✅ Message sent to Telegram!');
    } catch (error) {
        console.error('❌ Failed to send:', error.response.data);
    }
}

app.get('/', (req, res) => {
    res.send('✅ Whale Swap Tracker is running...');
});

app.get('/send', async (req, res) => {
    await sendToTelegram(whaleData);
    res.send('✅ Sent Whale Notification to Telegram');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
