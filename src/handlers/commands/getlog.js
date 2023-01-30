const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getLogger } = require('../../lib/logger');

const logger = getLogger('commands', 'getlog');

module.exports = {
  name: 'logs',
  admin: true,
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Get latest log file from the bot'),
  execute(interaction) {
    logger.debug('Creating embed');
    const embed = new MessageEmbed()
      .setTitle('Latest Logs')
      .setDescription(`Latest log file at ${(new Date()).toUTCString()}`)
      .setTimestamp();

    logger.debug('Sending logs');
    return interaction.editReply({ embeds: [embed], files: ['./logs/bot.log'] });
  },
};
