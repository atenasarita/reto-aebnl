import { ServicioRepository } from '../repositories/servicios.repository';

type RegistrarServicioInput = {
  id_beneficiario: number;
  id_catalogo_servicio: number;
  fecha: string;
  hora: string;
  id_cita?: number | null;
  cantidad: number;
  notas?: string;
  insumos: { id: number; cantidad: number; precio: number }[];
  monto_servicio: number;
  monto_inventario: number;
  descuento: number;
  cuota_total: number;
  monto_pagado: number;
  monto_donacion: number;
  id_fondo?: number | null;
  id_donador?: number | null;
  metodo_pago: string;
  ya_aporto: boolean;
  id_usuario: number;
};

export class ServiciosController {

  private readonly repository: ServicioRepository;

  constructor(repository: ServicioRepository) {
    this.repository = repository;
  }

  async getTiposServicio() {
    return this.repository.getTiposServicio();
  }

  async getFechasUltimosEstudios(id_beneficiario: number){
    return this.repository.getFechasUltimosEstudios(id_beneficiario);
  }

  async registrarServicio(input: RegistrarServicioInput) {
    return this.repository.registrarServicio(input);
  }

  async getHistorial(limit: number, page: number) {
    return this.repository.getHistorial(limit, page);
  }

  async getCategorias() {
    return this.repository.getCategorias();
  }
  
  async crearServicioCatalogo(input: { nombre: string; categoria: string; precio: number }) {
    return this.repository.crearServicioCatalogo(input);
  }
}