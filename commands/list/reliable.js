const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder, UserSelectMenuBuilder } = require('discord.js');
const logger = require('log4js').getLogger();
const { submissionResultsID, guildId } = require('../../config.json');

module.exports = {
    enabled: true,
    data: new SlashCommandBuilder()
        .setName('reliable')
        .setDescription('Staff list management')
        .addSubcommand(subcommand =>
            subcommand
                .setName('yes')
                .setDescription('Add a yes vote to a level'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('no')
                .setDescription('Add a no vote to a level'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('accept')
                .setDescription('Accept a level'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reject')
                .setDescription('Reject a level')),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
         
        if (interaction.options.getSubcommand() === 'yes') {
            
            // if the current channel is not a thread
            if (!interaction.channel.isThread()) {
                return await interaction.editReply('You must be in a thread to use this command');
            }
            
            // get the thread name
            const text = interaction.channel.name;
            const matchLevelName = text.match(/^(.*)\s\d+-\d+$/);
            const matchYes = text.match(/(\d+)-\d+$/);
            const matchNo = text.match(/\d+-(\d+)$/)
            let count = 0; // Initialize the yes count to an integer
            if (matchYes) {
                try {
                    logger.log(`Level name: ${matchLevelName[1]}`)
                    logger.log(`Yes votes: ${matchYes[1]}`)
                    logger.log(`No votes: ${matchNo[1]}`)

                    count = parseInt(matchYes[1]); // Parse the regex output and add 1 vote to it
                    count += 1;

                    logger.log(`New yes votes: ${count}`)

                    await interaction.editReply({ content: "Updating thread name...", ephemeral: true });

                    Logger.log("updating...")
                    // update the thread name
                    await interaction.channel.setName(`${matchLevelName[1]} ${count}-${matchNo[1]}`); // Set the channel name to the same thing but with the added yes
                } catch (e) {
                    logger.error(`Error: ${e}`);
                    return await interaction.editReply(`Something went wrong: ${e}`);
                }
            } else {
                return await interaction.editReply('This thread name is not formatted correctly! (Level name #-#)');
            }

            return await interaction.editReply({ content: "Updated thread name!", ephemeral: true });

        } else if (interaction.options.getSubcommand() === 'no') {


            // if the current channel is not a thread
            if (!interaction.channel.isThread()) {
                return await interaction.editReply('You must be in a thread to use this command');
            }

            // get the thread name
            const text = interaction.channel.name;
            const matchLevelName = text.match(/^(.*)\s\d+-\d+$/);
            const matchYes = text.match(/(\d+)-\d+$/);
            const matchNo = text.match(/\d+-(\d+)$/)
            let count = 0; // Initialize the yes count to an integer
            if (matchNo) {
                try {
                    logger.log(`Level name: ${matchLevelName[1]}`)
                    logger.log(`Yes votes: ${matchYes[1]}`)
                    logger.log(`No votes: ${matchNo[1]}`)

                    count = parseInt(matchNo[1]); // Parse the regex output and add 1 vote to it
                    count += 1;

                    logger.log(`New no votes: ${count}`)

                    // update the thread name
                    await interaction.channel.setName(`${matchLevelName[1]} ${matchYes[1]}-${count}`); // Set the channel name to the same thing but with the added yes
                } catch (e) {
                    logger.error(`Error: ${e}`);
                    return await interaction.editReply(`Something went wrong: ${e}`);
                }
            } else {
                return await interaction.editReply('This thread name is not formatted correctly! (Level name #-#)');
            }

            return await interaction.editReply('The thread has been updated!');

        } else if (interaction.options.getSubcommand() === 'accept') {
            const guild = await interaction.client.guilds.fetch(guildId);
            const userSelect = new UserSelectMenuBuilder()
                .setCustomId('users')
                .setPlaceholder('Select multiple users.')
                .setMinValues(1)
                .setMaxValues(1);

            const row1 = new ActionRowBuilder()
                .addComponents(userSelect);

            

            const submissionsChannel = guild.channels.cache.get(`${submissionResultsID}`)

            // if the current channel is not a thread
            if (!interaction.channel.isThread()) {
                return await interaction.editReply('You must be in a thread to use this command');
            }

            // get the thread name
            const text = interaction.channel.name;
            const matchLevelName = text.match(/^(.*)\s\d+-\d+$/);
            const levelName = matchLevelName[1];

            await interaction.editReply({
                content: 'Select user to ping:',
                components: [row1],
            }).then(async (interaction) => {
                const selectedUser = await interaction.guild.members.cache.get(interaction.values[0]);
                logger.log(selectedUser)
                const channel = guild.channels.cache.get(`${submissionResultsID}`)
                await channel.send({ content: `\n\n${levelName} has been accepted!` })
                await interaction.deleteReply();
                await interaction.channel.send({ content: `<@${selectedUser.id}>` })
                return;
            })
        }
    },
};