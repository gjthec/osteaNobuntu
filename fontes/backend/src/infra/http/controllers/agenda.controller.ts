import { NextFunction, Response } from "express";
import { BaseController } from "./base.controller";
import { Agenda, IAgenda } from "../../../domain/entities/agenda.model"; 
import AgendaRepository from "../../../domain/repositories/agenda.repository";
import { ValidationError } from "sequelize";
import { AuthenticatedRequest } from "../middlewares/checkUserAccess.middleware";
import { NotFoundError } from "../../../errors/client.error";
import { TenantConnection } from "../../../domain/entities/tenantConnection.model";

export class AgendaController { 

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {  
    try { 
      if (req.tenantConnection == undefined) { 
        throw new NotFoundError('TENANT_NOT_FOUND');
      } 
    const  agendaRepository : AgendaRepository = new AgendaRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IAgenda, Agenda> = new BaseController(agendaRepository,  "agenda"); 

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
    const  agendaRepository : AgendaRepository = new AgendaRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IAgenda, Agenda> = new BaseController(agendaRepository,  "agenda"); 

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
    const  agendaRepository : AgendaRepository = new AgendaRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IAgenda, Agenda> = new BaseController(agendaRepository,  "agenda"); 

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
    const  agendaRepository : AgendaRepository = new AgendaRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IAgenda, Agenda> = new BaseController(agendaRepository,  "agenda"); 

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
    const  agendaRepository : AgendaRepository = new AgendaRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IAgenda, Agenda> = new BaseController(agendaRepository,  "agenda"); 

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
    const  agendaRepository : AgendaRepository = new AgendaRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IAgenda, Agenda> = new BaseController(agendaRepository,  "agenda"); 

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
    const  agendaRepository : AgendaRepository = new AgendaRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IAgenda, Agenda> = new BaseController(agendaRepository,  "agenda"); 

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

    const  agendaRepository : AgendaRepository = new AgendaRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IAgenda, Agenda> = new BaseController(agendaRepository,  "agenda"); 

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
    const  agendaRepository : AgendaRepository = new AgendaRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IAgenda, Agenda> = new BaseController(agendaRepository,  "agenda"); 

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
    const  agendaRepository : AgendaRepository = new AgendaRepository(req.tenantConnection as TenantConnection);
    const baseController : BaseController<IAgenda, Agenda> = new BaseController(agendaRepository,  "agenda"); 
      baseController.findManyWithEagerLoading(req, res, next); 
    } catch (error) { 
      next(error); 
    } 
  } 

}
