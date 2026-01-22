import mongoose, { Connection } from 'mongoose';
import { updateCounter } from './counter.model';

export default function defineModel(mongooseConnection: Connection) {
	var schema = new mongoose.Schema(
		{
			_id: {
				type: Number,
				required: false
			},
			description: {
				type: String,
				required: false
			},
			route: {
				type: String,
				required: true
			},
			method: {
				type: String,
				required: true
			},
			className: {
				type: String,
				required: true
			},
			isPublic: {
				type: Boolean,
				require: true
			}
		},
		{ timestamps: true }
	);

	schema.index(
		{ route: 1, method: 1 }, //Define que não pode ter mais de um registro com a mesma rota e método
		{ unique: true }
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

	schema.pre('save', async function (next) {
		if (!this.isNew) return next();
		this._id = await updateCounter(mongooseConnection, 'function_system');
		next();
	});

	return mongooseConnection.model('function_system', schema);
}