const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const {
  Universes, Players, Planets, Alliances,
} = require('../../lib/models');
const { getLogger } = require('../../lib/logger');

const logger = getLogger('commands', 'info');

module.exports = {
  name: 'info',
  admin: true,
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get info and stats from the bot'),
  async execute(interaction) {
    logger.silly('Start');

    const universes = await Universes.find({});
    const alliances = await Alliances.find({});
    const players = await Players.find({});
    const planets = await Planets.find({});

    logger.debug('Creating embed');
    const embed = new MessageEmbed()
      .setTitle('Info')
      .setURL('https://github.com/Caerisse/CoordsBotReborn#readme')
      .setDescription('A bot for storing and retrieving game data')
      .addField('Author', 'Caerisse')
      .addField('Saved universes count', `${universes.length}`)
      .addField('Saved alliances count', `${alliances.length}`)
      .addField('Saved players count', `${players.length}`)
      .addField('Saved planets count', `${planets.length}`)
      .setColor('YELLOW');

    logger.debug('Sending info');
    return interaction.editReply({ embeds: [embed] });
  },
};
