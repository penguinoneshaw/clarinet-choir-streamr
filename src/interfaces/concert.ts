export interface OtherState {
  type: string;
  stream: string;
  controls: string;
}

export interface Piece {
  type: 'piece';
  title: string;
  subtitle?: string;
  composer?: string;
  arranger?: string;
}

export function isPiece(state: PieceOrOtherState): state is Piece {
  return state.type === 'piece';
}

export type PieceOrOtherState = Piece | OtherState;

export interface Concert {
  group: string;
  concert: string;
  fbvideo: string;
  venue: string;
  price: string;
  description: string[];
  conductor: {
    title: string;
    name: string;
    description: string[];
  };
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
