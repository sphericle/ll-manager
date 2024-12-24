const logger = require("log4js").getLogger();
module.exports = {
    customId: "deleteThread",
    ephemeral: true,
    async execute(interaction) {
        try {
            await interaction.channel.delete();
        } catch (error) {
            logger.info(error);
            return await interaction.editReply(":x: Something went wrong");
        }
    },
};
