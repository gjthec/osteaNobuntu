import mongoose, { Connection } from 'mongoose';
import { updateCounter } from './counter.model';

export default function defineModel(mongooseConnection: Connection) {
	var schema = new mongoose.Schema(
		{
			_id: {
				type: Number,
				required: false
			},
			ip: {
				type: String,
				required: true
			},
			route: {
				type: String,
				required: true
			},
			method: {
				type: String,
				required: true
			},
			statusCode: {
				type: Number,
				required: true
			},
			responseTime: {
				type: Number,
				required: true
			},
			requestBody: {
				type: Object,
				required: false
			},
			responseBody: {
				type: Object,
				required: false
			},
			userId: {
				type: Number,
				ref: 'users'
			},
			userIdentityProviderUID: {
				type: String,
				required: false
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

	schema.pre('save', async function (next) {
		if (!this.isNew) return next();

		this._id = await updateCounter(mongooseConnection, 'request_log');
		next();
	});

	return mongooseConnection.model('request_log', schema);
}
