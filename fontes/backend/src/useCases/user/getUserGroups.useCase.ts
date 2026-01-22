import { IidentityService } from "../../domain/services/Iidentity.service";

export type GetUseGroupsInputDTO = {
  accessToken: string;
}

export class GetUserGroupsUseCase {

  constructor(
    private identityService: IidentityService
  ) {}

  async execute({accessToken}: GetUseGroupsInputDTO): Promise<any> {
    return await this.identityService.getUserGroups("20fe4c3a-1c20-405c-ba38-f04a5b3e7198@allystore.onmicrosoft.com");
  }

}