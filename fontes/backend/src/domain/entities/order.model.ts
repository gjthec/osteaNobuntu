import { BaseResourceModel } from './baseResource.model';

export interface IOrder extends BaseResourceModel {
	employee?: string;
	customer?: string;
	orderDate?: string; // ISO string para data
	shippedDate?: string; // ISO string para data
	shipper?: string;
	shipName?: string;
	shipAddress?: string;
	shipCity?: string;
	shipStateProvince?: string;
	shipZipPostalCode?: string;
	shipCountryRegion?: string;
	shippingFee?: number;
	taxes?: number;
	paymentType?: string;
	paidDate?: string; // ISO string para data
	notes?: string; // Campo opcional
	taxRate?: number;
	taxStatus?: string;
	status?: string;
	orderDetails?: string;
}

export class Order extends BaseResourceModel {
	employee?: string;
	customer?: string;
	orderDate?: string;
	shippedDate?: string;
	shipper?: string;
	shipName?: string;
	shipAddress?: string;
	shipCity?: string;
	shipStateProvince?: string;
	shipZipPostalCode?: string;
	shipCountryRegion?: string;
	shippingFee?: number;
	taxes?: number;
	paymentType?: string;
	paidDate?: string;
	notes?: string | undefined;
	taxRate?: number;
	taxStatus?: string;
	status?: string;
	orderDetails?: string;

	constructor(data: IOrder) {
		super();
		this.id = data.id;
		this.employee = data.employee;
		this.customer = data.customer;
		this.orderDate = data.orderDate;
		this.shippedDate = data.shippedDate;
		this.shipper = data.shipper;
		this.shipName = data.shipName;
		this.shipAddress = data.shipAddress;
		this.shipCity = data.shipCity;
		this.shipStateProvince = data.shipStateProvince;
		this.shipZipPostalCode = data.shipZipPostalCode;
		this.shipCountryRegion = data.shipCountryRegion;
		this.shippingFee = data.shippingFee;
		this.taxes = data.taxes;
		this.paymentType = data.paymentType;
		this.paidDate = data.paidDate;
		this.notes = data.notes;
		this.taxRate = data.taxRate;
		this.taxStatus = data.taxStatus;
		this.status = data.status;
		this.orderDetails = data.orderDetails;
		this.createdAt = data.createdAt;
	}

	static fromJson(jsonData: IOrder): Order {
		return new Order(jsonData);
	}
}
