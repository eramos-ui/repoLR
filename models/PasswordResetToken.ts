// /models/PasswordResetToken.ts
import mongoose, { Schema, models, model } from 'mongoose';

interface IPasswordResetToken {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>({
  userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

export const PasswordResetToken =
  models.PasswordResetToken || model<IPasswordResetToken>('PasswordResetToken', passwordResetTokenSchema);
