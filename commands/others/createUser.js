const { SlashCommandBuilder } = require("discord.js");
const logger = require("log4js").getLogger();

async function createUser(interaction, user) {
    // Create a new user //
    if (Array.isArray(user)) {
        logger.info("Creating multiple users...");
        const { cache, octokit } = require("../../index.js");
        const {
            githubOwner,
            githubRepo,
            githubDataPath,
            githubBranch,
        } = require("../../config.json");
        const Sequelize = require("sequelize");

        // Fetch the current name map from GitHub
        let name_map_response;
        try {
            name_map_response = await octokit.rest.repos.getContent({
                owner: githubOwner,
                repo: githubRepo,
                path: githubDataPath + "/_name_map.json",
                branch: githubBranch,
            });
        } catch (fetchError) {
            logger.info(`Failed to fetch _name_map.json: ${fetchError}`);
            return;
        }

        const names = JSON.parse(
            Buffer.from(name_map_response.data.content, "base64").toString(
                "utf-8"
            )
        );

        // Generate unique IDs and update names
        const idDigits = 10;
        const idLower = Math.pow(10, idDigits - 1);
        const idUpper = Math.pow(10, idDigits) - 1;

        for (const singleUser of user) {
            // Check if user already exists
            const existingUser = await cache.users.findOne({
                where: Sequelize.where(
                    Sequelize.fn("LOWER", Sequelize.col("name")),
                    singleUser
                ),
            });
            const addedUser = Object.values(names).includes(singleUser);
            if (existingUser || addedUser) continue;

            let userId = 0;
            while (userId === 0) {
                const randomId =
                    Math.floor(Math.random() * (idUpper - idLower + 1)) +
                    idLower;
                if (!Object.keys(names).includes(randomId)) {
                    userId = randomId;
                }
            }
            names[userId] = singleUser;
        }
        const changes = [
            {
                path: githubDataPath + "/_name_map.json",
                content: JSON.stringify(names, null, "\t"),
            },
        ];

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
            logger.info(
                `Something went wrong while getting the latest commit SHA: \n${getRefErr}`
            );
            return;
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
            logger.info(
                `Something went wrong while getting the latest commit: \n${getCommitErr}`
            );
            return;
        }

        let newTree;
        try {
            // Create a new tree with the changes
            newTree = await octokit.git.createTree({
                owner: githubOwner,
                repo: githubRepo,
                base_tree: treeSha,
                tree: changes.map((change) => ({
                    path: change.path,
                    mode: "100644",
                    type: "blob",
                    content: change.content,
                })),
            });
        } catch (createTreeErr) {
            logger.info(
                `Something went wrong while creating a new tree: \n${createTreeErr}`
            );
            return;
        }

        let newCommit;
        try {
            // Create a new commit with this tree
            newCommit = await octokit.git.createCommit({
                owner: githubOwner,
                repo: githubRepo,
                message: `Users have been merged into the database.`,
                tree: newTree.data.sha,
                parents: [commitSha],
            });
        } catch (createCommitErr) {
            logger.info(
                `Something went wrong while creating a new commit: \n${createCommitErr}`
            );
            return;
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
            logger.info(
                `Something went wrong while updating the branch reference: \n${updateRefErr}`
            );
            return;
        }

        // Add all users to cache
        cache.updateUsers();

        logger.info(`All users have been added to the database.`);
    } else {
        const { cache, octokit } = require("../../index.js");
        const {
            githubOwner,
            githubRepo,
            githubDataPath,
            githubBranch,
        } = require("../../config.json");
        const Sequelize = require("sequelize");

        // Check if user already exists
        if (
            await cache.users.findOne({
                where: Sequelize.where(
                    Sequelize.fn("LOWER", Sequelize.col("name")),
                    interaction.options.getString("username").toLowerCase()
                ),
            })
        )
            return await interaction.editReply(
                ":x: Couldn't create the user: this user already exists"
            );

        // Add user to github
        let name_map_response;
        try {
            name_map_response = await octokit.rest.repos.getContent({
                owner: githubOwner,
                repo: githubRepo,
                path: githubDataPath + "/_name_map.json",
                branch: githubBranch,
            });
        } catch (fetchError) {
            logger.info(`Failed to fetch _name_map.json: ${fetchError}`);
            return await interaction.editReply(
                ":x: Something went wrong while creating the user; please try again later"
            );
        }

        const names = JSON.parse(
            Buffer.from(name_map_response.data.content, "base64").toString(
                "utf-8"
            )
        );

        const idDigits = 10;
        const idLower = Math.pow(10, idDigits - 1);
        const idUpper = Math.pow(10, idDigits) - 1;

        let userId = 0;
        while (userId === 0) {
            const randomId =
                Math.floor(Math.random() * (idUpper - idLower + 1)) + idLower;
            if (!Object.keys(names).includes(randomId)) {
                userId = randomId;
            }
        }

        names[userId] = interaction.options.getString("username");
        const changes = [
            {
                path: githubDataPath + "/_name_map.json",
                content: JSON.stringify(names, null, "\t"),
            },
        ];

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
            logger.info(
                `Something went wrong while getting the latest commit SHA: \n${getRefErr}`
            );
            return await interaction.editReply(
                ":x: Something went wrong while creating the user; please try again later"
            );
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
            logger.info(
                `Something went wrong while getting the latest commit: \n${getCommitErr}`
            );
            return await interaction.editReply(
                ":x: Something went wrong while creating the user; please try again later"
            );
        }

        let newTree;
        try {
            // Create a new tree with the changes
            newTree = await octokit.git.createTree({
                owner: githubOwner,
                repo: githubRepo,
                base_tree: treeSha,
                tree: changes.map((change) => ({
                    path: change.path,
                    mode: "100644",
                    type: "blob",
                    content: change.content,
                })),
            });
        } catch (createTreeErr) {
            logger.info(
                `Something went wrong while creating a new tree: \n${createTreeErr}`
            );
            return await interaction.editReply(
                ":x: Something went wrong while creating the user; please try again later"
            );
        }

        let newCommit;
        try {
            // Create a new commit with this tree
            newCommit = await octokit.git.createCommit({
                owner: githubOwner,
                repo: githubRepo,
                message: `${interaction.user.tag
                    } created a new user: ${interaction.options.getString(
                        "username"
                    )}`,
                tree: newTree.data.sha,
                parents: [commitSha],
            });
        } catch (createCommitErr) {
            logger.info(
                `Something went wrong while creating a new commit: \n${createCommitErr}`
            );
            return await interaction.editReply(
                ":x: Something went wrong while creating the user; please try again later"
            );
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
            logger.info(
                `Something went wrong while updating the branch reference: \n${updateRefErr}`
            );
            return await interaction.editReply(
                ":x: Something went wrong while creating the user; please try again later"
            );
        }

        // Add user to cache
        cache.updateUsers();

        logger.info(
            `${interaction.user.tag} (${interaction.user.id
            }) created a new user: ${interaction.options.getString("username")}`
        );
        await interaction.editReply(
            `:white_check_mark: Successfully created the user: **${interaction.options.getString(
                "username"
            )}**. You can now submit records.`
        );
        return;
    }
}

module.exports = {
    createUser,
    enabled: true,
    data: new SlashCommandBuilder()
        .setName("createuser")
        .setDescription("Debug command to manually create a user in case the record command fails to.")
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("The username of the user to create")
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        return await createUser(interaction, interaction.options.getString("username"));
    },
};
