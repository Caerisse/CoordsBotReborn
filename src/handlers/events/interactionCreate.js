const { Collection } = require('discord.js');
const { getLogger } = require('../../lib/logger');

const logger = getLogger('events', 'interactionCreate');
const cooldowns = new Collection(); // Creates an empty list for storing timeouts so people can't spam with commands

module.exports = {
  name: 'interactionCreate',
  async execute(client, interaction) {
    await interaction.deferReply();
    let commandName = null;
    if (interaction.commandName) {
      logger.silly(`Received interaction ${interaction.commandName} from user ${interaction.user.username}`);
      commandName = interaction.commandName;
    } else {
      logger.silly(`Received interaction ${interaction.customId} from user ${interaction.user.username}`);
      commandName = interaction.customId.substring(0, interaction.customId.indexOf('-'));
    }

    if (!commandName) return interaction.editReply({ content: 'Could not find the command name specified', ephemeral: true });
    const command = client.commands.get(commandName)
                    || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return interaction.editReply({ content: 'Could not find the command specified', ephemeral: true });
    logger.debug(`Received command ${command.name} from user ${interaction.user.username}`);

    if (command.admin) {
      try {
        let isAdmin = false;
        if (interaction.guild) {
          // const guild = await client.guilds.fetch(interaction.guild.id);
          const member = await interaction.guild.members.fetch({ user: interaction.user.id, force: true });
          process.env.ROLE_ADMIN.split(',').forEach((roleId) => {
            isAdmin = isAdmin || member.roles.cache.has(roleId);
          });
        }

        if (!isAdmin) {
          logger.warn(`Received command ${command.name} from user ${interaction.user.username} who is not an admin`);
          return interaction.editReply('You must be an admin in the server to run this command');
        }
      } catch {
        logger.warn(`Received command ${command.name} from user ${interaction.user.username} who is not a member of the server`);
        return interaction.editReply('You must be an admin in the server to run this command');
      }
    }

    /**
    * The following block of code handles "cooldowns" making sure that users can only use a command every so often.
    * This is helpful for commands that require loading time or computation, like image requests.
    */
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (!timestamps.has(interaction.user.id)) {
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    } else {
      const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        logger.debug('Command was on cooldown');
        return interaction.editReply("Whoa! You're sending commands too fast! "
                                      + `Please wait ${timeLeft.toFixed(1)} more second(s) before running '${command.name}' again!`);
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    }
    /**
    * End cooldown code
    */

    // Run the command
    try {
      return command.execute(interaction);
    } catch (error) {
      logger.error(`Failed running command ${command.name}:  ${JSON.stringify(error)}`);
      return interaction.editReply({ content: `There was an error while executing this command! ${JSON.stringify(error)}`, ephemeral: true });
    }
  },
};
