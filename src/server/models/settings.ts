import { model, Schema, Document } from 'mongoose';
import { Concert } from '../../interfaces';

export const settingsSchema = new Schema({
  // eslint-disable-next-line @typescript-eslint/camelcase
  concert_info: { type: Schema.Types.ObjectId, ref: 'Concert' },
  // eslint-disable-next-line @typescript-eslint/camelcase
  admin_secret: String
});

export interface SettingsType extends Document {
  concert_info: Concert & Document;
  admin_secret: string;
}

export const Settings = model<SettingsType>('Setting', settingsSchema);
