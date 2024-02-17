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
 * Checks if the user of an interaction is an administrator or not.
 * @returns {boolean} True or false depending on if the user has admin permissions.
 */
function isAdmin(i) {
    return i.member.permissionsIn(i.channel).has("ADMINISTRATOR")
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
 * Creates an alert embed message for a refuel request.
 * @param {string} requestID - The unique ID of the refuel request.
 * @param {string} systemName - The name of the system where refueling is requested.
 * @param {string} nearestPlanet - The nearest planet to the request location.
 * @param {string} requestStatus - The current status of the refuel request.
 * @param {string} clientUserName - The username of the client requesting refueling.
 * @param {string} shipSize - The size category of the ship requiring refueling.
 * @returns {EmbedBuilder} An EmbedBuilder object configured with the refuel request details.
 */
function generateAlertEmbed(requestID, systemName, nearestPlanet, requestStatus, clientUserName, shipSize, requestType, handledBy) {
    return new EmbedBuilder()
        .setAuthor({ name: 'Logistics Active Resupply' })
        .setDescription(`Refuel Request #${requestID}`)
        .addFields(
            { name: 'System', value: `${systemName}`, inline: true },
            { name: 'Nearest Planet', value: `${nearestPlanet}`, inline: true },
            { name: 'Status', value: `${requestStatus}`, inline: true },
            { name: 'Client', value: `${clientUserName}`, inline: true },
            { name: 'Ship Size', value: `${shipSize}`, inline: true},
            { name: 'Request Type', value: `${requestType}`, inline: true},
            { name: 'Request being handled by', value: `${handledBy}`, inline: false })
        .setThumbnail('https://cdn.discordapp.com/avatars/1207431210528411668/69ef505a61c1fb847f56aa83b7042421?size=1024')
        .setColor('#9b0002')
        .setFooter({text: `L.A.R. ${loreYear}`})
        .setTimestamp();
}

/**
 * Creates a confirmation embed message for a refuel request.
 * @param {string} requestID - The unique ID of the refuel request.
 * @param {ThreadChannel} openedThread - The thread channel opened for the refuel request.
 * @returns {EmbedBuilder} An EmbedBuilder object configured for confirming the refuel request receipt.
 */
function generateConfirmationEmbed(requestID, openedThread) {
    return new EmbedBuilder()
        .setAuthor({ name: 'Logistics Active Resupply'})
        .setTitle(`Refuel Request #${requestID}`)
        .setDescription('Your refuel request has been received and will be handled by a member of the logistics team very soon. \n\nPlease visit the thread below or under this channel on your left to discuss further details with your logistics contact to expedite your location and subsequent refueling.')
        .addFields({ name: 'Thread', value: `${openedThread}`, inline: false})
        .setThumbnail('https://cdn.discordapp.com/avatars/1207431210528411668/69ef505a61c1fb847f56aa83b7042421?size=1024')
        .setColor('#9b0002')
        .setFooter({text: `L.A.R. ${loreYear}`})
        .setTimestamp();
}  

/**
 * Creates a confirmation embed message for a refuel request.
 * @param {string} requestID - The unique ID of the refuel request.
 * @param {ThreadChannel} openedThread - The thread channel opened for the refuel request.
 * @returns {EmbedBuilder} An EmbedBuilder object configured for confirming the refuel request receipt.
 */
function generateThreadEmbed(requestID) {
    return new EmbedBuilder()
        .setAuthor({ name: 'Logistics Active Resupply'})
        .setTitle(`Refuel Request ${requestID}`)
        .setDescription(`Thank you for choosing Logistics Active Resupply as your quick refueling service. \n\nA member of the logistics team will very soon join this thread and discuss all needed details to be able to head to your location and get you fueled back up and flying in the verse again in no time.\n\nIf, for whichever reason, you'd like to close this thread and cancel the request, simply press the button below. Thank you for your patience, and again, thank you for choosing L.A.R.`)
        .setThumbnail('https://cdn.discordapp.com/avatars/1207431210528411668/69ef505a61c1fb847f56aa83b7042421?size=1024')
        .setColor('#9b0002')
        .setFooter({text: `L.A.R. ${loreYear}`})
        .setTimestamp();
}

module.exports = {
    // Specifies command
    data: new SlashCommandBuilder()
        .setName('refuel')
        .setDescription('Request a refueling operation to your current location.')
        .setDMPermission(false),
    
    async execute(interaction) {
        const client = interaction.client;
        const requestID = generateRandomID();
        let systemName;
        let nearestPlanet;
        const requestStatus = 'Open';
        const clientDiscordUser = 'soradotwav';
        let shipSize;

        const config = readConfigFile();

        // Check for proper channel usage
        if(interaction.channel.id != config.userChannel && interaction.channel.id != config.logisticsChannel && !isAdmin(interaction)) {

            const correctChannel = await client.channels.fetch(config.userChannel);
            interaction.reply({ephemeral: true, content: `You are not allowed to use this command in this channel. Please try again in ${correctChannel} or contact a system administrator.`});

        } else {
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

            // Select Menu for Ship Size
            const selectShipSize = new StringSelectMenuBuilder()
                .setCustomId('selectShipSize')
                .setPlaceholder('Select the size of your ship...')
                .addOptions(
                    selectables.shipSize.map(object => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(object.label)
                            .setValue(object.label)
                    })
                );
    
            // Cancel Button that deletes current thread
            const threadCancelButton = new ButtonBuilder()
                .setCustomId('threadCancelButton')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger);

            const abortButton = new ButtonBuilder()
                .setCustomId('abortButton')
                .setLabel('Abort')
                .setStyle(ButtonStyle.Danger);

            const respondButton = new ButtonBuilder()
                .setCustomId('respondButton')
                .setLabel('Respond')
                .setStyle(ButtonStyle.Success);

            const completeButton = new ButtonBuilder()
                    .setCustomId('completeButton')
                    .setLabel('Complete')
                    .setStyle(ButtonStyle.Success);

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
                    systemName = i.values[0];
                    await i.update({ components: [new ActionRowBuilder().addComponents(selectPlanet)], ephemeral: true });
        
                // Planet selection response storage and sending of ship size selection
                } else if (i.customId === 'selectPlanet') {
                    nearestPlanet = i.values[0];
                    await i.update({ components: [new ActionRowBuilder().addComponents(selectShipSize)], ephemeral: true});

                // Ship size storage and handling the issued thread
                } else if (i.customId === 'selectShipSize') {
                    shipSize = i.values[0];

                    const userChannel = await client.channels.fetch(config.userChannel);
                    const thread = await userChannel.threads.create({ name: `Request #${requestID}`, type: ChannelType.PrivateThread });

                    const threadWelcomeMessage = await thread.send({ embeds: [generateThreadEmbed(requestID)], 
                        components: [new ActionRowBuilder().addComponents(threadCancelButton)]});
                    const threadDeleteButtonCollector = await threadWelcomeMessage.createMessageComponentCollector({ componentType: ComponentType.Button });

                    await thread.members.add(i.user.id);
                    await i.update({ephemeral: true, embeds: [generateConfirmationEmbed(requestID, thread)], components: []});

                    const logisticsChannel = await client.channels.fetch(config.logisticsChannel);
                    const alertMessage = await logisticsChannel.send({ embeds: [generateAlertEmbed(requestID, systemName, nearestPlanet, 'Open', i.user, shipSize, 'Refuel', 'N/A')], components: [new ActionRowBuilder().addComponents(respondButton)]});
                    const alertRespondButtonCollector = await alertMessage.createMessageComponentCollector({componentType: ComponentType.Button});

                    threadDeleteButtonCollector.on('collect', async i => {
                        if(i.customId === 'threadCancelButton') {
                            thread.delete();
                            alertMessage.delete(); // For now original alert gets deleted, later most likely archive it in some way
                        }
                    })

                    alertRespondButtonCollector.on('collect', async i => {
                        if(!i.member.roles.cache.has(config.logisticsRole) && !isAdmin) {
                            await i.reply({ephemeral: true, content: 'You do not have the permission to interact with this.'});
                            return;
                        }

                        const archiveChannel = await client.channels.fetch(config.archiveChannel);

                        if (i.customId === 'respondButton') {
                            
                            if(!thread.members.fetch(i.user.id)) { //REMOVE ! WHEN DONE TESTING
                                await i.reply({ ephemeral: true, content: 'You are already in this thread!'});

                            } else {
                                await thread.members.add(i.user.id);
                                await i.reply({ ephemeral: true, content: `You have succesfully replied to the request and have been added to ${thread}.`});

                                alertMessage.edit({embeds: [generateAlertEmbed(requestID, systemName, nearestPlanet, 'In progress...', i.user, shipSize, 'Refuel', i.user)], 
                                    components: [new ActionRowBuilder().addComponents([abortButton, completeButton])]});
                            } 
                        } else if (i.customId === 'abortButton') {
                            await thread.delete();
                            await alertMessage.delete();

                            archiveChannel.send({embeds: [generateAlertEmbed(requestID, systemName, nearestPlanet, 'Aborted', i.user, shipSize, 'Refuel', i.user)]});
                            
                        } else if (i.customId === 'completeButton') {
                            thread.delete();
                            alertMessage.delete();

                            const successEmbed = generateAlertEmbed(requestID, systemName, nearestPlanet, 'Completed', i.user, shipSize, 'Refuel', i.user);
                            successEmbed.setColor('#57F287');
                            archiveChannel.send({embeds: [successEmbed]});
                        }
                    })
                }})
            }
    }
}