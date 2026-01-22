import { Sequelize, DataTypes } from "sequelize";
import { 	validateDateRange, 	validateDecimalRange, 	validateEmail, 	validateNumberRange, 	validateStringLength } from '../../validators';
import { ValidationError } from "../../../../errors/client.error";
import * as Sanitizers from '../../sanitizers';

export default function defineModel(sequelize: Sequelize){ 
  const schema = sequelize.define('pacientes', { 
      nome: {
      type: DataTypes.STRING(50) , 
				set(value: string) { 
					this.setDataValue( 
						'nome',
						Sanitizers.truncateString(value, 50) as string 
					); 
				}, 
        validate: { 
					isValidnome(value: string) { 
						if (!validateStringLength(value, 0, 50))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field nome must be between 0 and 50 characters long.' 
							}); 
						} 
          } 
        },
      field: 'nome', 
    }, 
      sexo: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sexo',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsexo(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sexo must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sexo', 
    }, 
      dataNascimento: {
      type: DataTypes.DATE , 
      field: 'data_nascimento', 
    }, 
      cpf: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'cpf',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidcpf(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field cpf must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'cpf', 
    }, 
      telefone: {
      type: DataTypes.STRING(20) , 
				set(value: string) { 
					this.setDataValue( 
						'telefone',
						Sanitizers.truncateString(value, 20) as string 
					); 
				}, 
        validate: { 
					isValidtelefone(value: string) { 
						if (!validateStringLength(value, 0, 20))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field telefone must be between 0 and 20 characters long.' 
							}); 
						} 
          } 
        },
      field: 'telefone', 
    }, 
      email: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'email',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidemail(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field email must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'email', 
    }, 
      indicacao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'indicacao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidindicacao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field indicacao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'indicacao', 
    }, 
      exigenciasTrabalho: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'exigenciasTrabalho',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidexigenciasTrabalho(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field exigenciasTrabalho must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'exigencias_trabalho', 
    }, 
      atividadesLazer: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'atividadesLazer',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidatividadesLazer(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field atividadesLazer must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'atividades_lazer', 
    }, 
      posturaStress: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'posturaStress',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidposturaStress(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field posturaStress must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'postura_stress', 
    }, 
      limitacaoFuncionalAtual: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'limitacaoFuncionalAtual',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidlimitacaoFuncionalAtual(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field limitacaoFuncionalAtual must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'limitacao_funcional_atual', 
    }, 
      pontuacaoIncapacidadeFuncional: {
      type: DataTypes.INTEGER, 
				set(value: number) { 
					this.setDataValue( 
						'pontuacaoIncapacidadeFuncional',
						Sanitizers.clampNumber(value, 0, 9999999) as number 
					); 
				}, 
				validate: { 
					isInRange(value: number) { 
						if (!validateNumberRange(value, 0, 9999999)) { 		
							throw new ValidationError('VALITADION', { 
								cause: 
 'The value of field pontuacaoIncapacidadeFuncional must be between 0 and 9999999.' 
							}); 
						} 
					} 
				}, 
      field: 'pontuacao_incapacidade_funcional', 
    }, 
      pontuacaoEVA: {
      type: DataTypes.INTEGER, 
				set(value: number) { 
					this.setDataValue( 
						'pontuacaoEVA',
						Sanitizers.clampNumber(value, 0, 9999999) as number 
					); 
				}, 
				validate: { 
					isInRange(value: number) { 
						if (!validateNumberRange(value, 0, 9999999)) { 		
							throw new ValidationError('VALITADION', { 
								cause: 
 'The value of field pontuacaoEVA must be between 0 and 9999999.' 
							}); 
						} 
					} 
				}, 
      field: 'pontuacao_eva', 
    }, 
  }); 

  schema.prototype.toJSON = function() { 
    const values = Object.assign({}, this.get()); 

    values.id = values.id; 
    delete values._id; 
    delete values.__v; 
    return values; 
  }; 

  return schema; 
};
