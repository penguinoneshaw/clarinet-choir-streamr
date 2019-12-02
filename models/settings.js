const mongoose = require('mongoose');

module.exports.Settings = mongoose.model('Setting', {
  concert_info: { type: mongoose.Schema.Types.ObjectId, ref: 'Concert' }
});
