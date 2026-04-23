import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import usuariosRoutes from "./src/routes/usuarios.routes";
import preregistrosRoutes from './src/routes/preregistros.routes';
import beneficiariosRoutes from "./src/routes/beneficiarios.routes";
import inventarioRoutes from "./src/routes/inventario.routes";
import { errorMiddleware } from './src/middlewares/error.middleware.ts';
import dashboardRoutes from "./src/routes/dashboard.routes";
import serviciosRoutes from "./src/routes/servicios.routes.ts";

const app = express();
const PORT = 3000

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use('/api', usuariosRoutes);
app.use('/api', beneficiariosRoutes);
app.use('/api', inventarioRoutes);

app.use("/api/preregistros", preregistrosRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/api", usuariosRoutes);
app.use("/api", inventarioRoutes);
app.use("/api", preregistrosRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", serviciosRoutes);