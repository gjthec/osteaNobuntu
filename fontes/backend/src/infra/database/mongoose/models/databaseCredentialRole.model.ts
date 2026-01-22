import mongoose, { Connection, Schema } from 'mongoose';
import { updateCounter } from './counter.model';

export default function defineModel(mongooseConnection: Connection) {
	const schema = new mongoose.Schema(
		{
			_id: {
				type: Number,
				required: false
			},
			roleId: {
				type: Number,
				ref: 'role',
				required: true
			},
			databaseCredentialId: {
				type: Number,
				ref: 'database_credential',
				required: true
			},
			isAdmin: {
				type: Boolean,
				require: true
			},
			accessLevel: {
				type: String,
				require: false
			}
		},
		{ timestamps: true }
	);

	schema.index({ ComponentStructureId: 1, RoleId: 1 }, { unique: true });

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
		this._id = await updateCounter(
			mongooseConnection,
			'database_credential_role'
		);
		next();
	});

	return mongooseConnection.model('database_credential_role', schema);
}
