import mongoose, { Connection } from "mongoose"; 
import { updateCounter } from "./counter.model"; 

export default function defineModel(mongooseConnection: Connection) {  

  if (mongooseConnection.models.agenda) { 
    return mongooseConnection.models.agenda; 
  } 

  var schema = new mongoose.Schema( 
    {
      _id: { 
        type: Number, 
        required: false 
      }, 
      titulo: {
          type: String,
          maxlength:  60,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 60; 
          }, 
          message: "O campo deve ter no máximo 60 caracteres." 
        } 
      },
      observacao: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      data: {
          type: Date,
      },
      hora: {
          type: String,
      },
      status: {
          type: String,
      },
        paciente: {type: mongoose.Schema.Types.ObjectId, ref: 'pacientes'}, 
        avaliacao: {type: mongoose.Schema.Types.ObjectId, ref: 'avaliacoes_coluna_lombar'}, 
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

    this._id = await updateCounter(mongooseConnection, "Agenda"); 
    next(); 
  }); 

  return mongooseConnection.model("agenda", schema); 
};
