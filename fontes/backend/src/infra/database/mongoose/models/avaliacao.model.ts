import mongoose, { Connection } from "mongoose"; 
import { updateCounter } from "./counter.model"; 

export default function defineModel(mongooseConnection: Connection) {  

  if (mongooseConnection.models.avaliacao) { 
    return mongooseConnection.models.avaliacao; 
  } 

  var schema = new mongoose.Schema( 
    {
      _id: { 
        type: Number, 
        required: false 
      }, 
        paciente: {type: mongoose.Schema.Types.ObjectId, ref: 'pacientes'}, 
      dataAvaliacao: {
          type: Date,
      },
      tipo: {
          type: String,
      },
        localSintoma: {type: mongoose.Schema.Types.ObjectId, ref: 'fieldFile'},
      sintomasAtuais: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPresentesDesde: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      situacaoSintomas: {
          type: String,
      },
      sintomasResultado: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasInicio: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      localInicioSintomas: {
          type: String,
      },
      localSintomasConstantes: {
          type: String,
      },
      localSintomasIntermitentes: {
          type: String,
      },
      pioraAcao: {
          type: String,
      },
      pioraMomento: {
          type: String,
      },
      melhoraAcao: {
          type: String,
      },
      melhoraMomento: {
          type: String,
      },
      disturbioSono: {
          type: String,
      },
      travesseiro: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      posicaoDormir: {
          type: String,
      },
      tipoColchao: {
          type: String,
      },
      episodiosAnteriores: {
          type: String,
      },
      anoPrimeiroEpisodio: {
          type: Number,
          maxlength:  4,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 4; 
          }, 
          message: "O campo deve ter no máximo 4 caracteres." 
        } 
      },
      historiaPreviaColuna: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      tratamentosAnteriores: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      ocorreDor: {
          type: String,
      },
      funcionamentoBexiga: {
          type: String,
      },
      funcionamentoIntestino: {
          type: String,
      },
      modoAndar: {
          type: String,
      },
      medicacaoConsumida: {
          type: String,
      },
      complementoMedicacao: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      situacaoSaudeGeral: {
          type: String,
      },
      comorbidades: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      complementoSaudeGeral: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      historicoCancer: {
          type: String,
      },
      historicoTrauma: {
          type: String,
      },
      cirurgiaRecente: {
          type: String,
      },
      cirurgiaGrandePorte: {
          type: String,
      },
      complementoCirurgia: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      imagens: {
          type: String,
      },
      dorDuranteNoite: {
          type: String,
      },
      acidentes: {
          type: String,
      },
      perdaInexplicavelPeso: {
          type: String,
      },
      outrosRelatos: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      objetivosExpectativas: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      posturaSentada: {
          type: String,
      },
      mudancaPostura: {
          type: String,
      },
      posturaEmPe: {
          type: String,
      },
      posturaLateralShifi: {
          type: String,
      },
      desvioRelevante: {
          type: String,
      },
      observacaoPostura: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      deficitMotor: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      reflexos: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      deficitSensorial: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sinaisDura: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      perdaMovFlexao: {
          type: String,
      },
      sintomaFlexao: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      perdaMovExtensao: {
          type: String,
      },
      sintomaExtensao: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      perdaMovDeslocLatDir: {
          type: String,
      },
      sintomaDeslocLatDir: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      perdaMovDeslocLatEsq: {
          type: String,
      },
      sintomaDeslocLatEsq: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      perdaMovOutro: {
          type: String,
      },
      sintomaOutro: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteEmPe: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteFEP: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteFEPRep: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPosTesteFEPRep: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteEEP: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteEEPRep: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPosTesteEEPRep: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteDeitado: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteFD: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteFDRep: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteED: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteEDRep: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPosTesteEDRep: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTeste: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteDLEPD: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteDLEPDRep: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteDLEPE: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteDLEPERep: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPosTesteDLEPERep: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPreTesteOutrosMovi: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      sintomasPosTesteOutrosMovi: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      testeSentar: {
          type: String,
      },
      testeSentarComplemento: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      outrosTestes: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      derangement: {
          type: String,
      },
      direcionalPreference: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      dysfunction: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      outrosSubgrupo: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      fatoresCondDorIncapa: {
          type: String,
      },
      educacao: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      tipoExercicio: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      equipamentoIndicado: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      principioExtensao: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      principioLateral: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      principioFlexao: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      outrosExerciciosInterv: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      frequencia: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      barreirasRecuperacao: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
      },
      objetivosTratamento: {
          type: String,
          maxlength:  255,
        validate: { 
          validator: function(value: string) { 
            return value.length >= 1 && value.length <= 255; 
          }, 
          message: "O campo deve ter no máximo 255 caracteres." 
        } 
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

    this._id = await updateCounter(mongooseConnection, "Avaliacao"); 
    next(); 
  }); 

  return mongooseConnection.model("avaliacoes_coluna_lombar", schema); 
};
