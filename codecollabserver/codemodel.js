const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
  roomId: String,
  code: String,
});

const CodeModel = mongoose.model('Code', codeSchema);

module.exports = { CodeModel };