const { SlashCommandBuilder } = require("discord.js");
const { guildId, reliableThreadID } = require("../../config.json");
const logger = require("log4js").getLogger();

module.exports = {
    enabled: true,
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
                        .setName("percent")
                        .setDescription(
                            "The minimum percent players need to get a record on this level (list percent)"
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
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("dm")
                .setDescription("Toggle DMs when someone votes for your level")
                .addIntegerOption((option) =>
                    option
                        .setName("status")
                        .setDescription("Whether to enable or disable DMs")
                        .addChoices(
                            { name: "Enable", value: 1 },
                            { name: "Disable", value: 0 }
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("status")
                .setDescription("Check the status of a level you submitted")
                .addStringOption((option) =>
                    option
                        .setName("levelname")
                        .setDescription("The name of the level you want to check")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )
    ,
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused(true);
        const { db } = require("../../index.js");
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "status") {
            const levels = await db.levelsInVoting.findAll({ where: { submitter: interaction.user.id } })
            return await interaction.respond(
                levels
                    .filter((lvl) =>
                        lvl.levelname
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    )
                    .slice(0, 25)
                    .map((lvl) => ({ name: lvl.levelname, value: `${lvl.discordid}` }))
            );
        }
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "submit") {
            const { db } = require("../../index.js");


            const levelname = interaction.options.getString("levelname");
            const verifier = interaction.options.getString("verifier");
            const verification = interaction.options.getString("verification");
            const creators = interaction.options.getString("creators");
            const author = interaction.options.getString("author");
            const id = interaction.options.getInteger("id");
            const songname = interaction.options.getString("songname");
            const percent = interaction.options.getInteger("percent");
            const password = interaction.options.getString("password");
            const raw = interaction.options.getString("raw");
            const opinion = interaction.options.getString("opinion");
            const nong = interaction.options.getAttachment("nong");

            // get the submitter from the db
            let user;
            try {
                user = await db.submitters.findOne({
                    where: {
                        discordid: interaction.user.id,
                    },
                });

                if (!user) {
                    const userResult = await db.submitters.create({
                        discordid: interaction.user.id,
                        submissions: 0,
                        dmFlag: false,
                    });
                    user = userResult.dataValues;
                }
            } catch (error) {
                logger.error(error);
                return interaction.editReply(
                    ":x: An error occurred while submitting your level. Please try again later."
                );
            }

            // check if user has 3 submissions already
            if (user.submissions >= 3)
                return interaction.editReply(
                    ":x: You have reached the maximum number of submissions per month."
                );
            
            const guild = await interaction.client.guilds.fetch(guildId);

            const voteChannel = await guild.channels.cache.get(reliableThreadID);

            const message = `_Submitted by: <@${interaction.user.id}>_\n\nLevel name: ${levelname}\nVerifier: ${verifier}\nVerification: ${verification}\nCreators: ${creators}\nAuthor: ${author}\nID: \`${id}\`\nSong name: ${songname}` // man don't askl me why itr needs to be formatted like this ik its ugly bro
                + (percent ? `\nList percent: ${percent}%` : "")
                + (password ? `\nPassword: ${password}` : "")
                + (raw ? `\nRaw: ${raw}` : "")
                + (opinion ? `\nDifficulty opinion: ${opinion}` : "")
                + (nong ? `\nNONG: ${nong.url}` : "");
            const thread = await voteChannel.threads.create({
                name: `${levelname} 0-0`,
                autoArchiveDuration: 1440,
                reason: `New level submission by ${interaction.user.tag}`,
                message: message,
            });

            logger.log(`Created thread: ${thread.name}`);

            // increment user's submission count
            const submitter = await db.submitters.findOne({
                where: { discordid: interaction.user.id },
            });
            await submitter.increment("submissions");

            db.levelsInVoting.create({
                levelname: levelname,
                submitter: interaction.user.id,
                discordid: thread.id,
                yeses: 0,
                nos: 0,
            });

            return interaction.editReply(":white_check_mark: Level submitted!");
        } else if (subcommand === "dm") {
            const { db } = require("../../index.js");

            const numStatus = await interaction.options.getInteger("status");

            const status = numStatus === 1 ? true : false;

            logger.log(status);
            

            try {
                await db.submitters.update(
                    { dmFlag: status },
                    { where: { discordid: interaction.user.id } }
                );
            } catch (error) {
                logger.error(error);
                return interaction.editReply(
                    ":x: An error occurred while updating your DM settings. Please try again later."
                );
            }

            return interaction.editReply(
                `:white_check_mark: DMs have been ${status ? "enabled" : "disabled"}!`
            );
        } else if (subcommand === "status") {
            const { db } = require("../../index.js");
            const level = await interaction.options.getString("levelname");

            let submission;
            try {
                submission = await db.levelsInVoting.findOne({
                    where: {
                        discordid: level,
                        submitter: interaction.user.id,
                    },
                });
            } catch (error) {
                logger.error(error);
                return interaction.editReply(
                    ":x: An error occurred while fetching the status of your level. Please try again later."
                );
            }

            if (!submission)
                return interaction.editReply(
                    ":x: You have not submitted a level with that name."
                );
            
            return interaction.editReply(
                `The vote for ${submission.levelname} is currently ${submission.yeses}-${submission.nos}.`
            );
        }
    },
};