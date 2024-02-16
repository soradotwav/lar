const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const fs = require('fs');
const path = require('path');

// Write a specific value to the config
function writeToConfig(property, value) {
    const configPath = path.resolve(__dirname, '../../config.json');
    
    try {
        const configData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configData);

        config[property] = value;

        const updatedConfigData = JSON.stringify(config, null, 2);
        fs.writeFileSync(configPath, updatedConfigData);

    } catch (e) {
        console.error('Error updating config file:', e);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Adjust L.A.R. settings.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        
        // Set User Channel Subcommand
        .addSubcommand(subcommand => 
            subcommand.setName('userchannel')
                .setDescription('Set the channel where users are able to create alerts.')
                .addChannelOption(option => 
                    option.setName('userchannel')
                        .setDescription('Select a channel...')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )

        // Set Logistics Channel Subcommand
        .addSubcommand(subcommand => 
            subcommand.setName('logichannel')
                .setDescription('Set the channel where the alerts will be shown to logistics.')
                .addChannelOption(option => 
                    option.setName('logichannel')
                        .setDescription('Select a channel...')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        
        // Set Logistics Role
        .addSubcommand(subcommand => 
            subcommand.setName('role')
                .setDescription('Set the role that will have access to the bots main functions.')
                .addRoleOption(option => 
                    option.setName('role')
                        .setDescription('Select the role for the alerts...')
                        .setRequired(true)
                )
        ),        
    async execute(interaction) {

        // Set channel logic
        if(interaction.options.getSubcommand() === 'userchannel') {
            const userSelection = interaction.options._hoistedOptions[0];
            writeToConfig('userChannel', userSelection.value);

            interaction.reply({
                ephemeral: true,
                content: `User channel was set to ${userSelection.channel}.`
            });

        } else if (interaction.options.getSubcommand() === 'logichannel') {
            const userSelection = interaction.options._hoistedOptions[0];
            writeToConfig('logisticsChannel', userSelection.value);

            interaction.reply({
                ephemeral: true,
                content: `Logistics channel was set to ${userSelection.channel}.`
            });

        } else if (interaction.options.getSubcommand() === 'role') {
            const userSelection = interaction.options._hoistedOptions[0];
            writeToConfig('logisticsRole', userSelection.value);

            interaction.reply({
                ephemeral: true,
                content: `Logistics role was set to ${userSelection.role}.`
            });
        }
    }
};
