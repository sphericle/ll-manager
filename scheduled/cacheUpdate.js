const { scheduleCacheUpdate } = require('../config.json')
const { parseUsers } = require('../others/gitUtils.js')
const { createUser } = require('../commands/records/records.js')
const logger = require('log4js').getLogger();

module.exports = {
	name: 'updateCache',
	cron: scheduleCacheUpdate,
	enabled: true,
	async execute() {
		const { cache } = require('../index.js');
		cache.updateLevels();


		const users = await parseUsers();
		if (users.length > 0) {
			logger.info('Scheduled - Parsing users...');
			await cache.users.destroy({ where: {} });
			try {
				await cache.users.bulkCreate(users);
				logger.info(`Scheduled - Successfully updated ${users.length} cached users.`);
			} catch (error) {
				logger.error(`Scheduled - Couldn't update cached users, something went wrong with sequelize: ${error}`);
			}

			try {
				await createUser('_', users);
				logger.info(`Scheduled - Added ${users.length} users.`);
			} catch (error) {
				logger.error(`Scheduled - Couldn't add users, something went wrong with sequelize: ${error}`);
			}
		}
	},
};