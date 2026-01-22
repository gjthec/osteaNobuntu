import { NextFunction, Response } from "express";
import { ConsultaService } from "../../../domain/services/consulta.service";
import { NotFoundError } from "../../../errors/client.error";
import { AuthenticatedRequest } from "../middlewares/checkUserAccess.middleware";
import { jsonToDocument } from "../../../utils/jsonToDocument.util";
import { InternalServerError } from "../../../errors/internal.error";

export class ConsultaController { 
}
