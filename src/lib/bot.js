const fs = require('fs');
const Discord = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { getLogger } = require('./logger');

const logger = getLogger('libs', 'bot');

/**
 * This class auto loads handler functions from the given subdirectory
 */
module.exports = {
  loadCommands(client) {
    logger.debug('Load application slash commands');

    // Creates an empty list in the client object to store all functions
    // eslint-disable-next-line no-param-reassign
    client.commands = new Discord.Collection();
    const commands = [];
    // Gather a list of all of our individual handler functions
    const commandFiles = fs.readdirSync(`${client.rootDir}/handlers/commands`).filter((file) => file.endsWith('.js'));

    commandFiles.forEach((file) => {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const command = require(`${client.rootDir}/handlers/commands/${file}`);
      client.commands.set(command.name, command);
      if (command.data) {
        commands.push(command.data.toJSON());
      }
      if (command.dataJSON) {
        commands.push(command.dataJSON);
      }
    });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    (async () => {
      try {
        logger.debug(`Started refreshing application slash commands ${commands.map((command) => command.name).join(', ')}`);

        if (process.env.GUILD_TEST) {
          await rest.put(
            Routes.applicationGuildCommands(process.env.DISCORD_BOT_ID, process.env.GUILD_TEST),
            { body: commands },
          );
        } else {
          await rest.put(
            Routes.applicationCommands(process.env.DISCORD_BOT_ID),
            { body: commands },
          );
        }

        logger.debug('Successfully reloaded application slash commands');
      } catch (error) {
        logger.error(error);
      }
    })();
  },
};
