import express from 'express';
/* 
import path from 'path';
import cors from 'cors';
import 'dotenv/config';
import usuariosRoutes from "./src/routes/usuarios.routes";
import preregistrosRoutes from './src/routes/preregistros.routes';
import recibosRoutes from './src/routes/recibos.routes';
import beneficiariosRoutes from "./src/routes/beneficiarios.routes";
import inventarioRoutes from "./src/routes/inventario.routes";
import { errorMiddleware } from './src/middlewares/error.middleware';
import dashboardRoutes from "./src/routes/dashboard.routes";
import { startMembresiaExpirationJob } from './src/jobs/membresiaExpiration.job';
*/



const app = express();

/* 
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use('/api', usuariosRoutes);
app.use('/api', beneficiariosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/preregistros', preregistrosRoutes);
app.use('/api/recibos', recibosRoutes);
app.use('/api', dashboardRoutes);

app.use(errorMiddleware);

// startMembresiaExpirationJob();

*/

app.get("/", (req, res) => {
  res.send("OK 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});