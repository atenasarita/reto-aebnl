import { Request, Response } from "express";
import { ReciboRepository } from "../repositories/recibo.repository.js";

const repo = new ReciboRepository();

/** Fecha de hoy */
function fechaHoy(): string {
  return new Date().toISOString().split("T")[0];
}

/** Valida que un string sea una fecha con formato YYYY-MM-DD */
function esFechaValida(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

// GET /api/recibos?fecha=YYYY-MM-DD 
export async function listarRecibos(req: Request, res: Response): Promise<void> {
  const fecha = (req.query.fecha as string) || fechaHoy();

  if (!esFechaValida(fecha)) {
    res.status(400).json({ message: "Formato de fecha inválido. Use YYYY-MM-DD." });
    return;
  }

  try {
    const recibos = await repo.listarPorFecha(fecha);
    res.json(recibos);
  } catch (err) {
    console.error("[recibos] Error al listar:", err);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}

// GET /api/recibos/:id
export async function obtenerRecibo(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ message: "ID inválido." });
    return;
  }

  try {
    const recibo = await repo.obtenerPorId(id);
    if (!recibo) {
      res.status(404).json({ message: "Recibo no encontrado." });
      return;
    }
    res.json(recibo);
  } catch (err) {
    console.error("[recibos] Error al obtener:", err);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}