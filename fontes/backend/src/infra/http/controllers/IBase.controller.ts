import { NextFunction, Request, Response } from 'express';

export interface IBaseController {
	create(req: Request, res: Response, next: NextFunction): Promise<any>;
	findAll(req: Request, res: Response, next: NextFunction): Promise<any>;
	findOne(req: Request, res: Response, next: NextFunction): Promise<any>;
	findById(req: Request, res: Response, next: NextFunction): Promise<any>;
	getCount(req: Request, res: Response, next: NextFunction): Promise<any>;
	update(req: Request, res: Response, next: NextFunction): Promise<any>;
	delete(req: Request, res: Response, next: NextFunction): Promise<any>;
	deleteAll(req: Request, res: Response, next: NextFunction): Promise<any>;
	executeQuery(req: Request, res: Response, next: NextFunction): Promise<any>;
}