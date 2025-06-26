const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Token & Chat ID Telegram dari Environment Variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// ✅ Data Simulasi Whale Buy (ganti nanti dengan API asli)
const whaleData = {
    time: new Date().toLocaleString(),
    token: "PEPE",
    ca: "3XoYxZAbcDeFgHiJkLmN...",
    dex: "Raydium",
    swap: "120 SOL → 500M PEPE",
    liquidity: "$250,000",
    owner: "15%",
    burn: "5%",
    status: "SAFE"
};

// ✅ Function untuk kirim ke Telegram
async function sendToTelegram(data) {
    const message = `
🐳 *WHALE BUY DETECTED* 🐳
Token: *${data.token}*
CA: \`${data.ca}\`
DEX: ${data.dex}
Swap: ${data.swap}
Liquidity: ${data.liquidity}
Owner: ${data.owner}
Burn: ${data.burn}
Status: ${data.status}
`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        await axios.post(url, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log('✅ Message sent to Telegram');
    } catch (error) {
        console.error('❌ Failed to send message:', error.response ? error.response.data : error.message);
    }
}

// ✅ Endpoint untuk test manual ke Telegram
app.get('/test', async (req, res) => {
    try {
        await sendToTelegram(whaleData);
        res.send('✅ Test message sent to Telegram!');
    } catch (error) {
        console.error(error);
        res.send('❌ Failed to send test message.');
    }
});

// ✅ Endpoint status utama
app.get('/', (req, res) => {
    res.send('✅ Whale Swap Tracker is running...');
});

// ✅ Menjalankan server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
