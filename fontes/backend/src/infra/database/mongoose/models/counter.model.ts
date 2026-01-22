import mongoose, { Connection } from 'mongoose';

export default function defineModel(mongooseConnection: Connection) {
	const schema = new mongoose.Schema(
		{
			_id: {
				type: String, // nome do documento que terá seu id
				required: true
			},
			sequence: {
				type: Number,
				required: true,
				default: 0
			}
		},
		{ timestamps: true }
	);

	schema.set('toJSON', {
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

	return mongooseConnection.model('counter', schema);
}

export async function updateCounter(
	mongooseConnection: Connection,
	documentName: string
): Promise<number> {
	//Atualiza o registro no documento counter
	const counter = await mongooseConnection.models.Counter.findOneAndUpdate(
		{ _id: documentName }, // Nome do contador
		{ $inc: { sequence: 1 } }, // Incrementar a sequência
		{ new: true, upsert: true } // Criar o contador se não existir
	);

	return counter.sequence; // Definir o ID incremental
}