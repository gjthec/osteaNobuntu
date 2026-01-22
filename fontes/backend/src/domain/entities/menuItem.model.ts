import { BaseResourceModel } from './baseResource.model';
import { Menu } from './menuConfig';

export interface IMenuItemDatabaseModel extends BaseResourceModel {
	name?: string;
	type?: string;
	routeUrl?: string;
	icon?: string;
	subMenuId?: number;
	menuId?: number;
}

export interface IMenuItem extends BaseResourceModel {
	name?: string;
	type?: string;
	routeUrl?: string;
	icon?: string;
	subMenu?: MenuItem[];
	menu?: Menu;
}

export class MenuItem extends BaseResourceModel {
	name?: string;
	type?: string;
	routeUrl?: string;
	icon?: string;
	subMenu?: MenuItem[];
	menu?: Menu;

	constructor(input: IMenuItem) {
		super();
		this.id = input.id;
		this.name = input.name;
		this.type = input.type;
		this.routeUrl = input.routeUrl;
		this.icon = input.icon;
		this.subMenu = input.subMenu;
		this.menu = input.menu;
	}

	static fromJson(jsonData: IMenuItem): MenuItem {
		return new MenuItem(jsonData);
	}
}
