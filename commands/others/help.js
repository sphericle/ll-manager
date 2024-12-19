const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const commands = require("../../commands.json")

module.exports = {
    enabled: true,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all commands in the bot')
        .addIntegerOption(option =>
            option.setName('type')
                .setDescription('Specify specific command category')
                .setAutocomplete(true)
                .setRequired(true)),
    async autocomplete(interaction) {
        await interaction.respond(
            commands.map(command => ({ name: command.name, value: command.id })),
        );
    },
    async execute(interaction) {
        await interaction.deferReply()
        const type = (await interaction.options.getInteger("type")) || 1
        
        // get the command from the commands array by the id entered in the /help
        const command = commands.find(cmd => cmd.id === type)

        if (command === undefined) return await interaction.editReply({ content: ":x: Could not find the command! Be sure to pick an option.", ephemeral: true })

        const iconURL = "https://cdn.discordapp.com/icons/855211848362098699/e4cccd8155996534f28a7db33d2eeaab.png"

        let exampleEmbed;

        exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Commands under /${command.discname}`)
            .setAuthor({ name: 'Commands' })
            .setDescription(command.description)
            .setThumbnail(iconURL)
            .setTimestamp()
            .setFooter({ text: 'All command options are explained while running the command.', iconURL: iconURL });
        
        for (const subcommand of command.subcommands) {
            exampleEmbed.addFields({ name: `/${command.discname} ${subcommand.name}`, value: subcommand.description });
        }

        return await interaction.editReply({ embeds: [exampleEmbed] });
    },
};