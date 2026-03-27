import { Request, Response } from "express";
import { BeneficiariosController } from "../controllers/beneficiarios.controller";

export class BeneficiariosHandler {
  beneficiariosController: BeneficiariosController;

  constructor(beneficiariosController: BeneficiariosController) {
    this.beneficiariosController = beneficiariosController;
    this.getBeneficiarioByFolio = this.getBeneficiarioByFolio.bind(this);
  }

  async getBeneficiarioByFolio(req: Request, res: Response): Promise<void> {
    const folio = req.params.folio as string;
    console.log("Folio recibido en handler:", folio);

    const beneficiario = await this.beneficiariosController.getBeneficiarioByFolio(folio);

    console.log("Beneficiario encontrado:", beneficiario);
    res.status(200).json(beneficiario);
  }
}