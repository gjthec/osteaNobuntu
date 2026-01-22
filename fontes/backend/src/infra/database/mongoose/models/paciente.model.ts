import mongoose, { Connection } from "mongoose"; 
import { updateCounter } from "./counter.model"; 

export default function defineModel(mongooseConnection: Connection) {  

  if (mongooseConnection.models.paciente) { 
    return mongooseConnection.models.paciente; 
  } 

  var schema = new mongoose.Schema( 
    {
      _id: { 
        type: Number, 
        required: false 
      }, 
      nome: {
          type: String,
          maxlength:  50,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 50; 
          }, 
          message: "O campo deve ter no máximo 50 caracteres." 
        } 
      },
      sexo: {
          type: String,
      },
      dataNascimento: {
          type: Date,
      },
      cpf: {
          type: String,
      },
      telefone: {
          type: String,
          maxlength:  20,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 20; 
          }, 
          message: "O campo deve ter no máximo 20 caracteres." 
        } 
      },
      email: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      indicacao: {
          type: String,
      },
      exigenciasTrabalho: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      atividadesLazer: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      posturaStress: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      limitacaoFuncionalAtual: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      pontuacaoIncapacidadeFuncional: {
          type: Number,
      },
      pontuacaoEVA: {
          type: Number,
      }
    },
    { timestamps: true }
  );

  schema.set("toObject", {
    transform: (doc, ret, options) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  });

  schema.set('toObject', { 
    virtuals: true, 
    versionKey: false, 
    transform: (doc, ret) => { 
      ret.id = ret._id; 
      delete ret._id; 
    } 
  }); 

  schema.pre('save', async function (next) { 
    if (!this.isNew) return next(); 

    this._id = await updateCounter(mongooseConnection, "Paciente"); 
    next(); 
  }); 

  return mongooseConnection.model("pacientes", schema); 
};
