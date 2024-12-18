const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const Sequelize = require('sequelize');
const isUrlHttp = require('is-url-http');
const { archiveRecordsID, acceptedRecordsID, recordsID, pendingRecordsID, priorityRoleID, priorityRecordsID, submissionLockRoleID, enableSeparateStaffServer, enablePriorityRole, staffGuildId, guildId, githubOwner, githubRepo, githubDataPath, githubBranch } = require('../../config.json');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const logger = require('log4js').getLogger();
const { octokit } = require('../../index.js');
const { createUser } = require('./records.js');

module.exports = {
	enabled: true,
	data: new SlashCommandBuilder()
		.setName('recordmod')
		.setDescription('Staff record moderator commands')
		.setDMPermission(true)
		.addSubcommand(subcommand =>
			subcommand
				.setName('stats')
				.setDescription('Shows how many records you\'ve checked'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a record directly to the site without submitting it')
				.addStringOption(option =>
					option.setName('username')
						.setDescription('The username you\'re submitting for (Be sure to select one of the available options.)')
						.setMaxLength(1024)
						.setAutocomplete(true)
						.setRequired(true))
				.addStringOption(option =>
					option.setName('levelname')
						.setDescription('Name of the level you\'re submitting for (Be sure to select one of the available options.)')
						.setMaxLength(1024)
						.setRequired(true)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('device')
						.setDescription('Device the level was completed on')
						.setRequired(true)
						.addChoices(
							{ name: 'PC', value: 'PC' },
							{ name: 'Mobile', value: 'Mobile' },
						))
				.addStringOption(option =>
					option.setName('completionlink')
						.setDescription('Link to the completion')
						.setMaxLength(1024)
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('fps')
						.setDescription('The FPS you used to complete the level')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('percent')
						.setDescription('The percent you got on the level')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('enjoyment')
						.setDescription('Your enjoyment rating on this level (1-10)'))
				.addStringOption(option =>
					option.setName('raw')
						.setDescription('Link to your raw footage (Optional, required for top 400 levels)')
						.setMaxLength(1024))
				.addIntegerOption(option =>
					option.setName('ldm')
						.setDescription('ID for the external LDM you used (Optional)'))
				.addStringOption(option =>
					option.setName('additionalnotes')
						.setDescription('Any other info you\'d like to share with us (Optional)')
						.setMaxLength(1024)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('addlast')
				.setDescription('Adds the last accepted record to a different level')
				.addStringOption(option =>
					option.setName('levelname')
						.setDescription('Name of the level you\'re submitting for (Be sure to select one of the available options.)')
						.setMaxLength(1024)
						.setRequired(true)
						.setAutocomplete(true))
				.addIntegerOption(option =>
					option.setName('enjoyment')
						.setDescription('The enjoyment rating on this level (1-10)'))
				.addIntegerOption(option =>
					option.setName('fps')
						.setDescription('The FPS used to complete the level'))
				.addIntegerOption(option =>
					option.setName('percent')
						.setDescription('The percent you got on the level'))
				.addStringOption(option =>
					option.setName('completionlink')
						.setDescription('Link to the completion')
						.setMaxLength(1024))
				.addStringOption(option =>
					option.setName('raw')
						.setDescription('Link to your raw footage (Optional, required for extremes and above)')
						.setMaxLength(1024))
				.addStringOption(option =>
					option.setName('additionalnotes')
						.setDescription('Any other info you\'d like to share with us (Optional)')
						.setMaxLength(1024))
				.addStringOption(option =>
					option.setName('modmenu')
						.setDescription('Name of the mod menu you used, if any (Megahack, Eclipse, GDH, QOLMod, etc..), or None/Vanilla')
						.setMaxLength(1024)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('modleaderboard')
				.setDescription('Shows list staff records leaderboard'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('recordsinfo')
				.setDescription('Shows info on people with the most pending/accepted/denied records')
				.addStringOption(option =>
					option.setName('type')
						.setDescription('Which records you want to check')
						.setRequired(true)
						.addChoices(
							{ name: 'Pending', value: 'pending' },
							{ name: 'Accepted', value: 'accepted' },
							{ name: 'Denied', value: 'denied' },
						)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('enabledm')
				.setDescription('Enables sending the github code to you in dms whenever you accept a record')
				.addStringOption(option =>
					option.setName('status')
						.setDescription('Enable or disable this setting')
						.setRequired(true)
						.addChoices(
							{ name: 'Enabled', value: 'enabled' },
							{ name: 'Disabled', value: 'disabled' },
					)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('Delete a record')
				.addStringOption(option =>
					option.setName('levelname')
						.setDescription('The level this record is on')
						.setRequired(true)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('username')
						.setDescription('The username of the person who submitted this record')
						.setRequired(true)
						.setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('edit')
				.setDescription('Edit a record')
				.addStringOption(option =>
					option.setName('levelname')
						.setDescription('The level this record is on')
						.setRequired(true)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('username')
						.setDescription('The username of the person who submitted this record')
						.setRequired(true)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('newuser')
						.setDescription('The username you\'re submitting for (Be sure to select one of the available options.)')
						.setMaxLength(1024)
						.setAutocomplete(true))
				.addStringOption(option =>
					option.setName('device')
						.setDescription('Device the level was completed on')
						.addChoices(
							{ name: 'PC', value: 'PC' },
							{ name: 'Mobile', value: 'Mobile' },
						))
				.addStringOption(option =>
					option.setName('completionlink')
						.setDescription('Link to the completion')
						.setMaxLength(1024))
				.addIntegerOption(option =>
					option.setName('fps')
						.setDescription('The FPS you used to complete the level'))
				.addIntegerOption(option =>
					option.setName('percent')
						.setDescription('The percent you got on the level'))
				.addIntegerOption(option =>
					option.setName('enjoyment')
						.setDescription('Your enjoyment rating on this level (1-10)'))
				.addStringOption(option =>
					option.setName('raw')
						.setDescription('Link to your raw footage (Optional, required for top 400 levels)')
						.setMaxLength(1024))
				.addIntegerOption(option =>
					option.setName('ldm')
						.setDescription('ID for the external LDM you used (Optional)'))
				.addStringOption(option =>
					option.setName('additionalnotes')
						.setDescription('Any other info you\'d like to share with us (Optional)')
						.setMaxLength(1024))),
	async autocomplete(interaction) {
		const focused = interaction.options.getFocused(true);

		const { cache } = require('../../index.js');
		const Sequelize = require('sequelize');

		if (focused.name === 'levelname') {
			let levels = await cache.levels.findAll({
				where: {
					name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + focused.value.toLowerCase() + '%')
				}
			});

			await interaction.respond(
				levels.slice(0, 25).map(level => ({ name: level.name, value: level.name })),
			);
		} else if (focused.name === 'username' || focused.name === 'newuser') {
			let users = await cache.users.findAll({
				where: {
					name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + focused.value.toLowerCase() + '%')
				}
			});
			await interaction.respond(
				users.slice(0, 25).map(user => ({ name: user.name, value: user.name })),
			);
		}
	},
	async execute(interaction) {

		const { db } = require('../../index.js');
		if (interaction.options.getSubcommand() === 'add') {
			await interaction.deferReply({ ephemeral: true });

			// add record to list

			// Check given level name
			const { cache } = require('../../index.js');

			// Check list banned
			await interaction.editReply("Checking if the user is list banned...")
			if (interaction.member.roles.cache.has(submissionLockRoleID)) {
				await interaction.editReply(':x: Couldn\'t add the record: You have been banned from submitting records');
				return;
			}

			// Check record submission status
			const dbStatus = await db.infos.findOne({ where: { name: 'records' } });
			if (!dbStatus) return await interaction.editReply(':x: Something wrong happened while executing the command; please try again later');

			if (dbStatus.status) return await interaction.editReply(':x: Couldn\'t add the record: Submissions are closed at the moment');

			// Check given URL
			await interaction.editReply("Checking if the URL is valid...")
			const linkStr = interaction.options.getString('completionlink');
			if (/\s/g.test(linkStr) || !isUrlHttp(linkStr)) return await interaction.editReply(':x: Couldn\'t add the record: The provided completion link is not a valid URL');
			const rawStr = interaction.options.getString('raw');
			if (rawStr && (/\s/g.test(rawStr) || !isUrlHttp(rawStr))) return await interaction.editReply(':x: Couldn\'t add the record: The provided raw footage link is not a valid URL');

			

			// Check enjoyment bounds (1-10)
			await interaction.editReply("Checking if the enjoyment is valid...")
			const enjoyment = interaction.options.getInteger('enjoyment');
			if (enjoyment && (enjoyment < 1 || enjoyment > 10)) return await interaction.editReply(':x: Couldn\'t add the record: Enjoyment rating must be between 1 and 10');

			// Check percent bounds (0-100)
			await interaction.editReply("Checking if the percent is valid...")
			const percent = interaction.options.getInteger('percent');
			if (percent < 0 || percent > 100) return await interaction.editReply(':x: Couldn\'t add the record: Percent must be valid (1-100)');

			// Accepting a record //

			const level = await cache.levels.findOne({ where: { name: [interaction.options.getString('levelname')] } });


			await interaction.editReply(`Matched level ${level.filename}`);
			let record;
			try {
				const recordEntry = await db.acceptedRecords.create({
					username: interaction.options.getString('username'),
					submitter: interaction.user.id,
					levelname: level.name,
					device: interaction.options.getString('device'),
					fps: interaction.options.getInteger('fps'),
					enjoyment: interaction.options.getInteger('enjoyment'),
					percent: interaction.options.getInteger('percent'),
					completionlink: linkStr,
					raw: rawStr,
					ldm: interaction.options.getInteger('ldm'),
					modMenu: "none",
					additionalnotes: interaction.options.getString('additionalnotes'),
					priority: enablePriorityRole && interaction.member.roles.cache.has(priorityRoleID),
					moderator: interaction.user.id,
				});
				record = recordEntry.dataValues;
			} catch (error) {
				logger.error(`Error adding the record to the accepted table: ${error}`);
			}

			const shiftsLock = await db.infos.findOne({ where: { name: 'shifts' } });
			if (!shiftsLock || shiftsLock.status) return await interaction.editReply(':x: The bot is currently assigning shifts, please wait a few minutes before checking records.');
			

			// Get cached user
			const user = await cache.users.findOne({ where: { name: record.username } });
			if (!user) {
				await createUser(interaction, [record.username]);
			}

			await interaction.editReply(`Matched user ${user.name}`);
			// Create embed to send with github code
			const githubCode = `{\n\t\t"user": "${user.name}",\n\t\t"link": "${record.completionlink}",\n\t\t"percent": ${record.percent},\n\t\t"hz": ${record.fps}` + (record.enjoyment !== null ? `,\n\t\t"enjoyment": ${record.enjoyment}` : '') + (record.device == 'Mobile' ? ',\n\t\t"mobile": true\n}\n' : '\n}');

			const acceptEmbed = new EmbedBuilder()
				.setColor(0x8fce00)
				.setTitle(`:white_check_mark: ${record.levelname}`)
				.addFields(
					{ name: 'Record accepted by', value: `${interaction.user}`, inline: true },
					{ name: 'Record holder', value: `${record.username}`, inline: true },
					{ name: 'Github code', value: `\`\`\`json\n${githubCode}\n\`\`\`` },
				)
				.setTimestamp();

			// Create button to remove the message
			const remove = new ButtonBuilder()
				.setCustomId('removeMsg')
				.setLabel('Delete message')
				.setStyle(ButtonStyle.Danger);

			const row = new ActionRowBuilder()
				.addComponents(remove);

			// Create embed to send in archive with all record info
			const archiveEmbed = new EmbedBuilder()
				.setColor(0x8fce00)
				.setTitle(`:white_check_mark: ${record.levelname}`)
				.addFields(
					{ name: 'Record submitted by', value: `<@${record.submitter}>`, inline: true },
					{ name: 'Record holder', value: `${record.username}`, inline: true },
					{ name: 'Record accepted by', value: `${interaction.user}` },
					{ name: 'Device', value: `${record.device}`, inline: true },
					{ name: 'LDM', value: `${(record.ldm == 0 ? 'None' : record.ldm)}`, inline: true },
					{ name: 'Completion link', value: `${record.completionlink}` },
					{ name: 'Raw link', value: `${(record.raw == '' ? 'None' : record.raw)}` },
					{ name: 'Mod menu', value: `${record.modMenu}` },
					{ name: 'Additional Info', value: `${(record.additionalnotes == '' ? 'None' : record.additionalnotes)}` },
				)
				.setTimestamp();

			// Create embed to send in public channel
			const publicEmbed = new EmbedBuilder()
				.setColor(0x8fce00)
				.setTitle(`:white_check_mark:  ${record.levelname} `)
				.setDescription('Accepted\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800')
				.addFields(
					{ name: 'Record holder', value: `${record.username}`, inline: true },
					{ name: 'Device', value: `${record.device}`, inline: true },
				);

			logger.info(`${interaction.user.tag} (${interaction.user.id}) accepted record of ${record.levelname} for ${record.username} submitted by ${record.submitter}`);

			await interaction.editReply("Adding record...");
		
			const filename = level.filename;
			let fileResponse;
			try {
				fileResponse = await octokit.rest.repos.getContent({
					owner: githubOwner,
					repo: githubRepo,
					path: githubDataPath + `/${filename}.json`,
					branch: githubBranch,
				});
			} catch (fetchError) {
				logger.info(`Couldn't fetch ${filename}.json: \n${fetchError}`);
				return await interaction.editReply(`:x: Couldn't fetch ${filename}.json: \n${fetchError}`);
			}

			let parsedData;
			try {
				parsedData = JSON.parse(Buffer.from(fileResponse.data.content, 'base64').toString('utf-8'));
			} catch (parseError) {
				logger.info(`Unable to parse data fetched from ${filename}:\n${parseError}`);
				return await interaction.editReply(`:x: Unable to parse data fetched from ${filename}:\n${parseError}`);
			}
			if (!Array.isArray(parsedData.records)) {
				logger.info(`The records field of the fetched ${filename}.json is not an array`);
				return await interaction.editReply(`:x: The records field of the fetched ${filename}.json is not an array`);
			}

			const newRecord = JSON.parse(githubCode)

			// {fileRecord} is the record we're looping through, and
			// {record} is the current record we're trying to commit

			let existing = false;
			let updated = false;
			// If duplicate, don't add it to githubCodes
			for (const fileRecord of parsedData.records) {
				if (fileRecord.user === record.username) {
					logger.info(`Found existing record of ${filename} for ${record.username}`);
					if (fileRecord.percent < record.percent) {
						logger.info('This record has a greater percent on this level, updating...')
						fileRecord.percent = record.percent;
						fileRecord.enjoyment = record.enjoyment;
						fileRecord.link = record.completionlink;
						updated = true;
					} else {
						logger.info(`Canceled adding duplicated record of ${filename} for ${record.username}`);
						await db.acceptedRecords.destroy({ where: { id: record.dataValues['id'] } });
						existing = true;
					}
				}
			}

			// if the record does not already exist or existed but has been updated
			if (existing === false || updated === true) {
				
				await interaction.editReply("Committing...");
				// Add new record to the level's file if this is a new record (not an updated one)
				if (updated === false) parsedData.records = parsedData.records.concat(newRecord)

				// not sure why it needs to be done this way but :shrug:
				let changes = [];
				changes.push({
					path: githubDataPath + `/${filename}.json`,
					content: JSON.stringify(parsedData, null, '\t'),
				})

				const changePath = githubDataPath + `/${filename}.json`
				const content = JSON.stringify(parsedData);

				const debugStatus = await db.infos.findOne({ where: { name: 'commitdebug' } });
				if (!debugStatus || !debugStatus.status) {
					let commitSha;
					try {
						// Get the SHA of the latest commit from the branch
						const { data: refData } = await octokit.git.getRef({
							owner: githubOwner,
							repo: githubRepo,
							ref: `heads/${githubBranch}`,
						});
						commitSha = refData.object.sha;
					} catch (getRefError) {
						logger.info(`Something went wrong while fetching the latest commit SHA:\n${getRefError}`);
						await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
						return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (getRefError)');
					}
					let treeSha;
					try {
						// Get the commit using its SHA
						const { data: commitData } = await octokit.git.getCommit({
							owner: githubOwner,
							repo: githubRepo,
							commit_sha: commitSha,
						});
						treeSha = commitData.tree.sha;
					} catch (getCommitError) {
						logger.info(`Something went wrong while fetching the latest commit:\n${getCommitError}`);
						await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
						return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (getCommitError)');
					}

					let newTree;
					try {
						// Create a new tree with the changes
						newTree = await octokit.git.createTree({
							owner: githubOwner,
							repo: githubRepo,
							base_tree: treeSha,
							tree: changes.map(change => ({
								path: change.path,
								mode: '100644',
								type: 'blob',
								content: change.content,
							})),
						});
					} catch (createTreeError) {
						logger.info(`Something went wrong while creating a new tree:\n${createTreeError}`);
						await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
						return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (createTreeError)');
					}

					let newCommit;
					try {
						// Create a new commit with this tree
						newCommit = await octokit.git.createCommit({
							owner: githubOwner,
							repo: githubRepo,
							message: `Added ${record.username}'s record to ${record.levelname} (${interaction.user.tag})`,
							tree: newTree.data.sha,
							parents: [commitSha],
						});
					} catch (createCommitError) {
						logger.info(`Something went wrong while creating a new commit:\n${createCommitError}`);
						await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
						return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (createCommitError)');
					}

					try {
						// Update the branch to point to the new commit
						await octokit.git.updateRef({
							owner: githubOwner,
							repo: githubRepo,
							ref: `heads/${githubBranch}`,
							sha: newCommit.data.sha,
						});
					} catch (updateRefError) {
						logger.info(`Something went wrong while updating the branch :\n${updateRefError}`);
						await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
						return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (updateRefError)');
					}
					logger.info(`Successfully created commit on ${githubBranch} (record addition): ${newCommit.data.sha}`);
					await interaction.editReply("This record has been added!");
				} else {
					let updatedFiles = 0;
					let i = 1;
					// Get file SHA
					let fileSha;
					try {
						const response = await octokit.repos.getContent({
							owner: githubOwner,
							repo: githubRepo,
							path: changePath,
						});
						fileSha = response.data.sha;
					} catch (error) {
						logger.info(`Error fetching ${changePath} SHA:\n${error}`);
						erroredRecords.push(`All from ${changePath}`);
						return await interaction.editReply(`:x: Couldn't fetch data from ${changePath}`);
						i++;

					}

					try {
						await octokit.repos.createOrUpdateFileContents({
							owner: githubOwner,
							repo: githubRepo,
							path: changePath,
							message: `Updated ${changePath} (${interaction.user.tag})`,
							content: Buffer.from(content).toString('base64'),
							sha: fileSha,
						});
						logger.info(`Updated ${changePath} (${interaction.user.tag}`);
					} catch (error) {
						logger.info(`Failed to update ${changePath} (${interaction.user.tag}):\n${error}`);
						erroredRecords.push(`All from ${changePath}`);
						await interaction.editReply(`:x: Couldn't update the file ${changePath}, skipping...`);
					}
					updatedFiles++;
					i++;

					let detailedErrors = '';
					for (const err of erroredRecords) detailedErrors += `\n${err}`;

					const replyEmbed = new EmbedBuilder()
						.setColor(0x8fce00)
						.setTitle(':white_check_mark: Commit successful')
						.setDescription(`Successfully updated ${updatedFiles}/ files`)
						.addFields(
							{ name: 'Duplicates found:', value: `**${duplicateRecords}**`, inline: true },
							{ name: 'Errors:', value: `${erroredRecords.length}`, inline: true },
							{ name: 'Detailed Errors:', value: (detailedErrors.length == 0 ? 'None' : detailedErrors) },
						)
						.setTimestamp();
					await interaction.message.delete();
					await interaction.editReply(':white_check_mark: The record has been accepted');
				}

				// Send all messages simultaneously
				const guild = await interaction.client.guilds.fetch(guildId);
				const staffGuild = (enableSeparateStaffServer ? await interaction.client.guilds.fetch(staffGuildId) : guild);

				staffGuild.channels.cache.get(acceptedRecordsID).send({ content: '', embeds: [acceptEmbed], components: [row] });
				staffGuild.channels.cache.get(archiveRecordsID).send({ embeds: [archiveEmbed] });

				// Check if we need to send in dms as well
				const settings = await db.staffSettings.findOne({ where: { moderator: interaction.user.id } });
				if (!settings) {
					await db.staffSettings.create({
						moderator: interaction.user.id,
						sendAcceptedInDM: false,
					});
				} else if (settings.sendAcceptedInDM) {
					try {
						const rawGithubCode = JSON.stringify({
							user: record.username,
							link: record.completionlink,
							percent: 100,
							hz: 360,
							...(record.device === 'Mobile' && { mobile: true }),
						}, null, '\t');

						const dmMessage = `Accepted record of ${record.levelname} for ${record.username}\nGithub Code:`;
						const dmMessage2 = `${rawGithubCode}`;
						await interaction.user.send({ content: dmMessage });
						await interaction.user.send({ content: dmMessage2 });
					} catch (_) {
						logger.info(`Failed to send in moderator ${interaction.user.id} dms, ignoring send in dms setting`);
					}
				}

				// Update moderator data (create new entry if that moderator hasn't accepted/denied records before)
				const modInfo = await db.staffStats.findOne({ where: { moderator: interaction.user.id } });
				if (!modInfo) {
					await db.staffStats.create({
						moderator: interaction.user.id,
						nbRecords: 1,
						nbDenied: 0,
						nbAccepted: 1,
					});
				} else {
					await modInfo.increment('nbRecords');
					await modInfo.increment('nbAccepted');
				}

				if (!(await db.dailyStats.findOne({ where: { date: Date.now() } }))) db.dailyStats.create({ date: Date.now(), nbRecordsAccepted: 1, nbRecordsPending: await db.pendingRecords.count() });
				else await db.dailyStats.update({ nbRecordsAccepted: (await db.dailyStats.findOne({ where: { date: Date.now() } })).nbRecordsAccepted + 1 }, { where: { date: Date.now() } });
			} else {
				return await interaction.editReply(`:x: This user already has a record on this level!`);
			}

			logger.info(`${interaction.user.tag} (${interaction.user.id}) submitted ${interaction.options.getString('levelname')} for ${interaction.options.getString('username')}`);
			// Reply
			await interaction.editReply((enablePriorityRole && interaction.member.roles.cache.has(priorityRoleID) ? `:white_check_mark: The priority record for ${interaction.options.getString('levelname')} has been submitted successfully` : `:white_check_mark: The record for ${interaction.options.getString('levelname')} has been added successfully`));

		} else if (interaction.options.getSubcommand() === 'addlast') {
			
			await interaction.deferReply({ ephemeral: true });

			// get last row from accepted records db

			await interaction.editReply("Getting last record...")
			const lastRow = await db.acceptedRecords.findOne({ order: [['createdAt', 'DESC']] });

			if (!lastRow) {
				return await interaction.editReply(':x: There are no records to add');
			}

			const oldRecord = lastRow.dataValues;

			let newLevel = interaction.options.getString('levelname');
			let newPercent = interaction.options.getInteger('percent') || oldRecord.percent;
			let newEnjoyment = interaction.options.getInteger('enjoyment') || oldRecord.enjoyment;
			let newFPS = interaction.options.getString('fps') || oldRecord.fps;
			let newDevice = interaction.options.getString('device') || oldRecord.device;
			let newRaw = interaction.options.getString('raw') || oldRecord.raw;
			let newNotes = interaction.options.getString('notes') || oldRecord.notes;
			let newModMenu = interaction.options.getString('modmenu') || oldRecord.modmenu;

			const setNoneToNull = (val) => (typeof val === 'string' && val.toLowerCase() === 'none' ? null : val);

			newRaw = setNoneToNull(newRaw);
			newNotes = setNoneToNull(newNotes);
			newModMenu = setNoneToNull(newModMenu);

			logger.log(newEnjoyment)

			newPercent = (newPercent === -1 ? null : newPercent);
			newFPS = (newFPS === -1 ? null : newFPS);
			newEnjoyment = (newEnjoyment === -1 ? null : newEnjoyment);


			if (interaction.options.getString('notes')) {
				if (interaction.options.getString('notes').toLowerCase() === 'none') {
					newNotes = null;
				}
				newNotes = interaction.options.getString('notes');
			}
			if (newLevel === oldRecord.levelname) {
				return await interaction.editReply(':x: Choose a different level! That\'s the point of the command lmao????');
			}

			
			const recordEntry = await db.acceptedRecords.create({
				username: oldRecord.username,
				submitter: interaction.user.id, // always equal to moderator
				levelname: newLevel,
				device: newDevice,
				completionlink: oldRecord.completionlink,
				enjoyment: newEnjoyment,
				fps: newFPS,
				percent: newPercent,
				raw: newRaw,
				ldm: oldRecord.ldm, // always 0
				additionalnotes: newNotes,
				priority: oldRecord.priority, // always false
				modMenu: newModMenu,
				moderator: interaction.user.id, // always equal to submitter
			});

			const record = recordEntry.dataValues;

			// add record to list
			await interaction.editReply(`Adding record...`);
			const { cache } = require('../../index.js');

			// Check list banned
			await interaction.editReply("Checking if the user is list banned...")
			if (interaction.member.roles.cache.has(submissionLockRoleID)) {
				await interaction.editReply(':x: Couldn\'t add the record: You have been banned from submitting records');
				return;
			}

			// Check record submission status
			const dbStatus = await db.infos.findOne({ where: { name: 'records' } });
			if (!dbStatus) return await interaction.editReply(':x: Something wrong happened while executing the command; please try again later');

			if (dbStatus.status) return await interaction.editReply(':x: Couldn\'t add the record: Submissions are closed at the moment');

			// Check given URL
			await interaction.editReply("Checking if the URL is valid...")
			const linkStr = oldRecord.completionlink;
			if (/\s/g.test(linkStr) || !isUrlHttp(linkStr)) return await interaction.editReply(':x: Couldn\'t add the record: The provided completion link is not a valid URL');
			const rawStr = newRaw;
			if (rawStr && (/\s/g.test(rawStr) || !isUrlHttp(rawStr))) return await interaction.editReply(':x: Couldn\'t add the record: The provided raw footage link is not a valid URL');



			// Check enjoyment bounds (1-10)
			await interaction.editReply("Checking if the enjoyment is valid...")
			const enjoyment = newEnjoyment;
			if (enjoyment && (enjoyment < 1 || enjoyment > 10)) return await interaction.editReply(':x: Couldn\'t add the record: Enjoyment rating must be between 1 and 10');

			// Check percent bounds (0-100)
			await interaction.editReply("Checking if the percent is valid...")
			const percent = newPercent;
			if (percent < 0 || percent > 100) return await interaction.editReply(':x: Couldn\'t add the record: Percent must be valid (1-100)');

			// Accepting a record //

			const level = await cache.levels.findOne({ where: { name: [newLevel] } });


			await interaction.editReply(`Matched level ${level.filename}`);

			const shiftsLock = await db.infos.findOne({ where: { name: 'shifts' } });
			if (!shiftsLock || shiftsLock.status) return await interaction.editReply(':x: The bot is currently assigning shifts, please wait a few minutes before checking records.');


			// Get cached user
			const user = await cache.users.findOne({ where: { name: record.username } });
			if (!user) return await interaction.editReply(':x: Couldn\'t find the user this record was submitted for (their name might have changed since they submitted it)');

			await interaction.editReply(`Matched user ${user.name}`);
			// Create embed to send with github code
			const githubCode = `{\n\t\t"user": "${user.name}",\n\t\t"link": "${record.completionlink}",\n\t\t"percent": ${record.percent},\n\t\t"hz": ${record.fps}` + (record.enjoyment !== -1 || null ? `,\n\t\t"enjoyment": ${record.enjoyment}` : '') + (record.device == 'Mobile' ? ',\n\t\t"mobile": true\n}\n' : '\n}');

			const acceptEmbed = new EmbedBuilder()
				.setColor(0x8fce00)
				.setTitle(`:white_check_mark: ${record.levelname}`)
				.addFields(
					{ name: 'Record accepted by', value: `${interaction.user}`, inline: true },
					{ name: 'Record holder', value: `${record.username}`, inline: true },
					{ name: 'Github code', value: `\`\`\`json\n${githubCode}\n\`\`\`` },
				)
				.setTimestamp();

			// Create button to remove the message
			const remove = new ButtonBuilder()
				.setCustomId('removeMsg')
				.setLabel('Delete message')
				.setStyle(ButtonStyle.Danger);

			const row = new ActionRowBuilder()
				.addComponents(remove);

			// Create embed to send in archive with all record info
			const archiveEmbed = new EmbedBuilder()
				.setColor(0x8fce00)
				.setTitle(`:white_check_mark: ${record.levelname}`)
				.addFields(
					{ name: 'Record submitted by', value: `<@${record.submitter}>`, inline: true },
					{ name: 'Record holder', value: `${record.username}`, inline: true },
					{ name: 'Record accepted by', value: `${interaction.user}` },
					{ name: 'Device', value: `${record.device}`, inline: true },
					{ name: 'LDM', value: `${(record.ldm == 0 ? 'None' : record.ldm)}`, inline: true },
					{ name: 'Completion link', value: `${record.completionlink}` },
					{ name: 'Raw link', value: `${(record.raw == '' ? 'None' : record.raw)}` },
					{ name: 'Mod menu', value: `${record.modMenu}` },
					{ name: 'Additional Info', value: `${(record.additionalnotes == '' ? 'None' : record.additionalnotes)}` },
				)
				.setTimestamp();

			// Create embed to send in public channel
			const publicEmbed = new EmbedBuilder()
				.setColor(0x8fce00)
				.setTitle(`:white_check_mark:  ${record.levelname} `)
				.setDescription('Accepted\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800')
				.addFields(
					{ name: 'Record holder', value: `${record.username}`, inline: true },
					{ name: 'Device', value: `${record.device}`, inline: true },
				);

			logger.info(`${interaction.user.tag} (${interaction.user.id}) accepted record of ${record.levelname} for ${record.username} submitted by ${record.submitter}`);

			await interaction.editReply("Adding record...");

			const filename = level.filename;
			let fileResponse;
			try {
				fileResponse = await octokit.rest.repos.getContent({
					owner: githubOwner,
					repo: githubRepo,
					path: githubDataPath + `/${filename}.json`,
					branch: githubBranch,
				});
			} catch (fetchError) {
				logger.info(`Couldn't fetch ${filename}.json: \n${fetchError}`);
				return await interaction.editReply(`:x: Couldn't fetch ${filename}.json: \n${fetchError}`);
			}

			let parsedData;
			try {
				parsedData = JSON.parse(Buffer.from(fileResponse.data.content, 'base64').toString('utf-8'));
			} catch (parseError) {
				logger.info(`Unable to parse data fetched from ${filename}:\n${parseError}`);
				return await interaction.editReply(`:x: Unable to parse data fetched from ${filename}:\n${parseError}`);
			}
			if (!Array.isArray(parsedData.records)) {
				logger.info(`The records field of the fetched ${filename}.json is not an array`);
				return await interaction.editReply(`:x: The records field of the fetched ${filename}.json is not an array`);
			}

			const newRecord = JSON.parse(githubCode)

			// {fileRecord} is the record we're looping through, and
			// {record} is the current record we're trying to commit

			let existing = false;
			let updated = false;
			// If duplicate, don't add it to githubCodes
			for (const fileRecord of parsedData.records) {
				if (fileRecord.user === record.username) {
					logger.info(`Found existing record of ${filename} for ${record.username}`);
					if (fileRecord.percent < record.percent) {
						logger.info('This record has a greater percent on this level, updating...')
						fileRecord.percent = record.percent;
						fileRecord.enjoyment = record.enjoyment;
						fileRecord.link = record.completionlink;
						updated = true;
					} else {
						logger.info(`Canceled adding duplicated record of ${filename} for ${record.username}`);
						await db.acceptedRecords.destroy({ where: { id: record.dataValues['id'] } });
						existing = true;
					}
				}
			}

			// DEBUG
			existing = false;
			updated = false;

			// if the record does not already exist or existed but has been updated
			if (existing === false || updated === true) {

				await interaction.editReply("Committing...");
				// Add new record to the level's file if this is a new record (not an updated one)
				if (updated === false) parsedData.records = parsedData.records.concat(newRecord)

				// not sure why it needs to be done this way but :shrug:
				let changes = [];
				changes.push({
					path: githubDataPath + `/${filename}.json`,
					content: JSON.stringify(parsedData, null, '\t'),
				})

				const changePath = githubDataPath + `/${filename}.json`
				const content = JSON.stringify(parsedData);

				const debugStatus = await db.infos.findOne({ where: { name: 'commitdebug' } });
				if (!debugStatus || !debugStatus.status) {
					let commitSha;
					try {
						// Get the SHA of the latest commit from the branch
						const { data: refData } = await octokit.git.getRef({
							owner: githubOwner,
							repo: githubRepo,
							ref: `heads/${githubBranch}`,
						});
						commitSha = refData.object.sha;
					} catch (getRefError) {
						logger.info(`Something went wrong while fetching the latest commit SHA:\n${getRefError}`);
						await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
						return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (getRefError)');
					}
					let treeSha;
					try {
						// Get the commit using its SHA
						const { data: commitData } = await octokit.git.getCommit({
							owner: githubOwner,
							repo: githubRepo,
							commit_sha: commitSha,
						});
						treeSha = commitData.tree.sha;
					} catch (getCommitError) {
						logger.info(`Something went wrong while fetching the latest commit:\n${getCommitError}`);
						await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
						return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (getCommitError)');
					}

					let newTree;
					try {
						// Create a new tree with the changes
						newTree = await octokit.git.createTree({
							owner: githubOwner,
							repo: githubRepo,
							base_tree: treeSha,
							tree: changes.map(change => ({
								path: change.path,
								mode: '100644',
								type: 'blob',
								content: change.content,
							})),
						});
					} catch (createTreeError) {
						logger.info(`Something went wrong while creating a new tree:\n${createTreeError}`);
						await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
						return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (createTreeError)');
					}

					let newCommit;
					try {
						// Create a new commit with this tree
						newCommit = await octokit.git.createCommit({
							owner: githubOwner,
							repo: githubRepo,
							message: `Added ${record.username}'s record to ${record.levelname} (${interaction.user.tag})`,
							tree: newTree.data.sha,
							parents: [commitSha],
						});
					} catch (createCommitError) {
						logger.info(`Something went wrong while creating a new commit:\n${createCommitError}`);
						await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
						return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (createCommitError)');
					}

					try {
						// Update the branch to point to the new commit
						await octokit.git.updateRef({
							owner: githubOwner,
							repo: githubRepo,
							ref: `heads/${githubBranch}`,
							sha: newCommit.data.sha,
						});
					} catch (updateRefError) {
						logger.info(`Something went wrong while updating the branch :\n${updateRefError}`);
						await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
						return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (updateRefError)');
					}
					logger.info(`Successfully created commit on ${githubBranch} (record addition): ${newCommit.data.sha}`);
					await interaction.editReply("This record has been added!");
				} else {
					let updatedFiles = 0;
					let i = 1;
					// Get file SHA
					let fileSha;
					try {
						const response = await octokit.repos.getContent({
							owner: githubOwner,
							repo: githubRepo,
							path: changePath,
						});
						fileSha = response.data.sha;
					} catch (error) {
						logger.info(`Error fetching ${changePath} SHA:\n${error}`);
						erroredRecords.push(`All from ${changePath}`);
						return await interaction.editReply(`:x: Couldn't fetch data from ${changePath}`);

					}

					try {
						await octokit.repos.createOrUpdateFileContents({
							owner: githubOwner,
							repo: githubRepo,
							path: changePath,
							message: `Updated ${changePath} (${interaction.user.tag})`,
							content: Buffer.from(content).toString('base64'),
							sha: fileSha,
						});
						logger.info(`Updated ${changePath} (${interaction.user.tag}`);
					} catch (error) {
						logger.info(`Failed to update ${changePath} (${interaction.user.tag}):\n${error}`);
						erroredRecords.push(`All from ${changePath}`);
						await interaction.editReply(`:x: Couldn't update the file ${changePath}, skipping...`);
					}
					updatedFiles++;
					i++;

					let detailedErrors = '';
					for (const err of erroredRecords) detailedErrors += `\n${err}`;

					const replyEmbed = new EmbedBuilder()
						.setColor(0x8fce00)
						.setTitle(':white_check_mark: Commit successful')
						.setDescription(`Successfully updated ${updatedFiles}/ files`)
						.addFields(
							{ name: 'Duplicates found:', value: `**${duplicateRecords}**`, inline: true },
							{ name: 'Errors:', value: `${erroredRecords.length}`, inline: true },
							{ name: 'Detailed Errors:', value: (detailedErrors.length == 0 ? 'None' : detailedErrors) },
						)
						.setTimestamp();
					await interaction.message.delete();
					await interaction.editReply(':white_check_mark: The record has been accepted');
				}

				// Send all messages simultaneously
				const guild = await interaction.client.guilds.fetch(guildId);
				const staffGuild = (enableSeparateStaffServer ? await interaction.client.guilds.fetch(staffGuildId) : guild);

				staffGuild.channels.cache.get(acceptedRecordsID).send({ content: '', embeds: [acceptEmbed], components: [row] });
				staffGuild.channels.cache.get(archiveRecordsID).send({ embeds: [archiveEmbed] });

				// Check if we need to send in dms as well
				const settings = await db.staffSettings.findOne({ where: { moderator: interaction.user.id } });
				if (!settings) {
					await db.staffSettings.create({
						moderator: interaction.user.id,
						sendAcceptedInDM: false,
					});
				} else if (settings.sendAcceptedInDM) {
					try {
						const rawGithubCode = JSON.stringify({
							user: record.username,
							link: record.completionlink,
							percent: 100,
							hz: 360,
							...(record.device === 'Mobile' && { mobile: true }),
						}, null, '\t');

						const dmMessage = `Accepted record of ${record.levelname} for ${record.username}\nGithub Code:`;
						const dmMessage2 = `${rawGithubCode}`;
						await interaction.user.send({ content: dmMessage });
						await interaction.user.send({ content: dmMessage2 });
					} catch (_) {
						logger.info(`Failed to send in moderator ${interaction.user.id} dms, ignoring send in dms setting`);
					}
				}

				// Update moderator data (create new entry if that moderator hasn't accepted/denied records before)
				const modInfo = await db.staffStats.findOne({ where: { moderator: interaction.user.id } });
				if (!modInfo) {
					await db.staffStats.create({
						moderator: interaction.user.id,
						nbRecords: 1,
						nbDenied: 0,
						nbAccepted: 1,
					});
				} else {
					await modInfo.increment('nbRecords');
					await modInfo.increment('nbAccepted');
				}

				if (!(await db.dailyStats.findOne({ where: { date: Date.now() } }))) db.dailyStats.create({ date: Date.now(), nbRecordsAccepted: 1, nbRecordsPending: await db.pendingRecords.count() });
				else await db.dailyStats.update({ nbRecordsAccepted: (await db.dailyStats.findOne({ where: { date: Date.now() } })).nbRecordsAccepted + 1 }, { where: { date: Date.now() } });
			} else {
				return await interaction.editReply(`:x: This user already has a record on this level!`);
			}

			logger.info(`${interaction.user.tag} (${interaction.user.id}) submitted ${interaction.options.getString('levelname')} for ${interaction.options.getString('username')}`);
			// Reply
			await interaction.editReply((enablePriorityRole && interaction.member.roles.cache.has(priorityRoleID) ? `:white_check_mark: The priority record for ${interaction.options.getString('levelname')} has been submitted successfully` : `:white_check_mark: The record for ${interaction.options.getString('levelname')} has been added successfully`));

			return await interaction.editReply({ content: `This command is not done yet!`, ephemeral: true });

		} else if (interaction.options.getSubcommand() === 'stats') {

			await interaction.deferReply({ ephemeral: true });
			// Shows mod stats

			const modId = interaction.user.id;

			const modInfo = await db.staffStats.findOne({ attribute: ['nbRecords', 'nbAccepted', 'nbDenied', 'updatedAt'], where: { moderator: modId } });

			if (!modInfo) {
				return await interaction.editReply(':x: You haven\'t accepted or denied any record yet');
			}

			const minDate = new Date(new Date() - (30 * 24 * 60 * 60 * 1000));
			const modAcceptedData = await db.acceptedRecords.findAll({
				attributes: [
					[Sequelize.literal('DATE("createdAt")'), 'date'],
					[Sequelize.literal('COUNT(*)'), 'count'],
				],
				group: ['date'],
				where: { moderator: modId, createdAt: { [Sequelize.Op.gte]: minDate } },
			});

			const modDeniedData = await db.deniedRecords.findAll({
				attributes: [
					[Sequelize.literal('DATE("createdAt")'), 'date'],
					[Sequelize.literal('COUNT(*)'), 'count'],
				],
				group: ['date'],
				where: { moderator: modId, createdAt: { [Sequelize.Op.gte]: minDate } },
			});

			const labels = [];
			const datasA = [];
			const datasD = [];
			const date = new Date();

			const isRightDate = function (element) {
				return !element.dataValues['date'].localeCompare(this);
			};

			for (let i = 0; i < 30; i++) {
				labels.push(date.toJSON().slice(0, 10));
				date.setDate(date.getDate() - 1);

				const acceptedIndex = modAcceptedData.findIndex(isRightDate, labels[i]);
				const deniedIndex = modDeniedData.findIndex(isRightDate, labels[i]);

				if (acceptedIndex != -1) datasA.push(modAcceptedData[acceptedIndex].dataValues['count']);
				else datasA.push(0);

				if (deniedIndex != -1) datasD.push(modDeniedData[deniedIndex].dataValues['count']);
				else datasD.push(0);

			}

			labels.reverse();
			datasA.reverse();
			datasD.reverse();

			const renderer = new ChartJSNodeCanvas({ width: 800, height: 300, backgroundColour: 'white' });
			const image = await renderer.renderToBuffer({
				// Build your graph passing option you want
				type: 'bar',
				data: {
					labels: labels,
					datasets: [
						{
							label: 'Accepted Records',
							backgroundColor: 'green',
							data: datasA,
						},
						{
							label: 'Denied Records',
							backgroundColor: 'red',
							data: datasD,
						},
					],
				},
				options: {
					responsive: true,
					plugins: {
						legend: {
							position: 'top',
						},
						title: {
							display: true,
							text: 'Moderator activity',
						},
					},
				},
			});

			const attachment = await new AttachmentBuilder(image, { name: 'modgraph.png' });
			const modInfoEmbed = new EmbedBuilder()
				.setColor(0xFFBF00)
				.setTitle('Moderator info')
				.setDescription(`<@${modId}>`)
				.addFields(
					{ name: 'Total records checked:', value: `${modInfo.nbRecords}`, inline: true },
					{ name: 'Accepted records:', value: `${modInfo.nbAccepted}`, inline: true },
					{ name: 'Denied records:', value: `${modInfo.nbDenied}`, inline: true },
					{ name: 'Last activity:', value: `${modInfo.updatedAt.toDateString()}` },
				)
				.setImage('attachment://modgraph.png');

			return await interaction.editReply({ embeds: [modInfoEmbed], files: [attachment] });


		} else if (interaction.options.getSubcommand() === 'modleaderboard') {
			const { db } = require('../../index.js');
			await interaction.deferReply({ ephemeral: true });
			// Display staff records leaderboard //

			// Get number of staff
			const nbTotal = await db.staffStats.count();
			// Get sqlite data, ordered by descending number of records, limited to top 20 for now (maybe add a page system later)
			const modInfos = await db.staffStats.findAll({ limit: 30, order: [['nbRecords', 'DESC']], attributes: ['moderator', 'nbRecords', 'nbAccepted', 'nbDenied', 'updatedAt'] });
			if (!nbTotal || !modInfos) return await interaction.editReply(':x: Something went wrong while executing the command');

			let strModData = '';
			for (let i = 0; i < modInfos.length; i++) {
				strModData += `**${i + 1}** - <@${modInfos[i].moderator}> - ${modInfos[i].nbRecords} records (${modInfos[i].nbAccepted} A, ${modInfos[i].nbDenied} D) - Last activity : ${modInfos[i].updatedAt.toDateString()}\n`;
			}

			// Embed displaying the data
			const modEmbed = new EmbedBuilder()
				.setColor(0xFFBF00)
				.setAuthor({ name: 'Moderator leaderboard' })
				.setDescription(strModData)
				.setTimestamp();

			// Send reply
			return await interaction.editReply({ embeds: [modEmbed] });


		} else if (interaction.options.getSubcommand() === 'recordsinfo') {

			await interaction.deferReply({ ephemeral: true });

			const { db } = require('../../index.js');

			// Check submissions info //
			const submissionsType = interaction.options.getString('type');

			const selectedDb = (submissionsType === 'pending' ? db.pendingRecords : (submissionsType === 'accepted' ? db.acceptedRecords : db.deniedRecords));
			let strInfo = `Total records : ${await db.pendingRecords.count()} pending, ${await db.acceptedRecords.count()} accepted, ${await db.deniedRecords.count()} denied\n\n`;
			const users = await selectedDb.findAll({
				attributes: [
					'submitter',
					[Sequelize.fn('COUNT', '*'), 'total_count'],
				],
				group: ['submitter'],
				order: [[Sequelize.literal('total_count'), 'DESC']],
				limit: 30,
			});
			for (let i = 0; i < users.length; i++) {
				const pendingCount = await db.pendingRecords.count({ where: { submitter: users[i].submitter } });
				const acceptedCount = await db.acceptedRecords.count({ where: { submitter: users[i].submitter } });
				const deniedCount = await db.deniedRecords.count({ where: { submitter: users[i].submitter } });
				const submittedCount = pendingCount + acceptedCount + deniedCount;
				strInfo += `**${i + 1}** - <@${users[i].submitter}> - ${pendingCount} pending - (${submittedCount} submitted, ${acceptedCount} accepted, ${deniedCount} denied)\n`;
			}
			if (users.length > 30) strInfo += '...';

			const infoEmbed = new EmbedBuilder()
				.setColor(0xFFBF00)
				.setTitle(`Currently ${submissionsType} records users stats`)
				.setDescription(strInfo)
				.setTimestamp();

			return await interaction.editReply({ embeds: [infoEmbed] });
		} else if (interaction.options.getSubcommand() === 'enabledm') {

			await interaction.deferReply({ ephemeral: true });

			const { db } = require('../../index.js');

			// Update sqlite db
			const update = await db.staffSettings.update({ sendAcceptedInDM: interaction.options.getString('status') === 'enabled' }, { where: { moderator: interaction.user.id } });

			if (!update) {
				const create = await db.staffSettings.create({
					moderator: interaction.user.id,
					sendAcceptedInDM: interaction.options.getString('status') === 'enabled',
				});

				if (!create) return await interaction.editReply(':x: Something went wrong while executing the command');
			}
			return await interaction.editReply(`:white_check_mark: Changed setting to ${interaction.options.getString('status')}`);

		} else if (interaction.options.getSubcommand() === 'enablereminder') {

			await interaction.deferReply({ ephemeral: true });

			const { db } = require('../../index.js');

			// Update sqlite db
			const update = await db.staffSettings.update({ shiftReminder: interaction.options.getString('status') === 'enabled' }, { where: { moderator: interaction.user.id } });

			if (!update) {
				const create = await db.staffSettings.create({
					moderator: interaction.user.id,
					shiftReminder: interaction.options.getString('status') === 'enabled',
				});

				if (!create) return await interaction.editReply(':x: Something went wrong while executing the command');
			}
			return await interaction.editReply(`:white_check_mark: Changed setting to ${interaction.options.getString('status')}`);
		} else if (interaction.options.getSubcommand() === 'commit') {

			await interaction.deferReply();
			const { db } = require('../../index.js');

			await db.recordsToCommit.update({ discordid: interaction.id }, { where: {} });

			if (await db.recordsToCommit.count({ where: { discordid: interaction.id } }) == 0) return await interaction.editReply(':x: There are no pending accepted record to be commited');
			const commitEmbed = new EmbedBuilder()
				.setColor(0x8fce00)
				.setTitle('Commiting records')
				.addFields(
					{ name: 'Number of records:', value: `${await db.recordsToCommit.count({ where: { discordid: interaction.id } })}`, inline: true },
					{ name: 'Affected files:', value: `${(await db.recordsToCommit.findAll({ where: { discordid: interaction.id }, group: 'filename' })).length}`, inline: true },
				)
				.setTimestamp();
			// Create commit buttons
			const commit = new ButtonBuilder()
				.setCustomId('commitRecords')
				.setLabel('Commit changes')
				.setStyle(ButtonStyle.Success);

			const cancel = new ButtonBuilder()
				.setCustomId('removeMsg')
				.setLabel('Cancel')
				.setStyle(ButtonStyle.Danger);

			const row = new ActionRowBuilder()
				.addComponents(commit)
				.addComponents(cancel);

			await interaction.editReply({ embeds: [commitEmbed], components: [row] });
			const sent = await interaction.fetchReply();
			await db.recordsToCommit.update({ discordid: sent.id }, { where: { discordid: interaction.id } });
		} else if (interaction.options.getSubcommand() === 'commitdebug') {
			// Changes debug status

			await interaction.deferReply({ ephemeral: true });

			const { db } = require('../../index.js');

			// Update sqlite db
			const update = await db.infos.update({ status: (interaction.options.getString('status') === 'enabled') }, { where: { name: 'commitdebug' } });
			if (!update) return await interaction.editReply(':x: Something went wrong while executing the command');
			logger.info(`Changed debug status to ${interaction.options.getString('status')}`);
			return await interaction.editReply(`:white_check_mark: Changed debug status to ${interaction.options.getString('status')}`);

		} else if (interaction.options.getSubcommand() === 'commitreset') {

			await interaction.deferReply({ ephemeral: true });

			const { db } = require('../../index.js');

			await db.recordsToCommit.destroy({ where: {} });
			if (await db.recordsToCommit.count() == 0) return await interaction.editReply(':white_check_mark: The list was successfully reset');
			else return await interaction.editReply(':x: Something went wrong while removing records');
		} else if (interaction.options.getSubcommand() === 'delete') {
			await interaction.deferReply({ ephemeral: true });
			const { cache, octokit } = require('../../index.js');
			level = await cache.levels.findOne({ where: { name: interaction.options.getString('levelname') } });
			const username = interaction.options.getString('username');

			if (!level) return await interaction.editReply(':x: Couldn\'t find the level');
			const filename = level.filename

			let fileResponse;
			try {
				fileResponse = await octokit.rest.repos.getContent({
					owner: githubOwner,
					repo: githubRepo,
					path: githubDataPath + `/${filename}.json`,
					branch: githubBranch,
				});
			} catch (fetchError) {
				logger.info(`Couldn't fetch ${filename}.json: \n${fetchError}`);
				return await interaction.editReply(`:x: Couldn't fetch ${filename}.json: \n${fetchError}`);
			}

			let parsedData;
			try {
				parsedData = JSON.parse(Buffer.from(fileResponse.data.content, 'base64').toString('utf-8'));
			} catch (parseError) {
				logger.info(`Unable to parse data fetched from ${filename}:\n${parseError}`);
				return await interaction.editReply(`:x: Unable to parse data fetched from ${filename}:\n${parseError}`);
			}
			if (!Array.isArray(parsedData.records)) {
				logger.info(`The records field of the fetched ${filename}.json is not an array`);
				return await interaction.editReply(`:x: The records field of the fetched ${filename}.json is not an array`);
			}

			const recordIndex = parsedData.records.findIndex((record) => record.user === username);
			if (recordIndex === -1) return await interaction.editReply(`:x: Couldn't find a record with the username \`${username}\``);

			const record = parsedData.records[recordIndex];

			parsedData.records.splice(recordIndex, 1);

			await interaction.editReply("Committing...");

			// not sure why it needs to be done this way but :shrug:
			let changes = [];
			changes.push({
				path: githubDataPath + `/${filename}.json`,
				content: JSON.stringify(parsedData, null, '\t'),
			})

			const changePath = githubDataPath + `/${filename}.json`
			const content = JSON.stringify(parsedData);

			const debugStatus = await db.infos.findOne({ where: { name: 'commitdebug' } });
			if (!debugStatus || !debugStatus.status) {
				let commitSha;
				try {
					// Get the SHA of the latest commit from the branch
					const { data: refData } = await octokit.git.getRef({
						owner: githubOwner,
						repo: githubRepo,
						ref: `heads/${githubBranch}`,
					});
					commitSha = refData.object.sha;
				} catch (getRefError) {
					logger.info(`Something went wrong while fetching the latest commit SHA:\n${getRefError}`);
					await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
					return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (getRefError)');
				}
				let treeSha;
				try {
					// Get the commit using its SHA
					const { data: commitData } = await octokit.git.getCommit({
						owner: githubOwner,
						repo: githubRepo,
						commit_sha: commitSha,
					});
					treeSha = commitData.tree.sha;
				} catch (getCommitError) {
					logger.info(`Something went wrong while fetching the latest commit:\n${getCommitError}`);
					await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
					return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (getCommitError)');
				}

				let newTree;
				try {
					// Create a new tree with the changes
					newTree = await octokit.git.createTree({
						owner: githubOwner,
						repo: githubRepo,
						base_tree: treeSha,
						tree: changes.map(change => ({
							path: change.path,
							mode: '100644',
							type: 'blob',
							content: change.content,
						})),
					});
				} catch (createTreeError) {
					logger.info(`Something went wrong while creating a new tree:\n${createTreeError}`);
					await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
					return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (createTreeError)');
				}

				let newCommit;
				try {
					// Create a new commit with this tree
					newCommit = await octokit.git.createCommit({
						owner: githubOwner,
						repo: githubRepo,
						message: `Removed ${username}'s record from ${filename}.json (${interaction.user.tag})`,
						tree: newTree.data.sha,
						parents: [commitSha],
					});
				} catch (createCommitError) {
					logger.info(`Something went wrong while creating a new commit:\n${createCommitError}`);
					await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
					return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (createCommitError)');
				}

				try {
					// Update the branch to point to the new commit
					await octokit.git.updateRef({
						owner: githubOwner,
						repo: githubRepo,
						ref: `heads/${githubBranch}`,
						sha: newCommit.data.sha,
					});
				} catch (updateRefError) {
					logger.info(`Something went wrong while updating the branch :\n${updateRefError}`);
					await db.messageLocks.destroy({ where: { discordid: interaction.message.id } });
					return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (updateRefError)');
				}
				logger.info(`Successfully created commit on ${githubBranch} (record addition): ${newCommit.data.sha}`);
				await interaction.editReply("This record has been removed!");
			} else {
				let updatedFiles = 0;
				let i = 1;
				// Get file SHA
				let fileSha;
				try {
					const response = await octokit.repos.getContent({
						owner: githubOwner,
						repo: githubRepo,
						path: changePath,
					});
					fileSha = response.data.sha;
				} catch (error) {
					logger.info(`Error fetching ${changePath} SHA:\n${error}`);
					erroredRecords.push(`All from ${changePath}`);
					return await interaction.editReply(`:x: Couldn't fetch data from ${changePath}`);
					i++;

				}

				try {
					await octokit.repos.createOrUpdateFileContents({
						owner: githubOwner,
						repo: githubRepo,
						path: changePath,
						message: `Updated ${changePath} (${interaction.user.tag})`,
						content: Buffer.from(content).toString('base64'),
						sha: fileSha,
					});
					logger.info(`Updated ${changePath} (${interaction.user.tag}`);
				} catch (error) {
					logger.info(`Failed to update ${changePath} (${interaction.user.tag}):\n${error}`);
					erroredRecords.push(`All from ${changePath}`);
					await interaction.editReply(`:x: Couldn't update the file ${changePath}, skipping...`);
				}
				updatedFiles++;
				i++;
			}
		} else if (interaction.options.getSubcommand() === 'edit') {
			await interaction.deferReply({ ephemeral: true });
			const { octokit, db, cache } = require('../../index.js');
			const levelname = interaction.options.getString('levelname');
			const olduser = interaction.options.getString('username');

			const level = await cache.levels.findOne({ where: { name: levelname } });
			
			if (!level) return await interaction.editReply(':x: Couldn\'t find the level');
			const filename = level.filename

			let fileResponse;
			try {
				fileResponse = await octokit.rest.repos.getContent({
					owner: githubOwner,
					repo: githubRepo,
					path: githubDataPath + `/${filename}.json`,
					branch: githubBranch,
				});
			} catch (fetchError) {
				logger.info(`Couldn't fetch ${filename}.json: \n${fetchError}`);
				return await interaction.editReply(`:x: Couldn't fetch ${filename}.json: \n${fetchError}`);
			}

			let parsedData;
			try {
				parsedData = JSON.parse(Buffer.from(fileResponse.data.content, 'base64').toString('utf-8'));
			} catch (parseError) {
				logger.info(`Unable to parse data fetched from ${filename}:\n${parseError}`);
				return await interaction.editReply(`:x: Unable to parse data fetched from ${filename}:\n${parseError}`);
			}
			if (!Array.isArray(parsedData.records)) {
				logger.info(`The records field of the fetched ${filename}.json is not an array`);
				return await interaction.editReply(`:x: The records field of the fetched ${filename}.json is not an array`);
			}

			const recordIndex = parsedData.records.findIndex((record) => record.user === olduser);
			if (recordIndex === -1) return await interaction.editReply(`:x: Couldn't find a record with the username \`${username}\``);

			const newuser = interaction.options.getString('newuser') || null;
			const fps = interaction.options.getInteger('fps') || null;
			const percent = interaction.options.getInteger('percent') || null;
			const enjoyment = interaction.options.getInteger('enjoyment') || null;
			const video = interaction.options.getString('completionlink') || null;

			if (newuser !== null) parsedData.records[recordIndex].user = newuser;
			if (fps !== null) parsedData.records[recordIndex].fps = fps;
			if (percent !== null) parsedData.records[recordIndex].percent = percent;
			if (enjoyment !== null) parsedData.records[recordIndex].enjoyment = enjoyment;
			if (video !== null) parsedData.records[recordIndex].link = video;


			await interaction.editReply("Committing...");

			// not sure why it needs to be done this way but :shrug:
			let changes = [];
			changes.push({
				path: githubDataPath + `/${filename}.json`,
				content: JSON.stringify(parsedData, null, '\t'),
			})

			let commitSha;
			try {
				// Get the SHA of the latest commit from the branch
				const { data: refData } = await octokit.git.getRef({
					owner: githubOwner,
					repo: githubRepo,
					ref: `heads/${githubBranch}`,
				});
				commitSha = refData.object.sha;
			} catch (getRefError) {
				logger.info(`Something went wrong while fetching the latest commit SHA:\n${getRefError}`);
				return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (getRefError)');
			}
			let treeSha;
			try {
				// Get the commit using its SHA
				const { data: commitData } = await octokit.git.getCommit({
					owner: githubOwner,
					repo: githubRepo,
					commit_sha: commitSha,
				});
				treeSha = commitData.tree.sha;
			} catch (getCommitError) {
				logger.info(`Something went wrong while fetching the latest commit:\n${getCommitError}`);
				return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (getCommitError)');
			}

			let newTree;
			try {
				// Create a new tree with the changes
				newTree = await octokit.git.createTree({
					owner: githubOwner,
					repo: githubRepo,
					base_tree: treeSha,
					tree: changes.map(change => ({
						path: change.path,
						mode: '100644',
						type: 'blob',
						content: change.content,
					})),
				});
			} catch (createTreeError) {
				logger.info(`Something went wrong while creating a new tree:\n${createTreeError}`);
				return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (createTreeError)');
			}

			let newCommit;
			try {
				// Create a new commit with this tree
				newCommit = await octokit.git.createCommit({
					owner: githubOwner,
					repo: githubRepo,
					message: `Updated ${olduser}'s record on ${levelname} (${interaction.user.tag})`,
					tree: newTree.data.sha,
					parents: [commitSha],
				});
			} catch (createCommitError) {
				logger.info(`Something went wrong while creating a new commit:\n${createCommitError}`);
				return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (createCommitError)');
			}

			try {
				// Update the branch to point to the new commit
				await octokit.git.updateRef({
					owner: githubOwner,
					repo: githubRepo,
					ref: `heads/${githubBranch}`,
					sha: newCommit.data.sha,
				});
			} catch (updateRefError) {
				logger.info(`Something went wrong while updating the branch :\n${updateRefError}`);
				return await interaction.editReply(':x: Something went wrong while commiting the records to github, please try again later (updateRefError)');
			}
			logger.info(`Successfully created commit on ${githubBranch} (record update): ${newCommit.data.sha}`);
			return await interaction.editReply("This record has been updated!");
		}
	},
};
