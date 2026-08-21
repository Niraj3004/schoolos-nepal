import mongoose, { Schema, Document } from 'mongoose';

export interface IHouse extends Document {
  schoolId: mongoose.Types.ObjectId;
  name: string;
  color?: string;
  description?: string;
}

const HouseSchema = new Schema<IHouse>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  color: { type: String },
  description: { type: String }
}, { timestamps: true });

HouseSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const House = mongoose.model<IHouse>('House', HouseSchema);
