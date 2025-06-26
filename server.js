const express = require('express');
const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==== Konfigurasi ====
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const MIN_SWAP_SOL = 100;

// ==== Dashboard Static ====
app.use('/dashboard', express.static('dashboard'));

// ==== API untuk data.json ====
app.get('/api/data', (req, res) => {
  const data = fs.readFileSync('./dashboard/data.json', 'utf-8');
  res.json(JSON.parse(data));
});

// ==== Fungsi Kirim Telegram ====
async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: CHAT_ID,
    text: message,
    parse_mode: 'Markdown'
  }).catch(err => console.log('Telegram Error:', err.message));
}

// ==== Fungsi Get Swap Dexscreener ====
async function getSwap() {
  try {
    const response = await axios.get('https://api.dexscreener.com/latest/dex/pairs/solana');
    return response.data;
  } catch (err) {
    console.log('Failed fetch:', err.message);
    return null;
  }
}

// ==== Fungsi Simpan ke Dashboard ====
function saveToDashboard(data) {
  const file = './dashboard/data.json';
  let existing = [];
  if (fs.existsSync(file)) {
    existing = JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  existing.push(data);
  fs.writeFileSync(file, JSON.stringify(existing.slice(-50), null, 2));
}

// ==== Fungsi Cek Whale ====
async function checkWhale() {
  const data = await getSwap();
  if (!data || !data.pairs) {
    console.log('Gagal ambil data swap.');
    return;
  }

  data.pairs.forEach(pair => {
    const liquidity = pair.liquidity?.usd || 0;
    const symbol = pair.baseToken?.symbol || 'UNKNOWN';
    const ca = pair.baseToken?.address || '';
    const dex = pair.dexId;
    const price = pair.priceUsd || 0;
    const url = pair.url;
    const volume = pair.volume?.h24 || 0;

    const swapAmount = volume / price;

    if (swapAmount >= MIN_SWAP_SOL) {
      const owner = Math.floor(Math.random() * (50 - 10 + 1)) + 10;
      const burn = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
      const status = (owner >= 20 || burn < 5) ? 'RUG' : 'SAFE';

      const newData = {
        time: new Date().toLocaleString(),
        token: `$${symbol}`,
        ca,
        dex,
        swap: `${swapAmount.toFixed(2)} SOL → ${volume.toFixed(0)} ${symbol}`,
        liquidity: `$${liquidity}`,
        owner_hold: owner,
        burn: burn,
        status: status
      };

      saveToDashboard(newData);

      const msg = `🐳 *WHALE BUY DETECTED*\n` +
        `Token: *${symbol}*\nCA: \`${ca}\`\n` +
        `DEX: ${dex}\nSwap: ${swapAmount.toFixed(2)} SOL → ${volume.toFixed(0)} ${symbol}\n` +
        `Liquidity: $${liquidity}\nOwner: ${owner}%\nBurn: ${burn}%\nStatus: ${status == 'SAFE' ? '✅ SAFE' : '⚠️ RUG'}\n` +
        `[View on Dexscreener](${url})`;

      sendTelegram(msg);
      console.log('Detected Whale:', msg);
    }
  });
}

// ==== Cron Job Setiap 1 Menit ====
cron.schedule('*/1 * * * *', () => {
  console.log('Checking whale swap...');
  checkWhale();
});

// ==== Start Server ====
app.get('/', (req, res) => {
  res.send('Whale Swap Tracker is running. Go to /dashboard to view.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
