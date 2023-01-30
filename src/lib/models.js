const mongoose = require('mongoose');

const Logs = mongoose.model('logs', {
  timestamp: Date,
  level: String,
  message: String,
});

const GlobalVariables = mongoose.model('globalvariables', {
  name: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
  },
  value: String,
});

const Universes = mongoose.model('universes', {
  name: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
  }
});

const Channels = mongoose.model('channels', {
  universe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'universes',
    required: true,
  },
  channelId: {
    type: String,
    required: true,
    dropDups: true,
  },
});

const Alliances = mongoose.model('alliances', {
  universe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'universes',
    required: true,
  },
  name: {
    type: String,
    required: true,
    dropDups: true,
  },
});

const Players = mongoose.model('players', {
  universe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'universes',
    required: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
  },
  alliance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'alliances',
  },
  weapon: {
    type: Number,
    default: 0,
  },
  shield: {
    type: Number,
    default: 0,
  },
  armor: {
    type: Number,
    default: 0,
  },
});

const Planets = mongoose.model('planets', {
  universe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'universes',
    required: true,
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'players',
    required: true,
  },
  galaxy: Number,
  system: Number,
  slot: Number,
  moon: {
    type: Number,
    default: 0,
  },
});

module.exports = {
  Logs,
  GlobalVariables,
  Universes,
  Channels,
  Alliances,
  Players,
  Planets,
};
