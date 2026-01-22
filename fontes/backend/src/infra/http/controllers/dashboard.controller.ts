import { NextFunction, Response } from "express";
import { ConsultaService } from '../../../domain/services/consulta.service';
import { chartUtil } from "../../../utils/chart.util";
import { NotFoundError } from "../../../errors/client.error";
import { AuthenticatedRequest } from "../middlewares/checkUserAccess.middleware";

export class DashboardController { 
}
