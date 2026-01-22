import { Sequelize, DataTypes } from "sequelize";
import { 	validateDateRange, 	validateDecimalRange, 	validateEmail, 	validateNumberRange, 	validateStringLength } from '../../validators';
import { ValidationError } from "../../../../errors/client.error";
import * as Sanitizers from '../../sanitizers';

export default function defineModel(sequelize: Sequelize){ 
  const schema = sequelize.define('avaliacoes_coluna_lombar', { 
      dataAvaliacao: {
      type: DataTypes.DATE , 
      field: 'data_avaliacao', 
    }, 
      tipo: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'tipo',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidtipo(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field tipo must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'tipo', 
    }, 
      sintomasAtuais: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasAtuais',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasAtuais(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasAtuais must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_atuais', 
    }, 
      sintomasPresentesDesde: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPresentesDesde',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPresentesDesde(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPresentesDesde must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_desde', 
    }, 
      situacaoSintomas: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'situacaoSintomas',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsituacaoSintomas(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field situacaoSintomas must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'situacao_sintomas', 
    }, 
      sintomasResultado: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasResultado',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasResultado(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasResultado must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_resultado', 
    }, 
      sintomasInicio: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasInicio',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasInicio(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasInicio must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_inicio', 
    }, 
      localInicioSintomas: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'localInicioSintomas',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidlocalInicioSintomas(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field localInicioSintomas must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'local_inicio_sintomas', 
    }, 
      localSintomasConstantes: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'localSintomasConstantes',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidlocalSintomasConstantes(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field localSintomasConstantes must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'local_sintomas_constantes', 
    }, 
      localSintomasIntermitentes: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'localSintomasIntermitentes',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidlocalSintomasIntermitentes(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field localSintomasIntermitentes must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'local_sintomas_intermitentes', 
    }, 
      pioraAcao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'pioraAcao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidpioraAcao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field pioraAcao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'piora_acao', 
    }, 
      pioraMomento: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'pioraMomento',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidpioraMomento(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field pioraMomento must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'piora_momento', 
    }, 
      melhoraAcao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'melhoraAcao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidmelhoraAcao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field melhoraAcao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'melhora_acao', 
    }, 
      melhoraMomento: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'melhoraMomento',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidmelhoraMomento(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field melhoraMomento must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'melhora_momento', 
    }, 
      disturbioSono: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'disturbioSono',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValiddisturbioSono(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field disturbioSono must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'disturbio_sono', 
    }, 
      travesseiro: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'travesseiro',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidtravesseiro(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field travesseiro must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'travesseiro', 
    }, 
      posicaoDormir: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'posicaoDormir',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidposicaoDormir(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field posicaoDormir must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'posicao_dormir', 
    }, 
      tipoColchao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'tipoColchao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidtipoColchao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field tipoColchao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'tipo_colchao', 
    }, 
      episodiosAnteriores: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'episodiosAnteriores',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidepisodiosAnteriores(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field episodiosAnteriores must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'episodios_anteriores', 
    }, 
      anoPrimeiroEpisodio: {
      type: DataTypes.INTEGER, 
				set(value: number) { 
					this.setDataValue( 
						'anoPrimeiroEpisodio',
						Sanitizers.clampNumber(value, 0, 4) as number 
					); 
				}, 
				validate: { 
					isInRange(value: number) { 
						if (!validateNumberRange(value, 0, 4)) { 		
							throw new ValidationError('VALITADION', { 
								cause: 
 'The value of field anoPrimeiroEpisodio must be between 0 and 4.' 
							}); 
						} 
					} 
				}, 
      field: 'ano_primeiro_episodio', 
    }, 
      historiaPreviaColuna: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'historiaPreviaColuna',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidhistoriaPreviaColuna(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field historiaPreviaColuna must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'historia_previa_coluna', 
    }, 
      tratamentosAnteriores: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'tratamentosAnteriores',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidtratamentosAnteriores(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field tratamentosAnteriores must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'tratamentos_anteriores', 
    }, 
      ocorreDor: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'ocorreDor',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidocorreDor(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field ocorreDor must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'ocorre_dor', 
    }, 
      funcionamentoBexiga: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'funcionamentoBexiga',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidfuncionamentoBexiga(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field funcionamentoBexiga must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'funcionamento_bexiga', 
    }, 
      funcionamentoIntestino: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'funcionamentoIntestino',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidfuncionamentoIntestino(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field funcionamentoIntestino must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'funcionamento_intestino', 
    }, 
      modoAndar: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'modoAndar',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidmodoAndar(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field modoAndar must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'modo_andar', 
    }, 
      medicacaoConsumida: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'medicacaoConsumida',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidmedicacaoConsumida(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field medicacaoConsumida must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'medicacao_consumida', 
    }, 
      complementoMedicacao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'complementoMedicacao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidcomplementoMedicacao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field complementoMedicacao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'complemento_medicacao', 
    }, 
      situacaoSaudeGeral: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'situacaoSaudeGeral',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsituacaoSaudeGeral(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field situacaoSaudeGeral must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'situacao_saude_geral', 
    }, 
      comorbidades: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'comorbidades',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidcomorbidades(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field comorbidades must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'comorbidades', 
    }, 
      complementoSaudeGeral: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'complementoSaudeGeral',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidcomplementoSaudeGeral(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field complementoSaudeGeral must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'complemento_saude_geral', 
    }, 
      historicoCancer: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'historicoCancer',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidhistoricoCancer(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field historicoCancer must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'historico_cancer', 
    }, 
      historicoTrauma: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'historicoTrauma',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidhistoricoTrauma(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field historicoTrauma must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'historico_trauma', 
    }, 
      cirurgiaRecente: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'cirurgiaRecente',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidcirurgiaRecente(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field cirurgiaRecente must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'cirurgia_recente', 
    }, 
      cirurgiaGrandePorte: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'cirurgiaGrandePorte',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidcirurgiaGrandePorte(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field cirurgiaGrandePorte must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'cirurgia_grande_porte', 
    }, 
      complementoCirurgia: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'complementoCirurgia',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidcomplementoCirurgia(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field complementoCirurgia must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'complemento_cirurgia', 
    }, 
      imagens: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'imagens',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidimagens(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field imagens must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'disturbio_sono', 
    }, 
      dorDuranteNoite: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'dorDuranteNoite',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValiddorDuranteNoite(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field dorDuranteNoite must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'dor_durante_noite', 
    }, 
      acidentes: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'acidentes',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidacidentes(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field acidentes must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'acidentes', 
    }, 
      perdaInexplicavelPeso: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'perdaInexplicavelPeso',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidperdaInexplicavelPeso(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field perdaInexplicavelPeso must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'perda_inexplicavel_peso', 
    }, 
      outrosRelatos: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'outrosRelatos',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidoutrosRelatos(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field outrosRelatos must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'outros_relatos', 
    }, 
      objetivosExpectativas: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'objetivosExpectativas',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidobjetivosExpectativas(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field objetivosExpectativas must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'objetivos_expectativas', 
    }, 
      posturaSentada: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'posturaSentada',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidposturaSentada(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field posturaSentada must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'postura_sentada', 
    }, 
      mudancaPostura: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'mudancaPostura',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidmudancaPostura(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field mudancaPostura must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'mudanca_postura', 
    }, 
      posturaEmPe: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'posturaEmPe',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidposturaEmPe(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field posturaEmPe must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'postura_em_pe', 
    }, 
      posturaLateralShifi: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'posturaLateralShifi',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidposturaLateralShifi(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field posturaLateralShifi must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'postura_lateral_shift', 
    }, 
      desvioRelevante: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'desvioRelevante',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValiddesvioRelevante(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field desvioRelevante must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'desvio_relevante', 
    }, 
      observacaoPostura: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'observacaoPostura',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidobservacaoPostura(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field observacaoPostura must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'observacao_postura', 
    }, 
      deficitMotor: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'deficitMotor',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValiddeficitMotor(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field deficitMotor must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'deficit_motor', 
    }, 
      reflexos: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'reflexos',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidreflexos(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field reflexos must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'reflexos', 
    }, 
      deficitSensorial: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'deficitSensorial',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValiddeficitSensorial(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field deficitSensorial must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'deficit_sensorial', 
    }, 
      sinaisDura: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sinaisDura',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsinaisDura(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sinaisDura must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sinais_dura', 
    }, 
      perdaMovFlexao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'perdaMovFlexao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidperdaMovFlexao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field perdaMovFlexao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'perda_movimento_flexao', 
    }, 
      sintomaFlexao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomaFlexao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomaFlexao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomaFlexao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintoma_flexao', 
    }, 
      perdaMovExtensao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'perdaMovExtensao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidperdaMovExtensao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field perdaMovExtensao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'perda_movimento_extensao', 
    }, 
      sintomaExtensao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomaExtensao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomaExtensao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomaExtensao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintoma_extensao', 
    }, 
      perdaMovDeslocLatDir: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'perdaMovDeslocLatDir',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidperdaMovDeslocLatDir(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field perdaMovDeslocLatDir must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'perda_mov_desloc_lat_dir', 
    }, 
      sintomaDeslocLatDir: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomaDeslocLatDir',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomaDeslocLatDir(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomaDeslocLatDir must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintoma_desloc_lat_dir', 
    }, 
      perdaMovDeslocLatEsq: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'perdaMovDeslocLatEsq',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidperdaMovDeslocLatEsq(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field perdaMovDeslocLatEsq must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'perda_mov_desloc_lat_esq', 
    }, 
      sintomaDeslocLatEsq: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomaDeslocLatEsq',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomaDeslocLatEsq(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomaDeslocLatEsq must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintoma_desloc_lat_esq', 
    }, 
      perdaMovOutro: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'perdaMovOutro',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidperdaMovOutro(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field perdaMovOutro must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'perda_movimento_outro', 
    }, 
      sintomaOutro: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomaOutro',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomaOutro(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomaOutro must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintoma_outro', 
    }, 
      sintomasPreTesteEmPe: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteEmPe',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteEmPe(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteEmPe must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_em_pe', 
    }, 
      sintomasPreTesteFEP: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteFEP',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteFEP(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteFEP must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_fep', 
    }, 
      sintomasPreTesteFEPRep: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteFEPRep',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteFEPRep(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteFEPRep must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_fep_rep', 
    }, 
      sintomasPosTesteFEPRep: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPosTesteFEPRep',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPosTesteFEPRep(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPosTesteFEPRep must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pos_teste_fep_rep', 
    }, 
      sintomasPreTesteEEP: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteEEP',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteEEP(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteEEP must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_eep', 
    }, 
      sintomasPreTesteEEPRep: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteEEPRep',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteEEPRep(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteEEPRep must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_eep_rep', 
    }, 
      sintomasPosTesteEEPRep: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPosTesteEEPRep',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPosTesteEEPRep(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPosTesteEEPRep must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pos_teste_eep_rep', 
    }, 
      sintomasPreTesteDeitado: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteDeitado',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteDeitado(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteDeitado must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_deitado', 
    }, 
      sintomasPreTesteFD: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteFD',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteFD(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteFD must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_fd', 
    }, 
      sintomasPreTesteFDRep: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteFDRep',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteFDRep(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteFDRep must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_fd_rep', 
    }, 
      sintomasPreTesteED: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteED',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteED(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteED must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_ed', 
    }, 
      sintomasPreTesteEDRep: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteEDRep',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteEDRep(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteEDRep must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_ed_rep', 
    }, 
      sintomasPosTesteEDRep: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPosTesteEDRep',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPosTesteEDRep(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPosTesteEDRep must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pos_teste_ed_rep', 
    }, 
      sintomasPreTeste: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTeste',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTeste(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTeste must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste', 
    }, 
      sintomasPreTesteDLEPD: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteDLEPD',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteDLEPD(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteDLEPD must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_DLEPD', 
    }, 
      sintomasPreTesteDLEPDRep: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteDLEPDRep',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteDLEPDRep(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteDLEPDRep must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_dlepd_rep', 
    }, 
      sintomasPreTesteDLEPE: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteDLEPE',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteDLEPE(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteDLEPE must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_dlepe', 
    }, 
      sintomasPreTesteDLEPERep: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteDLEPERep',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteDLEPERep(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteDLEPERep must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_dlepe_rep', 
    }, 
      sintomasPosTesteDLEPERep: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPosTesteDLEPERep',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPosTesteDLEPERep(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPosTesteDLEPERep must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pos_teste_dlepe_rep', 
    }, 
      sintomasPreTesteOutrosMovi: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPreTesteOutrosMovi',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPreTesteOutrosMovi(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPreTesteOutrosMovi must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pre_teste_outros_mov', 
    }, 
      sintomasPosTesteOutrosMovi: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'sintomasPosTesteOutrosMovi',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidsintomasPosTesteOutrosMovi(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field sintomasPosTesteOutrosMovi must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'sintomas_pos_teste_outros_mov', 
    }, 
      testeSentar: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'testeSentar',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidtesteSentar(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field testeSentar must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'teste_sentar', 
    }, 
      testeSentarComplemento: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'testeSentarComplemento',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidtesteSentarComplemento(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field testeSentarComplemento must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'teste_sentar_complemento', 
    }, 
      outrosTestes: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'outrosTestes',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidoutrosTestes(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field outrosTestes must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'outros_testes', 
    }, 
      derangement: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'derangement',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidderangement(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field derangement must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'derangement', 
    }, 
      direcionalPreference: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'direcionalPreference',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValiddirecionalPreference(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field direcionalPreference must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'direcional_preference', 
    }, 
      dysfunction: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'dysfunction',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValiddysfunction(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field dysfunction must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'dysfunction', 
    }, 
      outrosSubgrupo: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'outrosSubgrupo',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidoutrosSubgrupo(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field outrosSubgrupo must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'dysfunction', 
    }, 
      fatoresCondDorIncapa: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'fatoresCondDorIncapa',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidfatoresCondDorIncapa(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field fatoresCondDorIncapa must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'fatores_cond_dor_incapa', 
    }, 
      educacao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'educacao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValideducacao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field educacao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'educacao', 
    }, 
      tipoExercicio: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'tipoExercicio',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidtipoExercicio(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field tipoExercicio must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'tipo_exercicio', 
    }, 
      equipamentoIndicado: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'equipamentoIndicado',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidequipamentoIndicado(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field equipamentoIndicado must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'equipamento_indicado', 
    }, 
      principioExtensao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'principioExtensao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidprincipioExtensao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field principioExtensao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'principio_extensao', 
    }, 
      principioLateral: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'principioLateral',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidprincipioLateral(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field principioLateral must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'principio_lateral', 
    }, 
      principioFlexao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'principioFlexao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidprincipioFlexao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field principioFlexao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'principio_flexao', 
    }, 
      outrosExerciciosInterv: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'outrosExerciciosInterv',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidoutrosExerciciosInterv(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field outrosExerciciosInterv must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'outros_exercicios_inverv', 
    }, 
      frequencia: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'frequencia',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidfrequencia(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field frequencia must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'frequencia', 
    }, 
      barreirasRecuperacao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'barreirasRecuperacao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidbarreirasRecuperacao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field barreirasRecuperacao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'barreiras_recuperacao', 
    }, 
      objetivosTratamento: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'objetivosTratamento',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidobjetivosTratamento(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field objetivosTratamento must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'objetivos_tratamento', 
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
