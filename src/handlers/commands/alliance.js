const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getLogger } = require('../../lib/logger');
const { Channels, Players, Alliances } = require('../../lib/models');

const logger = getLogger('commands', 'alliance');

module.exports = {
  name: 'alliance',
  data: new SlashCommandBuilder()
    .setName('alliance')
    .setDescription('Get alliance info')
    .addStringOption((option) => option
      .setName('name')
      .setDescription('Alliance name')
      .setRequired(true)),
  async execute(interaction) {
    logger.silly('Start');

    const channel = await Channels.findOne({ channelId: interaction.channel.id }).exec();
    const universe = channel?.universe;
    if (!universe) {
      return interaction.editReply('Universe not set for this channel');
    }

    logger.debug('Getting alliance info');
    const name = interaction.options.getString('name').toLowerCase();
    const alliance = await Alliances.findOne({ universe, name }).exec();
    if (!alliance) {
      return interaction.editReply(`Alliance ${name} not found on universe ${universe}`);
    }
    const players = await Players
      .find({ universe, alliance })
      .exec();
    let playersText = '';
    if (players.length === 0) {
      playersText = '**None**';
    } else {
      players.forEach((player) => {
        playersText += `\n${player.name}`;
      });
    }

    logger.debug('Creating embed');
    const embed = new MessageEmbed()
      .setTimestamp()
      .setTitle(`**${name}**`)
      .setDescription(' ')
      .setColor('BLUE')
      .addField('Players', playersText, false);

    logger.debug('Sending info');
    return interaction.editReply({ embeds: [embed] });
  },
};
