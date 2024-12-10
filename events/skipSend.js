const { Events } = require('discord.js');
const logger = require('log4js').getLogger();

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        
        if (message.author.id === '1125863825380487248') {
            try {
                // emoji id: 1117259763365982249
                await message.react('1117259763365982249');
            } catch (e) {
                logger.info(e);
            }
        }
    },
};
