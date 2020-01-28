import mongoose, { Document } from 'mongoose';

export interface PieceOrOtherState {
  type: string;
  title: string;
  composer: string;
  arranger: string;
  stream: string;
  controls: string;
}

const pieceSchema = new mongoose.Schema<PieceOrOtherState>({
  type: String,
  title: String,
  composer: String,
  arranger: String,
  stream: String,
  controls: String
});

export interface Concert extends Document {
  group: string;
  concert: string;
  fbvideo: string;
  venue: string;
  price: string;
  conductor: {
    title: string;
    name: string;
    description: string[];
  };
  description: string[];
  charity: [
    {
      name: string;
      registrationNumber: string;
    }
  ];
  pieces: PieceOrOtherState[];
  performers: {
    type: Map<string, string>;
  };
  committee: {
    type: Map<string, string>;
  };
  otherStates: {
    type: Map<
      string,
      {
        stream: string;
        controls: string;
      }
    >;
  };
}

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

export const Concert = mongoose.model<Concert>('Concert', schema);
