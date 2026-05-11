import 'dotenv/config';


import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import net from 'net';
import { execSync } from 'child_process';
import usuariosRoutes from "./src/routes/usuarios.routes";
import preregistrosRoutes from './src/routes/preregistros.routes';
import recibosRoutes from './src/routes/recibos.routes';
import beneficiariosRoutes from "./src/routes/beneficiarios.routes";
import inventarioRoutes from "./src/routes/inventario.routes";
import { errorMiddleware } from './src/middlewares/error.middleware';
import dashboardRoutes from "./src/routes/dashboard.routes";
import reportesRoutes from "./src/routes/reportes.routes";
import { startMembresiaExpirationJob } from './src/jobs/membresiaExpiration.job';

// ── Wallet setup ──────────────────────────────────────────────
const walletDir = process.env.TNS_ADMIN || '/tmp/wallet';

if (!fs.existsSync(walletDir)) {
  console.log('📦 Creando wallet...');
  fs.mkdirSync(walletDir, { recursive: true });
  const buffer = Buffer.from(process.env.WALLET_BASE64!, 'base64');
  fs.writeFileSync('/tmp/wallet.zip', buffer);
  execSync(`unzip /tmp/wallet.zip -d ${walletDir}`);
  fs.writeFileSync(
    `${walletDir}/sqlnet.ora`,
    `WALLET_LOCATION = (SOURCE = (METHOD = file) (METHOD_DATA = (DIRECTORY = "${walletDir}")))\nSSL_SERVER_DN_MATCH=yes\n`
  );
  console.log('✅ Wallet descomprimido');
}

process.env.TNS_ADMIN = walletDir;
// ─────────────────────────────────────────────────────────────


const app = express();
const PORT = Number(process.env.PORT) || 10000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://aebnl.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
  res.send('Backend is running using index.ts');
});

app.use('/api', usuariosRoutes);
app.use('/api', beneficiariosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/preregistros', preregistrosRoutes);
app.use('/api/recibos', recibosRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/reportes', reportesRoutes);

app.use(errorMiddleware);

startMembresiaExpirationJob();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});