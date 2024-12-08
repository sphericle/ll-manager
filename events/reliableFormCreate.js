const { Events } = require('discord.js');
const logger = require('log4js').getLogger();

module.exports = {
	name: Events.ThreadCreate,
	async execute(thread) {
        await thread.join(); // Join the thread so it can perform reliable commands
	},
};
