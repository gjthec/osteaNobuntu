import { BaseResourceModel } from "./base-resource.model";

export class UserConfig extends BaseResourceModel{
    language: String;
    dateFormat: String;
    timeFormat: String;
    notification: Boolean;
    theme: String;

    static fromJson(jsonData: any): UserConfig{
        return Object.assign(new UserConfig(), jsonData);
    }
}