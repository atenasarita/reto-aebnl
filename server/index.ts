// index.ts

import express from 'express';
import path from 'path';
import cors from 'cors';
import net from 'net';
import fs from "fs";
import { execSync } from "child_process";
import 'dotenv/config';
import usuariosRoutes from "./src/routes/usuarios.routes";
import preregistrosRoutes from './src/routes/preregistros.routes';
import recibosRoutes from './src/routes/recibos.routes';
import beneficiariosRoutes from "./src/routes/beneficiarios.routes";
import inventarioRoutes from "./src/routes/inventario.routes";
import { errorMiddleware } from './src/middlewares/error.middleware';
import dashboardRoutes from "./src/routes/dashboard.routes";
import { startMembresiaExpirationJob } from './src/jobs/membresiaExpiration.job';

const walletDir = "/tmp/wallet";

if (!fs.existsSync(walletDir)) {
  console.log("📦 Creando wallet...");
  fs.mkdirSync(walletDir, { recursive: true });

  const buffer = Buffer.from(process.env.WALLET_BASE64!, "base64");
  fs.writeFileSync("/tmp/wallet.zip", buffer);

  execSync(`unzip /tmp/wallet.zip -d ${walletDir}`);

  fs.writeFileSync(
    `${walletDir}/sqlnet.ora`,
    `WALLET_LOCATION = (SOURCE = (METHOD = file) (METHOD_DATA = (DIRECTORY = "${walletDir}")))\nSSL_SERVER_DN_MATCH=yes\n`
  );

  console.log("✅ Wallet descomprimido");
}

const sqlnetContent = fs.readFileSync(`${walletDir}/sqlnet.ora`, 'utf8');
console.log("SQLNET.ORA:", sqlnetContent);

const tnsnamesContent = fs.readFileSync(`${walletDir}/tnsnames.ora`, 'utf8');
console.log("TNSNAMES.ORA:", tnsnamesContent);

console.log("TNS_ADMIN:", process.env.TNS_ADMIN);

// TCP Test
const socket = new net.Socket();
socket.setTimeout(5000);
socket.connect(1522, 'adb.mx-queretaro-1.oraclecloud.com', () => {
  console.log("TCP TEST: ✅ Puerto 1522 alcanzable");
  socket.destroy();
});
socket.on('error', (err) => {
  console.log("TCP TEST FAILED:", err.message);
});
socket.on('timeout', () => {
  console.log("TCP TEST: ⏱ Timeout - puerto bloqueado o no responde");
  socket.destroy();
});

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("usa index.ts");
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', usuariosRoutes);
app.use('/api', beneficiariosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/preregistros', preregistrosRoutes);
app.use('/api/recibos', recibosRoutes);
app.use('/api', dashboardRoutes);

app.use(errorMiddleware);

// startMembresiaExpirationJob();