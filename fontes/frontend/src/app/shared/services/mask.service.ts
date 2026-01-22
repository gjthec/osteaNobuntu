import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MaskService {
  private maskDictionary: { [key: string]: string } = {
    'CPFCNPJ': '000.000.000-00||00.000.000/0000-00',
    'CPF': '000.000.000-00',
    'CNPJ': '00.000.000/0000-00',
    'RG': '00.000.000-0||00.000.000-0',
    'CEI': '00.000.00000/00',
    'PIS': '000.00000.00-0',
    'NIS': '000.00000.00-0',
    'CBO': '0000-0',
    'SUS': '000 0000 0000 0000',
    'CRM': '0000',
    'CNH': '00000000000',
    'UF': 'AA',
    'IBGE': '0000000',
    'CEP': '00000-000',
    'PHONE': '(00) 0000-0000||(00) 0 0000-0000',
    'TELEFONE': '(00) 0000-0000||(00) 0 0000-0000',
    'CELLPHONE': '(00) 00000-0000||(00) 0 00000-0000',
    'DATE': '00/00/0000',
    'HOUR': '00:00',
    'CREDIT_CARD': '0000 0000 0000 0000',
    'CREDIT_CARD_EXPIRATION': '00/00',
    'CREDIT_CARD_CVV': '000',
  };

  constructor() { }

  getMaskPattern(maskType: string): string {
    if(!maskType) {
      return '';
    }
    return this.maskDictionary[maskType.toUpperCase()] || '';
  }
}
