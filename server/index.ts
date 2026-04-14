import express from 'express';
import path from 'path';
import cors from 'cors';
import 'dotenv/config';
import usuariosRoutes from "./src/routes/usuarios.routes";
import preregistrosRoutes from './src/routes/preregistros.routes';
import beneficiariosRoutes from "./src/routes/beneficiarios.routes";
import { errorMiddleware } from './src/middlewares/error.middleware.ts';
import { startMembresiaExpirationJob } from './src/jobs/membresiaExpiration.job';

const app = express();
const PORT = 3000

app.use(cors());
app.use(express.json());

// Carpeta publica para imágenes subidas 
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use('/api', usuariosRoutes);
app.use('/api', beneficiariosRoutes);

app.use("/api/preregistros", preregistrosRoutes);


app.use(errorMiddleware);

startMembresiaExpirationJob();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
