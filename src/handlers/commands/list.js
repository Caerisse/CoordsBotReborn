const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getLogger } = require('../../lib/logger');
const {
  Channels, Players, Universes, Alliances,
} = require('../../lib/models');

const logger = getLogger('commands', 'list');

module.exports = {
  name: 'list',
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List info')
    .addStringOption((option) => option
      .setName('category')
      .setDescription('Category')
      .setRequired(true)
      .addChoice('Universes', 'Universes')
      .addChoice('Alliances', 'Alliances')
      .addChoice('Players', 'Players')),
  async execute(interaction) {
    logger.silly('Start');

    const category = interaction.options.getString('category');

    const channel = await Channels.findOne({ channelId: interaction.channel.id }).exec();
    const universe = channel?.universe;

    if (category !== 'Universes' && !universe) {
      return interaction.editReply('Universe not set for this channel');
    }

    logger.debug('Getting info');

    let list = [];
    if (category === 'Universes') {
      list = await Universes
        .find({})
        .sort([['name', 'asc']])
        .exec();
    }
    if (category === 'Alliances') {
      list = await Alliances
        .find({ universe })
        .sort([['name', 'asc']])
        .exec();
    }
    if (category === 'Players') {
      list = await Players
        .find({ universe })
        .sort([['name', 'asc']])
        .exec();
    }

    let text = '';
    if (list.length === 0) {
      text = '**None**';
    } else {
      list.forEach((element) => {
        text += `\n${element.name}`;
      });
    }

    logger.debug('Creating embed');
    const embed = new MessageEmbed()
      .setTimestamp()
      .setTitle(`**${category}**`)
      .setDescription(text)
      .setColor('GREEN');

    return interaction.editReply({ embeds: [embed] });
  },
};
