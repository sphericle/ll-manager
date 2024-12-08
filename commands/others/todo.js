const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	enabled: true,
	data: new SlashCommandBuilder()
		.setName('todo')
		.setDescription('Todo list for the bot')
		.setDefaultMemberPermissions(0),
	async execute(interaction) {
		await interaction.reply({content: 'Todo: \n- Add command to copy a record to a different level\n- Command to say yes / no to a level in voting\n- Accept/reject a level'});
	},
};


/* 

const text = "Red Green Yellow 2-0";
const match = text.match(/(\d+)-\d+$/);
if (match) {
				console.log(match);
    console.log(match[1]); // 2
}
*/