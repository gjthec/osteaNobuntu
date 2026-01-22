import mongoose, { Connection } from 'mongoose';
import { updateCounter } from './counter.model';

export default function defineModel(mongooseConnection: Connection) {
	const schema = new mongoose.Schema(
		{
			_id: {
				type: Number,
				required: false
			},
			name: {
				type: String,
				required: true
			},
			type: {
				type: String,
				required: true
			},
			username: {
				type: String,
				required: false
			},
			password: {
				type: String,
				required: false
			},
			host: {
				type: String,
				required: true
			},
			port: {
				type: String,
				required: false
			},
			srvEnabled: {
				type: Boolean,
				required: true
			},
			options: {
				type: String,
				required: false
			},
			storagePath: {
				type: String,
				required: false
			},
			sslEnabled: {
				type: Boolean,
				required: true
			},
			poolSize: {
				type: Number,
				required: true
			},
			timeOutTime: {
				type: Number,
				required: true
			},
			version: {
				type: Number,
				required: true
			},
			isPublic: {
				type: Boolean,
				required: true
			},
			tenantId: {
				type: Number,
				ref: 'tenant',
				required: true
			},
			//SSL data
			sslCertificateAuthority: {
				type: String,
				required: false
			},
			sslPrivateKey: {
				type: String,
				required: false
			},
			sslCertificate: {
				type: String,
				required: false
			}
		},
		{ timestamps: true }
	);

	schema.index(
		{ name: 1, type: 1, username: 1, host: 1, port: 1 },
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
		this._id = await updateCounter(mongooseConnection, 'DatabaseCredential');
		next();
	});

	return mongooseConnection.model('database_credential', schema);
}