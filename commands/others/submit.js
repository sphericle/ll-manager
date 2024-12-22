const { SlashCommandBuilder } = require("discord.js");
const { guildId, reliableThreadID } = require("../../config.json");
const logger = require("log4js").getLogger();

module.exports = {
    enabled: false,
    data: new SlashCommandBuilder()
        .setName("vote")
        .setDescription("Bot ping measurements")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("submit")
                .setDescription("Submit a level to be voted on")
                .addStringOption((option) =>
                    option
                        .setName("levelname")
                        .setDescription("The name of the level to submit")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("verifier")
                        .setDescription("The name of the verifier")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("verification")
                        .setDescription(
                            "The link to the level's verification video"
                        )
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("creators")
                        .setDescription(
                            "The list of the creators of the level, each separated by a comma"
                        )
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("author")
                        .setDescription(
                            "The name of the person who uploaded the level on GD"
                        )
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("id")
                        .setDescription(
                            "The level's ID in Geometry Dash"
                        )
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("songname")
                        .setDescription(
                            "The name of this level's song. Required if there is a NONG."
                        )
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("difficulty")
                        .addChoices(
                            { name: "Beginner", value: 0 },
                            { name: "Easy", value: 1 },
                            { name: "Medium", value: 2 },
                            { name: "Hard", value: 3 },
                            { name: "Insane", value: 4 },
                            { name: "Mythical", value: 5 },
                            { name: "Extreme", value: 6 },
                            { name: "Supreme", value: 7 },
                            { name: "Ethereal", value: 8 },
                            { name: "Lengendary", value: 9 },
                            { name: "Silent", value: 10 },
                            { name: "Impossible", value: 11 }
                        )
                        .setDescription(
                            "The level's difficulty on the site (1-10, see the list website for details)"
                        )
                )
                .addIntegerOption((option) =>
                    option
                        .setName("percent")
                        .setDescription(
                            "The minimum percent players need to get a record on this level (list percent)"
                        )
                )
                .addStringOption((option) =>
                    option
                        .setName("songlink")
                        .setDescription(
                            "The NONG link for this level, if any. To get the link, you can upload the file in a discord message."
                        )
                )
                .addStringOption((option) =>
                    option
                        .setName("password")
                        .setDescription("The GD password of the level to place")
                )
                .addStringOption((option) =>
                    option
                        .setName("raw")
                        .setDescription(
                            "The verifier's raw footage (if the level is extreme+)"
                        )
                )
                .addStringOption((option) =>
                    option
                        .setName("opinion")
                        .setDescription(
                            "Where do you think this level should be placed?"
                        )
                )
                .addAttachmentOption((option) =>
                    option
                        .setName("nong")
                        .setDescription(
                            "The NONG song for this level. You can use cobalt.tools to download the file from youtube if needed."
                        )
                )
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "submit") {
            const levelname = interaction.options.getString("levelname");
            const verifier = interaction.options.getString("verifier");
            const verification = interaction.options.getString("verification");
            const creators = interaction.options.getString("creators");
            const author = interaction.options.getString("author");
            const id = interaction.options.getInteger("id");
            const songname = interaction.options.getString("songname");
            const difficulty = interaction.options.getInteger("difficulty");
            const percent = interaction.options.getInteger("percent");
            const songlink = interaction.options.getString("songlink");
            const password = interaction.options.getString("password");
            const raw = interaction.options.getString("raw");
            const opinion = interaction.options.getString("opinion");
            const nong = interaction.options.getAttachment("nong");

            const guild = await interaction.client.guilds.fetch(guildId);

            const voteChannel = await guild.channels.cache.get(reliableThreadID);

            const message = `_Submitted by: <@${interaction.user.id}>_\n\nLevel name: ${levelname}\nVerifier: ${verifier}\nVerification: ${verification}\nCreators: ${creators}\nAuthor: ${author}\nID: ${id}\nSong name: ${songname}\List %: ${percent}\nSong link: ${songlink}\nPassword: ${password}\nRaw: ${raw}\Difficulty opinion: ${opinion}\nNONG: ${nong}`
            const thread = await voteChannel.threads.create({
                name: `${levelname} 0-0`,
                autoArchiveDuration: 5760, // 4 says
                reason: `New level submission by ${interaction.user.tag}`,
                message: message
            });

            logger.log(`Created thread: ${thread.name}`);
        }
        
    },
};
