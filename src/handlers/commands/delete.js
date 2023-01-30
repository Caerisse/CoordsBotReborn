const { SlashCommandBuilder } = require('@discordjs/builders');
const { getLogger } = require('../../lib/logger');
const {
  Channels, Universes, Alliances, Players, Planets,
} = require('../../lib/models');

const logger = getLogger('commands', 'delete');

module.exports = {
  name: 'delete',
  admin: true,
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Delete info')
    .addSubcommand((subcommand) => subcommand
      .setName('universes')
      .setDescription('Delete universe')
      .addStringOption((option) => option
        .setName('name')
        .setDescription('Name of the universe to delete')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('alliances')
      .setDescription('Delete alliance')
      .addStringOption((option) => option
        .setName('name')
        .setDescription('Name of the alliance to delete')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('players')
      .setDescription('Delete players')
      .addStringOption((option) => option
        .setName('name')
        .setDescription('Name of the player to delete')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('planet')
      .setDescription('Delete planet')
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
        .setRequired(true))),
  async execute(interaction) {
    logger.silly('Start');

    const category = interaction.options.getSubcommand();
    const name = interaction.options.getString('name').toLowerCase();

    const channel = await Channels.findOne({ channelId: interaction.channel.id }).exec();
    const universe = channel?.universe;

    if (category !== 'universes' && !universe) {
      return interaction.editReply('Universe not set for this channel');
    }

    logger.debug('Deleting info');

    if (category === 'universes') {
      await Planets.deleteMany({ universe });
      await Players.deleteMany({ universe });
      await Alliances.deleteMany({ universe });
      await Universes.deleteOne({ name });
    }
    if (category === 'alliances') {
      const alliance = await Alliances.findOne({ universe, name }).exec();
      const players = await Players.find({ universe, alliance }).exec();
      players.forEach(async (player) => {
        await Planets.deleteMany({ universe, player });
      });
      await Players.deleteMany({ universe, alliance });
      await Alliances.deleteOne({ universe, name });
    }
    if (category === 'players') {
      const player = await Players.findOne({ universe, name }).exec();
      await Planets.deleteMany({ universe, player });
      await Players.deleteOne({ universe, name });
    }
    if (category === 'planets') {
      const player = await Players.findOne({ universe, name }).exec();
      const galaxy = interaction.options.getInteger('galaxy');
      const system = interaction.options.getInteger('system');
      const slot = interaction.options.getInteger('slot');
      await Planets.deleteOne({
        universe,
        player,
        galaxy,
        system,
        slot,
      });
    }

    return interaction.editReply('Info deleted');
  },
};
