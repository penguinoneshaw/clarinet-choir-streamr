import mongoose, { Document } from 'mongoose';
import { PieceOrOtherState, Concert } from '../../interfaces';

const pieceSchema = new mongoose.Schema<PieceOrOtherState>({
  type: String,
  title: String,
  subtitle: String,
  composer: String,
  arranger: String,
  stream: String,
  controls: String
});

const schema = new mongoose.Schema({
  group: String,
  concert: String,
  fbvideo: String,
  venue: String,
  price: String,
  conductor: {
    title: String,
    name: String,
    description: [String]
  },
  description: [String],
  charity: [
    {
      name: String,
      registrationNumber: String
    }
  ],
  pieces: [pieceSchema],
  performers: {
    type: Map,
    of: [String]
  },
  committee: {
    type: Map,
    of: String
  },
  otherStates: {
    type: Map,
    of: {
      stream: String,
      controls: String
    }
  }
});

export const ConcertModel = mongoose.model<Concert & Document>('Concert', schema);
