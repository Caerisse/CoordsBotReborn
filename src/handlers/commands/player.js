const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getLogger } = require('../../lib/logger');
const {
  Channels, Players, Planets, Alliances,
} = require('../../lib/models');

const logger = getLogger('commands', 'player');

module.exports = {
  name: 'player',
  data: new SlashCommandBuilder()
    .setName('player')
    .setDescription('Add or edit player info')
    .addStringOption((option) => option
      .setName('name')
      .setDescription('Player name')
      .setRequired(true))
    .addStringOption((option) => option
      .setName('alliance')
      .setDescription('Alliance name')
      .setRequired(false))
    .addIntegerOption((option) => option
      .setName('weapon')
      .setDescription('Weapons Tech Level')
      .setRequired(false))
    .addIntegerOption((option) => option
      .setName('shield')
      .setDescription('Shield Tech Level')
      .setRequired(false))
    .addIntegerOption((option) => option
      .setName('armor')
      .setDescription('Armor Tech Level')
      .setRequired(false)),
  async execute(interaction) {
    logger.silly('Start');

    const channel = await Channels.findOne({ channelId: interaction.channel.id }).exec();
    const universe = channel?.universe;
    if (!universe) {
      return interaction.editReply('Universe not set for this channel');
    }

    logger.debug('Getting player info');
    const name = interaction.options.getString('name').toLowerCase();
    let allianceName = interaction.options.getString('alliance')?.toLowerCase();
    const weapon = interaction.options.getInteger('weapon');
    const shield = interaction.options.getInteger('shield');
    const armor = interaction.options.getInteger('armor');

    let alliance;
    if (allianceName) {
      alliance = await Alliances.findOneAndUpdate(
        {
          universe,
          name: allianceName,
        },
        {},
        { upsert: true, new: true },
      );
    }

    const updates = {};
    if (alliance) updates.alliance = alliance;
    if (weapon) updates.weapon = weapon;
    if (shield) updates.shield = shield;
    if (armor) updates.armor = armor;

    const player = await Players.findOneAndUpdate(
      {
        universe,
        name,
      },
      updates,
      { upsert: true, new: true },
    );

    allianceName = '-';
    if (player.alliance) {
      // eslint-disable-next-line no-underscore-dangle
      alliance = await Alliances.findById(player.alliance._id);
      allianceName = alliance.name;
    }

    const planets = await Planets
      .find({ universe, player })
      .sort([['galaxy', 'asc'], ['system', 'asc'], ['slot', 'asc']])
      .exec();
    let planetsText = '';
    if (planets.length === 0) {
      planetsText = '**None**';
    } else {
      planets.forEach((planet) => {
        planetsText += `\n${planet.galaxy}-${planet.system}-${planet.slot}`;
      });
    }

    logger.debug('Creating embed');
    const embed = new MessageEmbed()
      .setTimestamp()
      .setTitle(`**${name}**`)
      .setDescription(' ')
      .setColor('RED')
      .addField('Alliance', allianceName, true)
      .addField('WSA', `${player.weapon}/${player.shield}/${player.armor}`, true)
      .addField('Planets', planetsText, false);

    logger.debug('Sending info');
    return interaction.editReply({ embeds: [embed] });
  },
};
