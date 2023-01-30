const { SlashCommandBuilder } = require('@discordjs/builders');
const { getLogger } = require('../../lib/logger');
const { Channels, Universes } = require('../../lib/models');

const logger = getLogger('commands', 'setuniverse');

module.exports = {
  name: 'setuniverse',
  admin: true,
  data: new SlashCommandBuilder()
    .setName('setuniverse')
    .setDescription('Set universe for this channel')
    .addStringOption((option) => option
      .setName('name')
      .setDescription('Universe name')
      .setRequired(true)),
  async execute(interaction) {
    logger.silly('Start');

    const name = interaction.options.getString('name').toLowerCase();

    const universe = await Universes.findOneAndUpdate(
      {
        name: name.toLowerCase(),
      },
      {},
      { upsert: true, new: true },
    );

    await Channels.findOneAndUpdate(
      {
        channelId: interaction.channel.id,
      },
      {
        universe,
      },
      { upsert: true, new: true },
    );

    return interaction.editReply('Universe set');
  },
};
