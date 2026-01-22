import mongoose, { Connection } from 'mongoose';
import { updateCounter } from './counter.model';

export default function defineModel(mongooseConnection: Connection) {
	const schema = new mongoose.Schema(
		{
			_id: {
				type: Number,
				required: false
			},
			filterSearchParameterId: {
				type: Number,
				ref: 'filter_search_parameter',
				required: true
			},
			userId: {
				type: Number,
				ref: 'user',
				required: false
			},
			//exemplo: "read", "edit", "owner" or "admin"
			accessLevel: {
				type: String,
				allowNull: true
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
		this._id = await updateCounter(
			mongooseConnection,
			'filter_search_parameter_user'
		);
		next();
	});

	return mongooseConnection.model('filter_search_parameter_user', schema);
}
