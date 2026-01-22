import { Request, Response } from "express";
import { GetTenantDomainUseCase } from "../../../useCases/tenantDirectory/getTenantDirectoryDomain.useCase";

export class TenantDirectoryController {

  async getTenantDomain(req: Request, res: Response) {
    try {
      const getTenantDomainUseCase: GetTenantDomainUseCase = new GetTenantDomainUseCase();
      const domainInfo = await getTenantDomainUseCase.execute();

      return res.status(200).json(domainInfo);
    } catch (error: any) {
      return res.status(500).send({ message: "Ocorreu um erro desconhecido no servidor", error: error.message });
    }
  }

}