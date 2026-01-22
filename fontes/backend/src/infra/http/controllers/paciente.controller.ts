import { NextFunction, Response } from "express";
import { BaseController } from "./base.controller";
import { Paciente, IPaciente } from "../../../domain/entities/paciente.model"; 
import PacienteRepository from "../../../domain/repositories/paciente.repository";
import { ValidationError } from "sequelize";
import { AuthenticatedRequest } from "../middlewares/checkUserAccess.middleware";
import { NotFoundError } from "../../../errors/client.error";
import { TenantConnection } from "../../../domain/entities/tenantConnection.model";

export class PacienteController { 

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {  
    try { 
      if (req.tenantConnection == undefined) { 
        throw new NotFoundError('TENANT_NOT_FOUND');
      } 
    const  pacienteRepository : PacienteRepository = new PacienteRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IPaciente, Paciente> = new BaseController(pacienteRepository,  "paciente"); 

    baseController.create(req, res, next); 
    } catch (error) { 
      if (error instanceof ValidationError) { 
        const validationMessages = error.errors.map(err => err.message);  
        return res.status(400).json({ 
          error: "Erro de validação", 
          details: validationMessages  
        }); 
      } 
      next(error);
    } 
  } 

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction){ 
    try { 
      if (req.tenantConnection == undefined) { 
        throw new NotFoundError('TENANT_NOT_FOUND');
      } 
    const  pacienteRepository : PacienteRepository = new PacienteRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IPaciente, Paciente> = new BaseController(pacienteRepository,  "paciente"); 

    baseController.findAll(req, res, next); 
    } catch (error) { 
      next(error);
    } 
  } 

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction){ 
    try { 
      if (req.tenantConnection == undefined) { 
        throw new NotFoundError('TENANT_NOT_FOUND');
      } 
    const  pacienteRepository : PacienteRepository = new PacienteRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IPaciente, Paciente> = new BaseController(pacienteRepository,  "paciente"); 

    baseController.findById(req, res, next); 
    } catch (error) { 
      next(error);
    } 
  } 

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction){ 
    try { 
      if (req.tenantConnection == undefined) { 
        throw new NotFoundError('TENANT_NOT_FOUND');
      } 
    const  pacienteRepository : PacienteRepository = new PacienteRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IPaciente, Paciente> = new BaseController(pacienteRepository,  "paciente"); 

    baseController.update(req, res, next); 
    } catch (error) { 
      next(error);
    } 
  } 

  async getCount(req: AuthenticatedRequest, res: Response, next: NextFunction){ 
    try { 
      if (req.tenantConnection == undefined) { 
        throw new NotFoundError('TENANT_NOT_FOUND');
      } 
    const  pacienteRepository : PacienteRepository = new PacienteRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IPaciente, Paciente> = new BaseController(pacienteRepository,  "paciente"); 

    baseController.getCount(req, res, next); 
    } catch (error) { 
      next(error);
    } 
  } 

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction){ 
    try { 
      if (req.tenantConnection == undefined) { 
        throw new NotFoundError('TENANT_NOT_FOUND');
      } 
    const  pacienteRepository : PacienteRepository = new PacienteRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IPaciente, Paciente> = new BaseController(pacienteRepository,  "paciente"); 

    baseController.delete(req, res, next); 
    } catch (error) { 
      next(error);
    } 
  } 

  async customQuery(req: AuthenticatedRequest, res: Response, next: NextFunction){ 
    try { 
      if (req.tenantConnection == undefined) { 
        throw new NotFoundError('TENANT_NOT_FOUND');
      } 
    const  pacienteRepository : PacienteRepository = new PacienteRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IPaciente, Paciente> = new BaseController(pacienteRepository,  "paciente"); 

      baseController.findCustom(req, res, next); 
    } catch (error) { 
      next(error);
    } 
  } 

  async exportDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction){ 
    try { 
      if (req.tenantConnection == undefined) { 
        throw new NotFoundError('TENANT_NOT_FOUND');
      } 

      // Configurar body para download de todos os dados em CSV 
      if (!req.body || !req.body.filterValues || !req.body.conditions) { 
        req.body.filterValues = [{}]; 
        req.body.conditions = [{}]; 
      } 

    const  pacienteRepository : PacienteRepository = new PacienteRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IPaciente, Paciente> = new BaseController(pacienteRepository,  "paciente"); 

      baseController.exportDocuments(req, res, next); 
    } catch (error) { 
      next(error);
    } 
  } 

  async findByIdWithEagerLoading(req: AuthenticatedRequest, res: Response, next: NextFunction){  
      if (req.tenantConnection == undefined) { 
        throw new NotFoundError('TENANT_NOT_FOUND');
      } 
    try {  
    const  pacienteRepository : PacienteRepository = new PacienteRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IPaciente, Paciente> = new BaseController(pacienteRepository,  "paciente"); 

    baseController.findByIdWithEagerLoading(req, res, next);  
    } catch (error) {  
      next(error); 
    }  
  } 

  async findManyWithEagerLoading(req: AuthenticatedRequest, res: Response, next: NextFunction){ 
    try {  
      if (req.tenantConnection == undefined) { 
        throw new NotFoundError('TENANT_NOT_FOUND');
      } 
    const  pacienteRepository : PacienteRepository = new PacienteRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IPaciente, Paciente> = new BaseController(pacienteRepository,  "paciente"); 
      baseController.findManyWithEagerLoading(req, res, next); 
    } catch (error) { 
      next(error); 
    } 
  } 

}
