const { SlashCommandBuilder } = require('@discordjs/builders');
const { getLogger } = require('../../lib/logger');
const { Channels, Players, Planets } = require('../../lib/models');

const logger = getLogger('commands', 'planet');

module.exports = {
  name: 'planet',
  cooldown: 0.1,
  data: new SlashCommandBuilder()
    .setName('planet')
    .setDescription('Add or edit planet info')
    .addStringOption((option) => option
      .setName('name')
      .setDescription('Player name')
      .setRequired(true))
    .addIntegerOption((option) => option
      .setName('galaxy')
      .setDescription('Galaxy')
      .setRequired(true))
    .addIntegerOption((option) => option
      .setName('system')
      .setDescription('System')
      .setRequired(true))
    .addIntegerOption((option) => option
      .setName('slot')
      .setDescription('Planet slot')
      .setRequired(true))
    .addIntegerOption((option) => option
      .setName('moon')
      .setDescription('Moon size')
      .setRequired(false)),
  async execute(interaction) {
    logger.silly('Start');

    const channel = await Channels.findOne({ channelId: interaction.channel.id }).exec();
    const universe = channel?.universe;
    if (!universe) {
      return interaction.editReply('Universe not set for this channel');
    }

    logger.debug('Getting info');
    const name = interaction.options.getString('name').toLowerCase();
    const galaxy = interaction.options.getInteger('galaxy');
    const system = interaction.options.getInteger('system');
    const slot = interaction.options.getInteger('slot');
    const moon = interaction.options.getInteger('moon');

    logger.debug('Saving info');
    const player = await Players.findOneAndUpdate(
      {
        universe,
        name,
      },
      {},
      { upsert: true, new: true },
    );

    await Planets.findOneAndUpdate(
      {
        universe,
        player,
        galaxy,
        system,
        slot,
      },
      {
        moon,
      },
      { upsert: true, new: true },
    );

    logger.debug('Sending response');
    return interaction.editReply('Planet added');
  },
};
