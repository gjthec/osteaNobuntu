import { encryptDatabasePassword } from '../../utils/crypto.util';
import DatabaseCredentialRepository from '../../domain/repositories/databaseCredential.repository';
import { DatabaseCredential, IDatabaseCredential } from '../../domain/entities/databaseCredential.model';
import DatabasePermissionRepository from '../../domain/repositories/databasePermission.repository';
import UserRepository from '../../domain/repositories/user.repository';

type RegisterDatabaseCredentialInputDTO = {
  databaseCredential: IDatabaseCredential;
  tenantId: number;
  userUID: string;
}

export class RegisterDatabaseCredentialUseCase {
  constructor(
    private databaseCredentialRepository: DatabaseCredentialRepository,
    private databasePermissionRepository: DatabasePermissionRepository,
    private userRepository: UserRepository
  ) { }

  async execute(input: RegisterDatabaseCredentialInputDTO): Promise<string | Error> {

    try {
      //Verificar se o usuário é válido
      const user = await this.userRepository.findOne({UID: input.userUID});

      //Testa a conexão com as credenciais
      try {
        // const tenantConnection : TenantConnection = await testConnectToDatabase(input);
        //TODO chamar a função de conectar no banco de dados normal e com esse próprio try-catch lidar com o erro ou sucesso
      } catch (error) {
        console.log("Erro a o realizar a conexão com o banco de dados. Detalhes: ", error);
        throw error;
      }

      //TODO Verificar se já pode ser registro repetido


      //Criptografa a senha do tenant
      const encriptedDatabasePassword : string | null = encryptDatabasePassword(input.databaseCredential.password!);
      if(encriptedDatabasePassword == null){
        throw new Error("Não foi possível encriptografar senha das novas credenciais de tenant");
      }

      input.databaseCredential.password = encriptedDatabasePassword;

      //Registra as credenciais do tenant
      const newTenantCredential = await this.databaseCredentialRepository.create(new DatabaseCredential(input.databaseCredential));
      // await this.tenantCredentialService.create(input);

      //Registra o User Tenant
      await this.databasePermissionRepository.create({
        databaseCredentialId: newTenantCredential.id,
        tenantId: input.tenantId,
        isAdmin: true,
        userId: user!.id,
        userUID: input.userUID,
      });

      //Retornar dados do tenant criado
      return "Tenant Credential created";

    } catch (error) {
      throw error;
    }

  }

}