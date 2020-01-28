export interface OtherState {
  type: string;
  stream: string;
  controls: string;
}

export interface Piece {
  type: 'piece';
  title: string;
  composer?: string;
  arranger?: string;
}

export type PieceOrOtherState = Piece | OtherState;

export interface Concert {
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
