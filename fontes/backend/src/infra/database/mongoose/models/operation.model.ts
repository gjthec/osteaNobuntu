import mongoose, { Connection, Schema } from 'mongoose';
import { updateCounter } from './counter.model';

export default function defineModel(mongooseConnection: Connection) {
	var schema = new mongoose.Schema(
		{
			_id: {
				type: Number,
				required: false
			},
			userId: {
				type: Number,
				ref: 'User',
				required: true
			},
			operationType: {
				type: String,
				required: true
			},
			tenantId: {
				type: Number,
				ref: 'Tenant',
				required: true
			},
			ipAddress: {
				type: String,
				required: true
			},
			geoLocation: {
				type: String
			},
			details: Object
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

	schema.pre('save', async function (next) {
		if (!this.isNew) return next();

		this._id = await updateCounter(mongooseConnection, 'operation');
		next();
	});

	return mongooseConnection.model('operation', schema);
}
