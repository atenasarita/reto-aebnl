import { Request, Response } from "express";
import { PreregistroRepository } from "../repositories/preregistro.repository";
import { CrearPreregistroBody } from "../types/preregistros.types";

const repo = new PreregistroRepository();

// POST /api/preregistros
export async function crearPreregistro(req: Request, res: Response): Promise<void> {
  const body = req.body as CrearPreregistroBody;

  const camposRequeridos: (keyof CrearPreregistroBody)[] = [
    "nombres",
    "apellido_paterno",
    "apellido_materno",
    "fecha_nacimiento",
    "curp",
  ];

  const faltantes = camposRequeridos.filter((c) => !body[c]?.toString().trim());
  if (faltantes.length > 0) {
    res.status(400).json({
      message: `Campos requeridos faltantes: ${faltantes.join(", ")}`,
    });
    return;
  }

  if (body.curp.length !== 18) {
    res.status(400).json({ message: "La CURP debe tener exactamente 18 caracteres." });
    return;
  }

  try {
    const nuevo = await repo.crear(body);
    res.status(201).json({
      id_preregistro: nuevo.id_preregistro,
      estado:         nuevo.estado,
      mensaje:        "Prerregistro creado exitosamente.",
    });
  } catch (err) {
    console.error("[preregistros] Error al crear:", err);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}

// GET /api/preregistros
export async function listarPreregistros(_req: Request, res: Response): Promise<void> {
  try {
    const registros = await repo.listar();
    res.json(registros);
  } catch (err) {
    console.error("[preregistros] Error al listar:", err);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}

// GET /api/preregistros/:id
export async function obtenerPreregistro(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  try {
    const registro = await repo.obtenerPorId(id);
    if (!registro) {
      res.status(404).json({ message: "Prerregistro no encontrado." });
      return;
    }
    res.json(registro);
  } catch (err) {
    console.error("[preregistros] Error al obtener:", err);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}
