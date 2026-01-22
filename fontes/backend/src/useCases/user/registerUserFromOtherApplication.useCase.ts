import { IidentityService } from "../../domain/services/Iidentity.service";

export type RegisterUserFromOtherApplicationInputDTO = {
  accessToken: string;
}

export class RegisterUserFromOtherApplicationUseCase {

  constructor(
    private identityService: IidentityService
  ) {}

  async execute(input: RegisterUserFromOtherApplicationInputDTO): Promise<any> {
    throw new Error("Method not implemented yet");

    //TODO obter o token de acesso do usuário

    //Verificar se o TOken não espirou e é válido
    //Decodificar o token de acesso

    //Ver se dentro do token tem a informação que o usuário tem acesso a essa aplicação

    //Registrar usuário no banco de dados
  }
}