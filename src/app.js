const Discord = require('discord.js'); // Loads the discord API library
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const BotLib = require('./lib/bot');
const { getLogger } = require('./lib/logger');

const logger = getLogger('app', 'app');

// Initiates the client
logger.debug('Initializing discord client');
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILD_INVITES,
  ],
  partials: ['CHANNEL', 'REACTION'],
});
client.rootDir = __dirname; // Stores the running directory in the config so we don't have to traverse up directories.

// Connect to mondo database
mongoose.connect(process.env.MONGO_DB_URL, {
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.once('open', () => {
  logger.debug('Mongo connected');
});
db.on('error', (err) => {
  logger.error('Mongo connection error:', err);
});

// Loads commands on the client and registers them on the guild/globally
BotLib.loadCommands(client);

// Starts the bot and makes it begin listening to events.
logger.debug('Setting up on ready listener');
client.on('ready', () => {
  logger.info('Bot Online');
});

// Handle events
const eventFiles = fs.readdirSync(`${client.rootDir}/handlers/events`).filter((file) => file.endsWith('.js'));
eventFiles.forEach((file) => {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const event = require(`${client.rootDir}/handlers/events/${file}`);
  logger.debug(`Setting up ${event.name} listener`);
  if (event.once) {
    client.once(event.name, (...args) => {
      try {
        event.execute(client, ...args);
      } catch (error) {
        logger.error(`Failed running event handler for ${event.name}: ${JSON.stringify(error)}`);
      }
    });
  } else {
    client.on(event.name, (...args) => {
      try {
        event.execute(client, ...args);
      } catch (error) {
        logger.error(`Failed running event handler for ${event.name}: ${JSON.stringify(error)}`);
      }
    });
  }
});

// Log the bot in using the token provided in the config file
logger.debug('Logging in');
client.login(process.env.DISCORD_BOT_TOKEN).catch((err) => {
  logger.error(`Failed to authenticate with Discord network: "${err.message}"`);
});
