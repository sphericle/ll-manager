const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	enabled: true,
	data: new SlashCommandBuilder()
		.setName('pullchanges')
		.setDescription('Pull the latest changes from the repository'),
	async execute(interaction) {
		await interaction.reply('Pulling the latest changes from the repository...');

		try {
			const localRepoPath = path.resolve(`../../data/repo/`);
			const { git } = require('../index.js');

			await git.cwd(localRepoPath).pull();
			return await interaction.editReply('Successfully pulled the latest changes from the repository');
		} catch (error) {
			return await interaction.editReply(':x: Something went wrong while fetching data from github, please try again later');
		}
	}
}