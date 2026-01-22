import { Sequelize, DataTypes } from "sequelize";
import { 	validateDateRange, 	validateDecimalRange, 	validateEmail, 	validateNumberRange, 	validateStringLength } from '../../validators';
import { ValidationError } from "../../../../errors/client.error";
import * as Sanitizers from '../../sanitizers';

export default function defineModel(sequelize: Sequelize){ 
  const schema = sequelize.define('agenda', { 
      titulo: {
      type: DataTypes.STRING(60) , 
				set(value: string) { 
					this.setDataValue( 
						'titulo',
						Sanitizers.truncateString(value, 60) as string 
					); 
				}, 
        validate: { 
					isValidtitulo(value: string) { 
						if (!validateStringLength(value, 0, 60))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field titulo must be between 0 and 60 characters long.' 
							}); 
						} 
          } 
        },
      field: 'titulo', 
    }, 
      observacao: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'observacao',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidobservacao(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field observacao must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'observacao', 
    }, 
      data: {
      type: DataTypes.DATE , 
      field: 'data', 
    }, 
      hora: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'hora',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidhora(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field hora must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'hora', 
    }, 
      status: {
      type: DataTypes.STRING(255) , 
				set(value: string) { 
					this.setDataValue( 
						'status',
						Sanitizers.truncateString(value, 255) as string 
					); 
				}, 
        validate: { 
					isValidstatus(value: string) { 
						if (!validateStringLength(value, 0, 255))  {
							throw new ValidationError('VALIDATION_FAILED_LENGTH', { 
								cause: 
									'The field status must be between 0 and 255 characters long.' 
							}); 
						} 
          } 
        },
      field: 'status', 
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
