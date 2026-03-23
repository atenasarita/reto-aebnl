import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import usuariosRoutes from "./src/routes/usuarios.routes";
import { errorMiddleware } from './src/middlewares/error.middleware.ts';

const app = express();
const PORT = 3000

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use('/api', usuariosRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
