import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  schoolId?: mongoose.Types.ObjectId;
  isActive: boolean;
  refreshToken?: string;
  lastLogin?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], required: true },
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant' }, // Nullable for SUPERADMIN
  isActive: { type: Boolean, default: true },
  refreshToken: { type: String, select: false },
  lastLogin: { type: Date }
}, { timestamps: true });

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password as string, 12);
});

UserSchema.methods.comparePassword = async function(candidate: string) {
  return bcrypt.compare(candidate, this.password as string);
};

export const User = mongoose.model<IUser>('User', UserSchema);
