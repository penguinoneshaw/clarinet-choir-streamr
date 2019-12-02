const mongoose = require('mongoose');

const pieceSchema = new mongoose.Schema({
  type: String,
  title: String,
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

module.exports.Concert = mongoose.model('Concert', schema);
