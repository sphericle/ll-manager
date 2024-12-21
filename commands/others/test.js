const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    cooldown: 5,
    enabled: false,
    data: new SlashCommandBuilder().setName("test").setDescription("Test"),
    async execute(interaction) {
        const shiftsreminder = require("../../scheduled/shifts");
        shiftsreminder.execute();
        await interaction.reply({
            content: ":white_check_mark:",
            ephemeral: true,
        });
    },
};
