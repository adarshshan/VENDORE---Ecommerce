import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  image: string;
  link: string;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IBanner>('Banner', BannerSchema);
