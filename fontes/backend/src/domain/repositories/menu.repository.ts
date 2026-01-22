import { createDbAdapter } from '../../infra/database/createDb.adapter';
import { IDatabaseAdapter } from '../../infra/database/IDatabase.adapter';
import { TenantConnection } from '../entities/tenantConnection.model';
import BaseRepository from './base.repository';
import { IMenuDatabaseModel, Menu } from '../entities/menuConfig';

export default class MenuRepository extends BaseRepository<
	IMenuDatabaseModel,
	Menu
> {
	constructor(tenantConnection: TenantConnection) {
		const _adapter: IDatabaseAdapter<IMenuDatabaseModel, Menu> =
			createDbAdapter<IMenuDatabaseModel, Menu>(
				tenantConnection.models!.get('Menu'),
				tenantConnection.databaseType,
				tenantConnection.connection,
				Menu.fromJson
			);
		super(_adapter, tenantConnection);
	}

	async getAllMenus(): Promise<Menu[]> {
		const menus = await this.tenantConnection.models!.get('Menu').findAll({
			include: [
				{
					model: this.tenantConnection.models!.get('MenuItem'),
					as: 'menuItems' // deve ser exatamente o mesmo alias definido na associação
				},
				{
					model: this.tenantConnection.models!.get('MenuConfig'),
					as: 'menuConfig' // caso a associação use esse alias
				}
			]
		});

		menus.forEach((menu: any) => {
			menu.dataValues.itens = this.buildSubMenu(
				menu.dataValues.menuItems,
				null
			);
			menu.dataValues.config = menu.dataValues.menuConfig;
		});

		return menus;
	}

	async joinMenuWithItensAndConfig(): Promise<Menu[]> {
		const menus = await this.tenantConnection.models!.get('Menu').findAll();
		const menuItens = await this.tenantConnection
			.models!.get('MenuItem')
			.findAll();
		const menuConfigs = await this.tenantConnection
			.models!.get('MenuConfig')
			.findAll();

		const itensComSubMenu = this.buildSubMenu(menuItens, null);

		const menusComConfig = menus.map((menu: any) => ({
			...menu.dataValues,
			config:
				menuConfigs.find(
					(config: any) => config.dataValues.id === menu.dataValues.menuConfigId
				)?.dataValues || null,
			itens: itensComSubMenu.filter((item: any) => item.menuId === menu.id)
		}));

		return menusComConfig;
	}

	async getMenuByRole(roleId: number): Promise<Menu[]> {
		const roleMenus = await this.tenantConnection.models!.get('Role').findOne({
			where: { id: roleId },
			include: [
				{
					model: this.tenantConnection.models!.get('Menu'),
					as: 'menus', // use o alias definido na associação
					through: { attributes: [] } // opcional: para não trazer os atributos da tabela intermediária
				}
			]
		});
		const menus = await roleMenus.dataValues.menus.map(async (menu: any) => ({
			...(await this.getMenuById(menu.id))?.[0], // chama o método getMenuById para cada menu
			fileName: menu.dataValues.fileName, // adiciona o fileName do menu
			id: menu.dataValues.id, // adiciona o id do menu
			roleName: roleMenus.dataValues.name // adiciona o nome da role relacionada ao menu
		}));

		return (await Promise.all(menus)) as Menu[];
	}

	async getMenuById(menuId: number): Promise<Menu[] | null> {
		let menu = await this.tenantConnection.models!.get('Menu').findOne({
			where: { id: menuId },
			include: [
				{
					model: this.tenantConnection.models!.get('MenuItem'),
					as: 'menuItems' // deve ser exatamente o mesmo alias definido na associação
				},
				{
					model: this.tenantConnection.models!.get('MenuConfig'),
					as: 'menuConfig' // caso a associação use esse alias
				}
			]
		});

		menu = {
			itens: this.buildSubMenu(menu.dataValues.menu, null),
			config: menu.dataValues.menuConfig,
			...menu.dataValues
		};

		return [menu];
	}

	async getDefaultMenu(): Promise<Menu[]> {
		const menus = await this.tenantConnection.models!.get('Menu').findAll({
			include: [
				{
					model: this.tenantConnection.models!.get('MenuItem'),
					as: 'menu' // deve ser exatamente o mesmo alias definido na associação
				},
				{
					model: this.tenantConnection.models!.get('MenuConfig'),
					as: 'menuConfig', // caso a associação use esse alias
					required: true, // garante que só trará menus com menuConfig associado
					where: { defaultMenu: true } // filtra apenas os menus cujo menuConfig tenha defaultMenu = true
				}
			]
		});

		const defaultMenus = menus.map((menu: any) => {
			return {
				...menu.dataValues,
				itens: this.buildSubMenu(menu.dataValues.menu, null),
				config: menu.dataValues.menuConfig
			};
		});

		return defaultMenus;
	}

	private buildSubMenu(
		menuItens: Record<string, any>[],
		parentId: number | null
	): any[] {
		return menuItens
			.filter((item) => item.dataValues.subMenuId === parentId)
			.map((item) => {
				return {
					...item.dataValues,
					subMenu: this.buildSubMenu(menuItens, item.id)
				};
			});
	}
}
