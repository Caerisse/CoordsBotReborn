const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getLogger } = require('../../lib/logger');
const {
  Channels, Players, Planets, Alliances,
} = require('../../lib/models');

const logger = getLogger('commands', 'get');

module.exports = {
  name: 'get',
  cooldown: 0.1,
  data: new SlashCommandBuilder()
    .setName('get')
    .setDescription('Get player info')
    .addStringOption((option) => option
      .setName('name')
      .setDescription('Player name')
      .setRequired(true)),
  async execute(interaction) {
    logger.silly('Start');

    const channel = await Channels.findOne({ channelId: interaction.channel.id }).exec();
    const universe = channel?.universe;
    if (!universe) {
      return interaction.editReply('Universe not set for this channel');
    }

    logger.debug('Getting player info');
    const name = interaction.options.getString('name').toLowerCase();
    const player = await Players.findOne({ universe, name }).exec();
    if (!player) {
      return interaction.editReply(`Player ${name} not found on universe ${universe}`);
    }
    let allianceName = '-';
    if (player.alliance) {
      // eslint-disable-next-line no-underscore-dangle
      const alliance = await Alliances.findById(player.alliance._id);
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
      .addField('Alliance', allianceName, false)
      .addField('WSA', `${player.weapon}/${player.shield}/${player.armor}`, false)
      .addField('Planets', planetsText, false);

    // let row1 = new MessageActionRow();
    // row1.addComponents(new MessageButton()
    //   .setCustomId(`add-planet`)
    //   .setLabel('Add Planet')
    //   .setStyle('PRIMARY'));
    // row1.addComponents(new MessageButton()
    //   .setCustomId(`change-alliance`)
    //   .setLabel('Change Alliance')
    //   .setStyle('PRIMARY'));
    // row1.addComponents(new MessageButton()
    //   .setCustomId(`change-wsa`)
    //   .setLabel('Change WSA')
    //   .setStyle('PRIMARY'));

    // const components = [ row1 ];

    logger.debug('Sending info');
    if (interaction.commandName) {
      return interaction.editReply({ embeds: [embed] });
    }
    await interaction.message.edit({ embeds: [embed] });
    return interaction.deleteReply();
  },
};
