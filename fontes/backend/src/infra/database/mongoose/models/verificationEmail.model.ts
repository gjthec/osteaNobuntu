import mongoose, { Connection } from 'mongoose';
import { updateCounter } from './counter.model';

export default function defineModel(mongooseConnection: Connection) {
	const schema = new mongoose.Schema(
		{
			_id: {
				type: Number,
				required: false
			},
			email: {
				type: String,
				required: false
			},
			verificationCode: {
				type: String,
				required: false
			},
			isVerified: Boolean,
			verifiedDate: {
				type: Date,
				required: false
			},
			expirationDate: {
				type: Date,
				required: true
			}
		},
		{ timestamps: true }
	);

	schema.index({ email: 1 }, { unique: true });

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

		this._id = await updateCounter(mongooseConnection, 'verification_email');
		next();
	});

	return mongooseConnection.model('verification_email', schema);
}