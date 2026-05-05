const fs = require('fs');
const path = require('path');

function setupWallet() {
  const walletDir = process.env.TNS_ADMIN || '/tmp/wallet';

  if (!fs.existsSync(walletDir)) {
    fs.mkdirSync(walletDir, { recursive: true });
  }

  const files = {
    'tnsnames.ora': process.env.WALLET_TNSNAMES_B64,
    'sqlnet.ora':   process.env.WALLET_SQLNET_B64,
    'cwallet.sso':  process.env.WALLET_CWALLET_B64,
    'ewallet.p12':  process.env.WALLET_EWALLET_B64,
  };

  for (const [filename, b64content] of Object.entries(files)) {
    if (!b64content) {
      console.warn(`⚠️  Variable para ${filename} no encontrada`);
      continue;
    }
    const filePath = path.join(walletDir, filename);
    fs.writeFileSync(filePath, Buffer.from(b64content, 'base64'));
    console.log(`✅ ${filename} escrito en ${filePath}`);
  }

  console.log('🔐 Wallet configurado en:', walletDir);
}

setupWallet();