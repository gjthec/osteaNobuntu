import { DatabasePermission } from "../../domain/entities/databasePermission.model";
import { ITenant } from "../../domain/entities/tenant.model";
import TenantConnection from "../../domain/entities/tenantConnection.model";
import { User } from "../../domain/entities/user.model";
import DatabaseCredentialRepository from "../../domain/repositories/databaseCredential.repository";
import DatabasePermissionRepository from "../../domain/repositories/databasePermission.repository";
import TenantRepository from "../../domain/repositories/tenant.repository";
import UserRepository from "../../domain/repositories/user.repository";
import { TenantConnectionService } from "../../domain/services/tenantConnection.service";
import { NotFoundError } from "../../errors/notFound.error";
import { ValidationError } from "../../errors/validation.error";
import { GetSecurityTenantConnectionUseCase } from "./getSecurityTenantConnection.useCase";

export type RegisterTenantPermissionInputDTO = {
  userId: number;
  tenantId: number;
  databaseCredentialId: number;
}

export class RegisterTenantPermissionUseCase {
  constructor(
  ) { }

  async execute(input: RegisterTenantPermissionInputDTO): Promise<DatabasePermission> {

    if(input.tenantId == 1){
      throw new ValidationError("It is not possible to invite a user to the default Tenant.");
    }

    const getSecurityTenantConnectionUseCase: GetSecurityTenantConnectionUseCase = new GetSecurityTenantConnectionUseCase();
    const securityDatabaseConnection: TenantConnection = await getSecurityTenantConnectionUseCase.execute();
    const databasePermissionRepository: DatabasePermissionRepository = new DatabasePermissionRepository(securityDatabaseConnection);
    const databaseCredentialRepository: DatabaseCredentialRepository = new DatabaseCredentialRepository(securityDatabaseConnection);
    const tenantRepository: TenantRepository = new TenantRepository(securityDatabaseConnection);
    const userRepository: UserRepository = new UserRepository(securityDatabaseConnection);

    let user: User | null = null;

    try {
      user = await userRepository.findById(input.userId);
    } catch (error) {
      throw Error("Error to set user permission on database. Detail: " + error);
    }

    if(user == null){
      throw new ValidationError("User does not exist.");
    }

    let databaseCredential;

    try {
      databaseCredential = await databaseCredentialRepository.findById(input.databaseCredentialId);
    } catch (error) {
      throw Error("Error to get database credential to invite user to tenant. Detail: " + error);
    }

    let tenant: ITenant | null = null;

    try {
      tenant = await tenantRepository.findById(input.tenantId);
    } catch (error) {
      throw Error("Error to get tenant to invite user to tenant. Detail: " + error);
    }

    try {
      if (databaseCredential == null) {
        throw new NotFoundError("Not found database credential.");
      }

      if (tenant == null) {
        throw new NotFoundError("Not found tenant.");
      }

      let createdDatabasePermission: DatabasePermission | null;

      try {
        createdDatabasePermission = await databasePermissionRepository.findOne({ databaseCredentialId: databaseCredential.id, tenantId: tenant.id, userId: user.id });
      } catch (error) {
        throw Error("Error to find user permission on database. Detail: " + error);
      }

      if (createdDatabasePermission != null) {
        throw new ValidationError("User already has tenant access.");
      }

      try {
        createdDatabasePermission = await databasePermissionRepository.create({
          databaseCredentialId: databaseCredential.id,
          isAdmin: false,
          tenantId: tenant.id,
          userId: user.id,
          userUID: user.UID
        });
      } catch (error) {
        throw Error("Error to create database permission. Detail: " + error);
      }

      const tenantConnectionService: TenantConnectionService = TenantConnectionService.instance;

      tenantConnectionService.addPermission({
        databaseCredential: {
          id: input.databaseCredentialId
        },
        tenant: {
          id: tenant.id!,
          name: tenant.name!
        },
        userId: user.id!,
        userUID: user.UID!,
        isAdmin: false
      });

      return createdDatabasePermission;
    } catch (error) {
      throw Error("Error to give access to invited user on tenant. Detail: " + error);
    }

  }

}