import express from 'express';
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




const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
    res.send("usa index.ts");
});


app.use(cors({
  origin: "http://localhost:5173", // tu frontend
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



