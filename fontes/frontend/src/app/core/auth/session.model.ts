import { BaseResourceModel } from "app/shared/models/base-resource.model";

export class Session extends BaseResourceModel {
    userUID: string;
    user: string;
    tenantUID: string;
    initialDate: Date;
    finishSessionDate: Date;
    stayConnected: boolean;
    hashValidationLogin: string;
    hashValidationLogout: string;

    static fromJson(jsonData: any): Session {
        return Object.assign(new Session(), jsonData);
    }
}
