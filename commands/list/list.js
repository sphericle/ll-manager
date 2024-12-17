const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const { githubOwner, githubRepo, githubDataPath, githubBranch } = require('../../config.json');
const logger = require('log4js').getLogger();
const { Sequelize } = require('sequelize');

module.exports = {
	enabled: true,
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Staff list management')
		.addSubcommand(subcommand =>
			subcommand
				.setName('place')
				.setDescription('Place a level on the list')
				.addStringOption(option =>
					option.setName('levelname')
						.setDescription('The name of the level to place')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('position')
						.setDescription('The position to place the level at')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('difficulty')
						.setDescription('The minimum percent players need to get a record on this level')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('id')
						.setDescription('The GD ID of the level to place')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('uploader')
						.setDescription('The name of the person who uploaded the level on GD')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('verifier')
						.setDescription('The name of the verifier')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('verification')
						.setDescription('The link to the level\'s verification video')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('songname')
						.setDescription('The name of this level\'s song')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('songlink')
						.setDescription('The NONG link for this level, if any.'))
				.addStringOption(option =>
					option.setName('creators')
						.setDescription('The list of the creators of the level, each separated by a comma'))
				.addStringOption(option =>
					option.setName('password')
						.setDescription('The GD password of the level to place'))
				.addIntegerOption(option =>
					option.setName('percent')
						.setDescription('The minimum percent players need to get a record on this level (list percent)')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('submit')
				.setDescription('Submit a level to be voted on')
				.addStringOption(option =>
					option.setName('levelname')
						.setDescription('The name of the level to submit')
						.setAutocomplete(true)
						.setRequired(true))
				.addStringOption(option =>
					option.setName('verifier')
						.setDescription('The name of the verifier')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('verification')
						.setDescription('The link to the level\'s verification video')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('creators')
						.setDescription('The list of the creators of the level, each separated by a comma')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('difficulty')
						.setDescription('The level\'s difficulty on the site (1-10, see the list website for details)'))
				.addIntegerOption(option =>
					option.setName('percent')
						.setDescription('The minimum percent players need to get a record on this level (list percent)'))
				.addStringOption(option =>
					option.setName('songname')
						.setDescription('The name of this level\'s song. Required if there is a NONG.'))
				.addStringOption(option =>
					option.setName('songlink')
						.setDescription('The NONG link for this level, if any. To get the link, you can upload the file in a discord message.'))
				.addStringOption(option =>
					option.setName('password')
						.setDescription('The GD password of the level to place'))
				.addIntegerOption(option =>
					option.setName('enjoyment')
						.setDescription('The name of the person who uploaded the level on GD'))
				.addStringOption(option =>
					option.setName('raw')
						.setDescription('The verifier\'s raw footage (if the level is extreme+)')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('move')
				.setDescription('Moves a level to another position on the list')
				.addStringOption(option =>
					option.setName('levelname')
						.setDescription('The name of the level to move')
						.setAutocomplete(true)
						.setMinLength(1)
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('position')
						.setDescription('The new position to move the level at')
						.setMinValue(1)
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('remove')
				.setDescription('Remove/hide a level from the list')
				.addStringOption(option =>
					option.setName('levelname')
						.setDescription('The name of the level to delete')
						.setRequired(true)
						.setMaxLength(1024)
						.setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('mutualvictors')
				.setDescription('Finds all victors that have beaten both levels')
				.addStringOption(option =>
					option.setName('level1')
						.setDescription('The name of the first level')
						.setAutocomplete(true)
						.setRequired(true))
				.addStringOption(option =>
					option.setName('level2')
						.setDescription('The name of the second level')
						.setAutocomplete(true)
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('edit')
				.setDescription('Edit a level\'s info')
				.addStringOption(option =>
					option.setName('level')
						.setDescription('The name of the level to edit')
						.setAutocomplete(true)
						.setRequired(true))
				.addStringOption(option =>
					option.setName('levelname')
						.setDescription('The name of the level to place'))
				.addIntegerOption(option =>
					option.setName('position')
						.setDescription('The position to place the level at'))
				.addIntegerOption(option =>
					option.setName('difficulty')
						.setDescription('The tier the level is in (1-10, see the list website for details)'))
				.addIntegerOption(option =>
					option.setName('id')
						.setDescription('The GD ID of the level to place'))
				.addStringOption(option =>
					option.setName('uploader')
						.setDescription('The name of the person who uploaded the level on GD'))
				.addStringOption(option =>
					option.setName('verifier')
						.setDescription('The name of the verifier'))
				.addStringOption(option =>
					option.setName('verification')
						.setDescription('The link to the level\'s verification video'))
				.addStringOption(option =>
					option.setName('songname')
						.setDescription('The name of this level\'s song'))
				.addStringOption(option =>
					option.setName('songlink')
						.setDescription('The NONG link for this level, if any.'))
				.addStringOption(option =>
					option.setName('creators')
						.setDescription('The list of the creators of the level, each separated by a comma'))
				.addStringOption(option =>
					option.setName('password')
						.setDescription('The GD password of the level to place'))
				.addIntegerOption(option =>
					option.setName('percent')
						.setDescription('The minimum percent players need to get a record on this level (list percent)')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('renameuser')
				.setDescription('Rename a user')
				.addStringOption(option =>
					option.setName('username')
						.setDescription('The name of the user to rename')
						.setAutocomplete(true)
						.setRequired(true))
				.addStringOption(option =>
					option.setName('newusername')
						.setDescription('The new name of the user')
						.setRequired(true))),
	async autocomplete(interaction) {
		const focused = interaction.options.getFocused(true);
		const { cache } = require('../../index.js');
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'renameuser') return await interaction.respond(
			(await 
				cache.users
				.findAll({where: {}})
			).filter(user => user.name.toLowerCase().includes(focused.value.toLowerCase()))
				.slice(0,25)
				.map(user => ({ name: user.name, value: user.name }))
		);
		else if (subcommand === "hide") {
			let levels = await cache.levels.findAll({
				where: {
					name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + focused.value.toLowerCase() + '%')
				}
			});
			return await interaction.respond(
				levels.slice(0, 25).map(level => ({ name: level.name, value: level.name })),
			);
		}
		else 
			return await interaction.respond(
			(await 
				(subcommand === "fromlegacy" ? cache.legacy : cache.levels)
				.findAll({where: {}})
				).filter(level => level.name.toLowerCase().includes(
					focused.value.toLowerCase()
				))
				.slice(0,25)
				.map(level => ({ name: level.name, value: level.filename }))
			);
	},
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true});

		if (interaction.options.getSubcommand() === 'place') {
			await interaction.editReply('Placing level...');

			const { db, cache } = require('../../index.js');
			const { Op } = require('sequelize');

			const levelname = interaction.options.getString('levelname');
			const position = interaction.options.getInteger('position');
			const id = interaction.options.getInteger('id');
			const uploaderName = interaction.options.getString('uploader');
			const verifierName = interaction.options.getString('verifier');
			const verification = interaction.options.getString('verification');
			const password = (interaction.options.getString('password') == null ? 'Free to copy' : interaction.options.getString('password'));
			const rawCreators = interaction.options.getString('creators');
			const creatorNames = rawCreators ? rawCreators.split(',') : [];
			const percent = interaction.options.getInteger('percent') || 100;
			const difficulty = interaction.options.getInteger('difficulty');
			const songName = interaction.options.getString('songname');
			const songLink = interaction.options.getString('songlink') || null;
			

			const finalCreators = [];
			for (const creatorName of creatorNames) {
				finalCreators.push(creatorName.trim()); // lol
			}

			await interaction.editReply('Coding...');
			const githubCode = `{\n\t"id": ${id},\n\t"name": "${levelname}",\n\t"author": "${uploaderName}",\n\t"creators": ${JSON.stringify(finalCreators)},\n\t"verifier": "${verifierName}",\n\t"verification": "${verification}",\n\t"percentToQualify": ${percent},\n\t"password": "${password}",\n\t"difficulty": ${difficulty},\n\t"song": "${songName}",` + (songLink !== null ? `\n\t"songLink": "${songLink}",` : '') + `\n\t"records" : []\n}`;

			const levelBelow = await cache.levels.findOne({ where: { position: position } });
			const levelAbove = await cache.levels.findOne({ where: { position: position - 1 } });
			const placeEmbed = new EmbedBuilder()
				.setColor(0x8fce00)
				.setTitle(`Place Level: ${levelname}`)
				.setDescription(`**${levelname}** will be placed at **#${position}**, above **${levelBelow ? levelBelow.name : '-'}** and below **${levelAbove ? levelAbove.name : '-'}**`)
				.addFields(
					{ name: 'ID:', value: `${id}`, inline: true },
					{ name: 'Uploader:', value: `${uploaderName}`, inline: true },
					{ name: 'Creators:', value: `${rawCreators ? rawCreators.slice(0, 1023) : 'None provided'}`, inline: true },
					{ name: 'Verifier:', value: `${verifierName}`, inline: true },
					{ name: 'Verification:', value: `${verification}`, inline: true },
					{ name: 'Password:', value: `${password}`, inline: true },
					{ name: 'Percent:', value: `${percent}`, inline: true },
					{ name: 'Difficulty:', value: `${difficulty}`, inline: true },
				)
				.setTimestamp();
			// Create commit buttons
			const commit = new ButtonBuilder()
				.setCustomId('commitAddLevel')
				.setLabel('Commit changes')
				.setStyle(ButtonStyle.Success);

			const row = new ActionRowBuilder()
				.addComponents(commit);

			await interaction.editReply({ embeds: [placeEmbed], components: [row] });
			const sent = await interaction.fetchReply();

			try {
				await db.levelsToPlace.create({
					filename: levelname.normalize('NFD').replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_').toLowerCase(),
					position: position,
					githubCode: githubCode,
					discordid: sent.id,
				});
			} catch (error) {
				logger.info(`Couldn't register the level ; something went wrong with Sequelize : ${error}`);
				return await interaction.editReply(':x: Something went wrong while adding the level; Please try again later');
			}
			return;
		} else if (interaction.options.getSubcommand() === 'submit') {
			return await interaction.editReply('Not implemented yet');
		} else if (interaction.options.getSubcommand() === 'edit') {
			const { db, cache } = require('../../index.js');
			const { octokit } = require('../../index.js');
			const level = interaction.options.getString('level') || null;
			const levelname = interaction.options.getString('levelname') || null;
			const id = interaction.options.getInteger('id') || null;
			const uploaderName = interaction.options.getString('uploader') || null;
			const verifierName = interaction.options.getString('verifier') || null;
			const verification = interaction.options.getString('verification') || null;
			const password = interaction.options.getString('password') || null;
			const rawCreators = interaction.options.getString('creators') || null;
			const creatorNames = rawCreators ? rawCreators.split(',') : [];
			const percent = interaction.options.getInteger('percent') || null;
			const difficulty = interaction.options.getInteger('difficulty') || null;
			const songName = interaction.options.getString('songname') || null;
			const songLink = interaction.options.getString('songlink') || null;

			const levelToEdit = await cache.levels.findOne({ where: { filename: level } });
			const filename = levelToEdit.filename;
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

			if (levelname !== null) parsedData.name = levelname;
			if (id !== null) parsedData.id = id;
			if (uploaderName !== null) parsedData.author = uploaderName;
			if (verifierName !== null) parsedData.verifier = verifierName;
			if (verification !== null) parsedData.verification = verification;
			if (password !== null) parsedData.password = password;
			if (creatorNames.length > 0) parsedData.creators = creatorNames;
			if (percent !== null) parsedData.percentToQualify = percent;
			if (difficulty !== null) parsedData.difficulty = difficulty;
			if (songName !== null) parsedData.song = songName;
			if (songLink !== null) parsedData.songLink = songLink;

			let existing = true;

			if (levelname !== null || id !== null || uploaderName !== null || verifierName !== null || verification !== null || password !== null || creatorNames.length > 0 || percent !== null || difficulty !== null || songName !== null || songLink !== null) existing = false;

			if (existing) {
				return await interaction.editReply('You didn\'t change anything');
			}
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
						message: `Updated info for ${levelToEdit.name} (${interaction.user.tag})`,
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

			logger.info(`${interaction.user.tag} (${interaction.user.id}) submitted ${interaction.options.getString('levelname')} for ${interaction.options.getString('username')}`);
			// Reply
			await interaction.editReply(`:white_check_mark: ${levelToEdit.name} has been edited successfully`);
			return;
		} else if (interaction.options.getSubcommand() === 'move') {
			const { db, octokit } = require('../../index.js');

			const levelfile = interaction.options.getString('levelname');
			const position = interaction.options.getInteger('position');

			let list_response;
			try {
				list_response = await octokit.rest.repos.getContent({
					owner: githubOwner,
					repo: githubRepo,
					path: githubDataPath + '/_list.json',
					branch: githubBranch,
				});
			} catch (_) {
				return await interaction.editReply(':x: Something went wrong while fetching data from github, please try again later');
			}

			const list = JSON.parse(Buffer.from(list_response.data.content, 'base64').toString('utf-8'));

			const currentPosition = list.indexOf(levelfile);
			if (currentPosition == -1) return await interaction.editReply(':x: The level you are trying to move is not on the list');

			const levelAbove = (currentPosition + 1 < position ? list[position - 1] : list[position - 2]) ?? null;
			const levelBelow = (currentPosition + 1 < position ? list[position] : list[position - 1]) ?? null;

			const moveEmbed = new EmbedBuilder()
				.setColor(0x8fce00)
				.setTitle(`Move Level: ${levelfile}`)
				.setDescription(`**${levelfile}** will be ${currentPosition + 1 < position ? "lowered" : "raised"} to **#${position}**, above **${levelBelow ?? '-'}** and below **${levelAbove ?? '-'}**`)
				.setTimestamp();

			// Create commit buttons
			const commit = new ButtonBuilder()
				.setCustomId('commitMoveLevel')
				.setLabel('Commit changes')
				.setStyle(ButtonStyle.Success);

			const row = new ActionRowBuilder()
				.addComponents(commit);

			await interaction.editReply({ embeds: [moveEmbed], components: [row] });
			const sent = await interaction.fetchReply();

			try {
				await db.levelsToMove.create({
					filename: levelfile,
					position: position,
					discordid: sent.id,
				});
			} catch (error) {
				logger.info(`Couldn't register the level to move ; something went wrong with Sequelize : ${error}`);
				return await interaction.editReply(':x: Something went wrong while moving the level; Please try again later');
			}
			return;
		} else if (interaction.options.getSubcommand() === 'tolegacy') {
			const { db, octokit } = require('../../index.js');

			const levelfile = interaction.options.getString('levelname');

			let list_response;
			try {
				list_response = await octokit.rest.repos.getContent({
					owner: githubOwner,
					repo: githubRepo,
					path: githubDataPath + '/_list.json',
					branch: githubBranch,
				});
				
			} catch (_) {
				return await interaction.editReply(':x: Something went wrong while fetching data from github, please try again later');
			}

			const list = JSON.parse(Buffer.from(list_response.data.content, 'base64').toString('utf-8'));
			const currentPosition = list.indexOf(levelfile);

			if (currentPosition == -1) return await interaction.editReply(':x: The level you are trying to move is not on the list');

			const moveEmbed = new EmbedBuilder()
				.setColor(0x8fce00)
				.setTitle(`Move to Legacy: ${levelfile}`)
				.setDescription(`**${levelfile}** will be moved from **#${currentPosition + 1}** to the top of the **legacy** list (**#${list.length}**)`)
				.setTimestamp();

			const commit = new ButtonBuilder()
				.setCustomId('commitLevelToLegacy')
				.setLabel('Commit changes')
				.setStyle(ButtonStyle.Success);

			const row = new ActionRowBuilder()
				.addComponents(commit);

			await interaction.editReply({ embeds: [moveEmbed], components: [row] });
			const sent = await interaction.fetchReply();

			try {
				await db.levelsToLegacy.create({
					filename: levelfile,
					discordid: sent.id,
				});
			} catch (error) {
				logger.info(`Couldn't register the level to move ; something went wrong with Sequelize : ${error}`);
				return await interaction.editReply(':x: Something went wrong while moving the level; Please try again later');
			}
			return;
		} else if (interaction.options.getSubcommand() === 'fromlegacy') {
			const { db, octokit } = require('../../index.js');

			const levelfile = interaction.options.getString('levelname');
			const position = interaction.options.getInteger('position');

			let list_response;
			try {
				list_response = await octokit.rest.repos.getContent({
					owner: githubOwner,
					repo: githubRepo,
					path: githubDataPath + '/_list.json',
					branch: githubBranch,
				});
			} catch (_) {
				return await interaction.editReply(':x: Something went wrong while fetching data from github, please try again later');
			}

			const list = JSON.parse(Buffer.from(list_response.data.content, 'base64').toString('utf-8'));

			const levelAbove = list[position - 2] ?? null;
			const levelBelow = list[position - 1] ?? null;

			const moveEmbed = new EmbedBuilder()
				.setColor(0x8fce00)
				.setTitle(`Move Level: ${levelfile}`)
				.setDescription(`**${levelfile}** will be moved from **legacy** to **#${position}**, above **${levelBelow ?? '-'}** and below **${levelAbove ?? '-'}**`)
				.setTimestamp();

			// Create commit buttons
			const commit = new ButtonBuilder()
				.setCustomId('commitLevelFromLegacy')
				.setLabel('Commit changes')
				.setStyle(ButtonStyle.Success);

			const row = new ActionRowBuilder()
				.addComponents(commit);

			await interaction.editReply({ embeds: [moveEmbed], components: [row] });
			const sent = await interaction.fetchReply();

			try {
				await db.levelsFromLegacy.create({
					filename: levelfile,
					position: position,
					discordid: sent.id,
				});
			} catch (error) {
				logger.info(`Couldn't register the level to move ; something went wrong with Sequelize : ${error}`);
				return await interaction.editReply(':x: Something went wrong while moving the level; Please try again later');
			}
			return;
		} else if (interaction.options.getSubcommand() === 'renameuser') {
			const { cache, octokit } = require('../../index.js');
			const path = require('path');
			const fs = require('fs');
			const { githubOwner, githubRepo, githubDataPath, githubBranch } = require('../../config.json');

			const olduser = interaction.options.getString('username');
			const newuser = interaction.options.getString('newusername');

			const changes = [];
			
			const localRepoPath = path.resolve(__dirname, `../../data/repo/`);
			const listFilename = 'data/_list.json';
			let list_data;
			try {
				list_data = JSON.parse(fs.readFileSync(path.join(localRepoPath, listFilename), 'utf8'));
			} catch (parseError) {
				if (!listFilename.startsWith('_')) logger.error('Git - ' + `Unable to parse data from ${listFilename}:\n${parseError}`);
				return -1;
			}			
			for (const filename of list_data) {
				let edited = false;
				let parsedData;
				try {
					parsedData = JSON.parse(fs.readFileSync(path.join(localRepoPath, `data/${filename}.json`), 'utf8'));
				} catch (parseError) {
					if (!filename.startsWith('_')) logger.error('Git - ' + `Unable to parse data from ${filename}.json:\n${parseError}`);
					continue;
				}

				if (parsedData.author === olduser) {
					parsedData.author = newuser;
					edited = true;
				}

				if (parsedData.verifier === olduser) {
					parsedData.verifier = newuser;
					edited = true;
				}

				for (const creator of parsedData.creators) {
					if (creator === olduser) {
						creator = newuser;
						edited = true;
					}
				}

				for (const record of parsedData.records) {
					if (record.user === olduser) {
						record.user = newuser;
						edited = true;
					}
				}
				
				if (edited) changes.push({
					path: githubDataPath + `/${filename}.json`,
					content: JSON.stringify(parsedData, null, '\t'),
				})
			}
			
			// remove old flag entry and set a new one
			const flagsFilename = 'data/_flags.json';
			let flags;
			try {
				flags = JSON.parse(fs.readFileSync(path.join(localRepoPath, flagsFilename), 'utf8'));
			} catch (parseError) {
				if (!flagsFilename.startsWith('_')) logger.error('Git - ' + `Unable to parse data from ${listFilename}:\n${parseError}`);
				return;
			}
			
			if (flags[olduser] && !flags[newuser]) {
				flags[newuser] = flags[olduser];
				delete flags[olduser];
				changes.push({
					path: githubDataPath + `/_flags.json`,
					content: JSON.stringify(flags, null, '\t'),
				})
			}
			
			let commitSha;
			try {
				// Get the SHA of the latest commit from the branch
				const { data: refData } = await octokit.git.getRef({
					owner: githubOwner,
					repo: githubRepo,
					ref: `heads/${githubBranch}`,
				});
				commitSha = refData.object.sha;
			} catch (getRefErr) {
				logger.info(`Failed to get the latest commit SHA: ${getRefErr}`);
				return await interaction.editReply(':x: Something went wrong while renaming the user; please try again later');
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
			} catch (getCommitErr) {
				logger.info(`Failed to get the commit SHA: ${getCommitErr}`);
				return await interaction.editReply(':x: Something went wrong while renaming the user; please try again later');
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
			} catch (createTreeErr) {
				logger.info(`Failed to create a new tree: ${createTreeErr}`);
				return await interaction.editReply(':x: Something went wrong while renaming the user; please try again later');
			}

			let newCommit;
			try {
				// Create a new commit with this tree
				newCommit = await octokit.git.createCommit({
					owner: githubOwner,
					repo: githubRepo,
					message: `${interaction.user.tag} renamed ${olduser} to ${newuser}`,
					tree: newTree.data.sha,
					parents: [commitSha],
				});
			} catch (createCommitErr) {
				logger.info(`Failed to create a new commit: ${createCommitErr}`);
				return await interaction.editReply(':x: Something went wrong while renaming the user; please try again later');
			}

			try {
				// Update the branch to point to the new commit
				await octokit.git.updateRef({
					owner: githubOwner,
					repo: githubRepo,
					ref: `heads/${githubBranch}`,
					sha: newCommit.data.sha,
				});
			} catch (updateRefErr) {
				logger.info(`Failed to update the branch: ${updateRefErr}`);
				return await interaction.editReply(':x: Something went wrong while renaming the user; please try again later');
			}

			const { db } = require('../../index.js');
			try {
				await db.pendingRecords.update({ username: newuser }, { where: { username: olduser } });
				await db.acceptedRecords.update({ username: newuser }, { where: { username: olduser } });
				await db.deniedRecords.update({ username: newuser }, { where: { username: olduser } });
			} catch (error) {
				logger.info(`Failed to update records (username change): ${error}`);
			}
			cache.updateUsers();
			logger.info(`${interaction.user.tag} (${interaction.user.id}) renamed ${olduser} to ${newuser}`);
			return await interaction.editReply(`:white_check_mark: Successfully renamed **${olduser}** to **${newuser}**`);
		} else if (interaction.options.getSubcommand() === 'mutualvictors') {
			const { cache, octokit } = require('../../index.js');
			const { Op, Sequelize } = require('sequelize');

			const level1 = interaction.options.getString('level1');
			const level2 = interaction.options.getString('level2');

			if (await cache.levels.findOne({ where: { filename: level1 } }) == null) return await interaction.editReply(`:x: Level **${level1}** not found`);
			if (await cache.levels.findOne({ where: { filename: level2 } }) == null) return await interaction.editReply(`:x: Level **${level2}** not found`);


			let level1_response, level2_response;
			try {
				level1_response = await octokit.rest.repos.getContent({
					owner: githubOwner,
					repo: githubRepo,
					path: githubDataPath + `/${level1}.json`,
					branch: githubBranch,
				});

			} catch (fetchError) {
				logger.info(`Failed to fetch ${level1}.json: ${fetchError}`);
				return await interaction.editReply(`:x: Failed to fetch data for **${level1}** from github; please try again later`);
			}

			try {
				level2_response = await octokit.rest.repos.getContent({
					owner: githubOwner,
					repo: githubRepo,
					path: githubDataPath + `/${level2}.json`,
					branch: githubBranch,
				});

			} catch (fetchError) {
				logger.info(`Failed to fetch ${level2}.json: ${fetchError}`);
				return await interaction.editReply(`:x: Failed to fetch data for **${level2}** from github; please try again later`);
			}

			const victors1 = JSON.parse(Buffer.from(level1_response.data.content, 'base64').toString('utf-8'))?.records;
			const victors2 = JSON.parse(Buffer.from(level2_response.data.content, 'base64').toString('utf-8'))?.records;
			

			const mutualVictors = victors1.filter(victor1 => victors2.some(victor2 => victor2.user === victor1.user));
			const mutualVictorNames = await cache.users.findAll({
				where: {
					user_id: {
						[Op.in]: mutualVictors.map(victor => victor.user),
					},
				},
				attributes: ['name'],
			});

			const mutualVictorNamesString = mutualVictorNames.map(victor => victor.name).join('\n- ');
			const attachment = new AttachmentBuilder(Buffer.from("- " + mutualVictorNamesString)).setName(`mutual_victors_${level1}_${level2}.txt`);
			return await interaction.editReply({ content: `:white_check_mark: Found ${mutualVictorNames.length} mutual victors between **${level1}** and **${level2}**\n`, files: [attachment] });
		} else if (interaction.options.getSubcommand() === 'hide') {
			const { cache, octokit } = require('../../index.js');
			const levelname = await interaction.options.getString('levelname');
			const levelToDelete = await cache.levels.findOne({ where: { name: levelname } });

			
			if (!levelToDelete) return await interaction.editReply(":x: Could not find a level with that name, make sure you pick an given option!")
			let list;
			try {
				list = JSON.parse(Buffer.from((await octokit.rest.repos.getContent({
					owner: githubOwner,
					repo: githubRepo,
					path: githubDataPath + `/_list.json`,
					branch: githubBranch,
				})).data.content, 'base64').toString('utf-8'));
			} catch (e) {
				return await interaction.editReply(`:x: Failed to fetch _list.json: ${e}`)
			}

			index = list.findIndex(level => level === levelToDelete.filename);

			if (index === -1) return await interaction.editReply(":x: Error removing this level: the filename was not found in _list.json")

			list.splice(index, 1);

			try {
				cache.levels.destroy({ where: { filename: levelToDelete.filename } });
			} catch (e) {
				return await interaction.editReply(`:x: Error removing level from database: ${e}`)
			}

			const filename = levelToDelete.filename;
			const changes = [
				{
					path: githubDataPath + '/_list.json',
					content: JSON.stringify(list, null, '\t'),
				},
				{
					path: githubDataPath + `/archived/${filename}.json`,
				},
			]

			let commitSha;
			try {
				// Get the SHA of the latest commit from the branch
				const { data: refData } = await octokit.git.getRef({
					owner: githubOwner,
					repo: githubRepo,
					ref: `heads/${githubBranch}`,
				});
				commitSha = refData.object.sha;
			} catch (getRefErr) {
				logger.info(`Something went wrong while getting the latest commit SHA: \n${getRefErr}`);
				return await interaction.editReply(':x: Couldn\'t commit to github, please try again later (getRefError)');
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
			} catch (getCommitErr) {
				logger.info(`Something went wrong while getting the latest commit: \n${getCommitErr}`);
				return await interaction.editReply(':x: Couldn\'t commit to github, please try again later (getCommitError)');
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
						content: change.content || '',
					})),
				});
			} catch (createTreeErr) {
				logger.info(`Something went wrong while creating a new tree: \n${createTreeErr}`);
				return await interaction.editReply(':x: Couldn\'t commit to github, please try again later (createTreeError)');
			}

			let newCommit;
			try {
				// Create a new commit with this tree
				newCommit = await octokit.git.createCommit({
					owner: githubOwner,
					repo: githubRepo,
					message: `Removed ${levelname} from the list (${interaction.user.tag})`,
					tree: newTree.data.sha,
					parents: [commitSha],
				});
			} catch (createCommitErr) {
				logger.info(`Something went wrong while creating a new commit: \n${createCommitErr}`);
				return await interaction.editReply(':x: Couldn\'t commit to github, please try again later (createCommitError)');
			}

			try {
				// Update the branch to point to the new commit
				await octokit.git.updateRef({
					owner: githubOwner,
					repo: githubRepo,
					ref: `heads/${githubBranch}`,
					sha: newCommit.data.sha,
				});
			} catch (updateRefErr) {
				logger.info(`Something went wrong while updating the branch reference: \n${updateRefErr}`);
				return await interaction.editReply(':x: Couldn\'t commit to github, please try again later (updateRefError)');
			}

			return await interaction.editReply(`:white_check_mark: Removed ${levelname}!`)
		}
	},
};