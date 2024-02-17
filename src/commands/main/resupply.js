const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, ChannelType, ButtonStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const fs = require('fs');
const selectables = require('../../resources/selectables.json');
const path = require('path');

const loreYear = new Date().getFullYear() + 930;

/**
 * Generates a random ID within a specified range.
 * @returns {number} A random ID number between 1,000,000 and 9,999,999.
 */
function generateRandomID() {
    const min = 1000000;
    const max = 9999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Reads and parses the configuration file.
 * @returns {Object|null} The parsed JSON object from the config file, or null if an error occurs.
 */
function readConfigFile() {
    try {
      const rawdata = fs.readFileSync(path.resolve(__dirname, '../../config.json'));
      return JSON.parse(rawdata);
    } catch (error) {
      console.error('Error reading config file:', error);
      return null;
    }
}

/**
 * Checks if the user of an interaction is an administrator or not.
 * @returns {boolean} True or false depending on if the user has admin permissions.
 */
function isAdmin(i) {
    return i.member.permissionsIn(i.channel).has("ADMINISTRATOR")
}

function getUser(interaction) {
    return interaction.member;
}


// Select Menu for System
const selectSystem = new StringSelectMenuBuilder()
.setCustomId('selectSystem')
.setPlaceholder('Select your current system...')
.addOptions(
    selectables.starSystems.map(object => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(object.label)
            .setValue(object.label)
    })
);

// Select Menu for Nearest Planet
const selectPlanet = new StringSelectMenuBuilder()
.setCustomId('selectPlanet')
.setPlaceholder('Select the nearest planet to you...')
.addOptions(
    selectables.stantonLocations.map(object => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(object.label)
            .setValue(object.label)
    })
);

// Select Menu for Rush Order
const isRushOrder = new StringSelectMenuBuilder()
.setCustomId('rushOrder')
.setPlaceholder('Is this request a rush order?')
.addOptions([
    new StringSelectMenuOptionBuilder().setLabel('Yes').setValue('Yes'),
    new StringSelectMenuOptionBuilder().setLabel('No').setValue('No')
]);

// Select Menu for Supply Types
const selectSupplyTypes = new StringSelectMenuBuilder()
.setCustomId('supplyTypes')
.setPlaceholder('Select what supplies you are requesting...')
.setMinValues(1)
.setMaxValues(selectables.supplyTypes.length)
.addOptions(
    selectables.supplyTypes.map(object => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(object.label)
            .setValue(object.label)
    })
);

// Select Menu for Weapons
const selectWeapons = new StringSelectMenuBuilder()
.setCustomId('selectWeapons')
.setPlaceholder('Select what weaponary you are requesting...')
.setMinValues(1)
.setMaxValues(selectables.supplyTypes.length)
.addOptions(
    selectables.weapons.map(object => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(object.label)
            .setValue(object.label)
    })
);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resupply')
        .setDescription('Calls an active resupply to your current location.')
        .setDMPermission(false),
    async execute(interaction) {
        const client = interaction.client;
        const requestID = generateRandomID();
        let systemName;
        let supplyTypes;
        let rushOrder;
        let nearestPlanet;
        let requestClient;

        const config = await readConfigFile();

        if (interaction.channel.id != config.userChannel && !isAdmin(interaction)) {

            const correctChannel = await client.channels.fetch(config.userChannel);
            interaction.reply({ephemeral: true, content: `You are not allowed to use this command in this channel. Please try again in ${correctChannel} or contact a system administrator.`});

        } else {

            // Response to initial command
            const selectMenuResponse = await interaction.reply({
                components: [new ActionRowBuilder().addComponents(selectSystem)],
                ephemeral: true
            })

            // Collector of responses for Select Menu's
            const selectMenuCollector = selectMenuResponse.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000});
            
            selectMenuCollector.on('collect', async i => {
                // System selection response storage and sending of planet selection
                if(i.customId === 'selectSystem') {
                    requestClient = getUser(interaction);
                    systemName = i.values[0];
                    await i.update({ components: [new ActionRowBuilder().addComponents(selectPlanet)], ephemeral: true });
        
                // Planet selection response storage and sending rush order selection
                } else if (i.customId === 'selectPlanet') {
                    nearestPlanet = i.values[0];
                    await i.update({ components: [new ActionRowBuilder().addComponents(isRushOrder)], ephemeral: true});

                // Rush order response and sending supply type selection
                } else if (i.customId === 'rushOrder') {
                    rushOrder = i.values[0];
                    await i.update({components: [new ActionRowBuilder().addComponents(selectSupplyTypes)], ephemeral: true});
                
                // Supply type response and 
                } else if (i.customId === 'supplyTypes') {
                    supplyTypes = i.values;
                }
            })
        }
    }
};