import path from 'path';
import { IMenu, IMenuDatabaseModel } from '../domain/entities/menuConfig';
import {
	IMenuItem,
	IMenuItemDatabaseModel
} from '../domain/entities/menuItem.model';
import { TenantConnection } from '../domain/entities/tenantConnection.model';
import MenuRepository from '../domain/repositories/menu.repository';
import MenuConfigRepository from '../domain/repositories/menuConfig.repository';
import MenuItemRepository from '../domain/repositories/menuItem.repository';
import { InternalServerError } from '../errors/internal.error';
import fs from 'fs-extra';
import menu from '../resources/menu/home.json';

/**
 * Registra no banco de dados o menu gerado
 * @param {*} databaseConnection TenantConnection
 */
export default async function registerMenu(
	databaseConnection: TenantConnection
) {
	try {
		const isProduction = __dirname.includes('dist');
        const baseFolder = isProduction ? 'dist' : 'src';
        
        const menuPath = path.resolve(process.cwd(), baseFolder, 'resources', 'menu');
        
        const menuData: IMenu[] = readMenus(menuPath);

        if (databaseConnection.databaseType === 'mongodb') {
            await saveMenuMongo(databaseConnection, menuData);
        } else {
            await saveMenuSequelize(databaseConnection, menuData);
        }
        console.log('Menu registrado com sucesso');
	} catch (error) {
		throw new InternalServerError('Error to save menu data.', { cause: error });
	}
}

/**
 * Lê os menus
 * @param {*} menuPath string
 * @returns Retorna um array de menus
 */
function readMenus(fullPath: string): IMenu[] {
    try {
        const files = fs.readdirSync(fullPath);
        const menuData: IMenu[] = [];

        for (const file of files) {
            if (!file.endsWith('.json')) continue;

            const content = fs.readFileSync(path.join(fullPath, file), 'utf8');
            const menu = JSON.parse(content);
            menu.fileName = file;
            menuData.push(menu);
        }

        return menuData;
    } catch (error) {
        throw new Error('Erro ao ler o menu');
    }
}

/**
 * Salva o menu no banco de dados
 * @param {*} databaseConnection TenantConnection
 * @param {*} menuData IMenu[]
 */
async function saveMenuSequelize(
	databaseConnection: TenantConnection,
	menuData: IMenu[]
) {
	try {
		const menuRepository = new MenuRepository(databaseConnection);
		const menuConfigRepository = new MenuConfigRepository(databaseConnection);
		const menuItemRepository = new MenuItemRepository(databaseConnection);

		for (let menuIndex = 0; menuIndex < menuData.length; menuIndex++) {
			const menu = menuData[menuIndex];

			if (
				menu.fileName &&
				(await checkIfMenuIsSavedSequelize(databaseConnection, menu.fileName))
			) {
				continue;
			}

			const menuConfig = menu.config;
			const menuItem = menu.itens;

			if (!menuConfig) {
				throw new InternalServerError('Menu config is undefined');
			}

			const menuConfigDb = await menuConfigRepository.create(menuConfig);

			const menuDb: IMenuDatabaseModel = {
				fileName: menu.fileName,
				menuConfigId: menuConfigDb.id
			};

			const savedMenu = await menuRepository.create(menuDb);

			if (!menuItem) {
				continue;
			}

			for (
				let menuItemIndex = 0;
				menuItemIndex < menuItem.length;
				menuItemIndex++
			) {
				if (savedMenu.id === undefined) {
					throw new InternalServerError('Menu ID is undefined');
				}
				await saveMenuItemSequelize(
					menuItem[menuItemIndex],
					savedMenu.id,
					menuItemRepository
				);
			}
		}
	} catch (error) {
		throw new InternalServerError('Error to sabe Menu');
	}
}

/**
 * Salva o menu no MongoDB
 * @param {*} databaseConnection TenantConnection
 * @param {*} menuData IMenu[]
 */
async function saveMenuMongo(
	databaseConnection: TenantConnection,
	menuData: IMenu[]
) {
	throw new Error('MongoDB não suportado');
}

/**
 * Salva o item do menu no banco de dados
 * @param {*} menuItem IMenuItem
 * @param {*} menuId number
 * @param {*} menuItemRepository MenuItemRepository
 * @param {*} parentId number
 * @returns Retorna o id do menu
 */
async function saveMenuItemSequelize(
	menuItem: IMenuItem,
	menuId: number,
	menuItemRepository: MenuItemRepository,
	parentId: number | null = null
): Promise<number> {
	try {
		// Cria o menu ou submenu
		const menu = await menuItemRepository.create({
			name: menuItem.name,
			routeUrl: menuItem.routeUrl,
			icon: menuItem.icon,
			menuId: menuId,
			subMenuId: parentId ?? undefined
		});

		// Se existir subMenu, chama a função recursivamente
		if (menuItem.subMenu && menuItem.subMenu.length > 0) {
			await Promise.all(
				menuItem.subMenu.map(async (sub: any) => {
					await saveMenuItemSequelize(sub, menuId, menuItemRepository, menu.id);
				})
			);
		}

		return menu.id ?? 0;
	} catch (error) {
		throw new Error('Erro ao salvar o item do menu utilizando Sequelize');
	}
}

/**
 * Verifica se o menu já foi salvo
 * @param {*} databaseConnection TenantConnection
 * @param {*} fileName string
 * @returns Retorna true se o menu já foi salvo
 */
async function checkIfMenuIsSavedSequelize(
	databaseConnection: TenantConnection,
	fileName: string
): Promise<boolean> {
	const menuRepository = new MenuRepository(databaseConnection);
	const menu = await menuRepository.findOne({ fileName: fileName });

	return menu != null;
}

/**
 * Verifica se o menu já foi salvo no MongoDB
 * @param {*} databaseConnection TenantConnection
 * @param {*} fileName string
 * @returns Retorna true se o menu já foi salvo
 */
async function checkIfMenuIsSavedMongo(
	databaseConnection: TenantConnection,
	fileName: string
): Promise<boolean> {
	return false;
}