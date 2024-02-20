const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, ChannelType, ButtonStyle, PermissionsBitField } = require('discord.js');
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
    return i.member.permissionsIn(i.channel).has(PermissionsBitField.Flags.Administrator);
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
 * Takes an interaction input and outputs the current member of the interaction
 * @returns {member} Member of the current interaction.
 */
function getUser(interaction) {
    return interaction.member;
}

/**
 * Creates an alert embed message for a resupply request.
 * @param {string} requestID - The unique ID of the resupply request.
 * @param {string} systemName - The name of the system where resupplying is requested.
 * @param {string} nearestPlanet - The nearest planet to the request location.
 * @param {string} requestStatus - The current status of the resupply request.
 * @param {User} clientUserName - The user object of the client requesting resupplying.
 * @param {Array<String>} requestedCategories - All requested item types.
 * @param {string} requestType - The type of request that this alert is.
 * @param {Array<User>} handledBy - An array of the user objects of the logistics members responding to the request.
 * @param {string} rushOrder - The string containing information on whether or not the this order is a rush order.
 * @returns {EmbedBuilder} An EmbedBuilder object configured with the resupply request details.
 */
function generateAlertEmbed(requestID, systemName, nearestPlanet, requestStatus, clientUserName, requestedCategories, requestType, handledBy, rushOrder) {
    return new EmbedBuilder()
        .setAuthor({ name: 'Logistics Active Resupply' })
        .setDescription(`Resupply Request #${requestID}`)
        .addFields(
            { name: 'System', value: `${systemName}`, inline: true },
            { name: 'Nearest Planet', value: `${nearestPlanet}`, inline: true },
            { name: 'Status', value: `${requestStatus}`, inline: true },
            { name: 'Client', value: `${clientUserName}`, inline: true },
            { name: 'Request Type', value: `${requestType}`, inline: true},
            { name: 'Rush Order', value: `${rushOrder}`, inline: true},
            { name: 'Requested Categories', value: `${requestedCategories.join('\n')}`, inline: false},
            { name: 'Request being handled by', value: `${handledBy.length > 0 ? handledBy.join('\n') : 'N/A'}`, inline: false })
        .setThumbnail('https://cdn.discordapp.com/avatars/1207431210528411668/69ef505a61c1fb847f56aa83b7042421?size=1024')
        .setColor('#9b0002')
        .setFooter({text: `L.A.R. ${loreYear}`})
        .setTimestamp();
}

/**
 * Creates a confirmation embed message for a resupply request.
 * @param {string} requestID - The unique ID of the resupply request.
 * @param {ThreadChannel} openedThread - The thread channel opened for the resupply request.
 * @returns {EmbedBuilder} An EmbedBuilder object configured for confirming the resupply request receipt.
 */
function generateConfirmationEmbed(requestID, openedThread) {
    return new EmbedBuilder()
        .setAuthor({ name: 'Logistics Active Resupply'})
        .setTitle(`Resupply Request #${requestID}`)
        .setDescription('Your resupply request has been received and will be handled by a member of the logistics team very soon. \n\nPlease visit the thread below or under this channel on your left to discuss further details with your logistics contact to expedite your location and subsequent resupply.')
        .addFields({ name: 'Thread', value: `${openedThread}`, inline: false})
        .setThumbnail('https://cdn.discordapp.com/avatars/1207431210528411668/69ef505a61c1fb847f56aa83b7042421?size=1024')
        .setColor('#9b0002')
        .setFooter({text: `L.A.R. ${loreYear}`})
        .setTimestamp();
} 

/**
 * Creates a confirmation embed message for a resupply request.
 * @param {string} requestID - The unique ID of the resupply request.
 * @param {ThreadChannel} openedThread - The thread channel opened for the resupply request.
 * @returns {EmbedBuilder} An EmbedBuilder object configured for confirming the resupply request receipt.
 */
function generateThreadEmbed(requestID) {
    return new EmbedBuilder()
        .setAuthor({ name: 'Logistics Active Resupply'})
        .setTitle(`Resupply Request #${requestID}`)
        .setDescription(`Thank you for choosing Logistics Active Resupply as your quick resupply service. \n\nA member of the logistics team will very soon join this thread and discuss all needed details to be able to head to your location and get you the requested supplies.\n\nMake sure to mention the specific vehicles and/or weapons below this in chat for the logistics member to grab for you if you selected one of these options.\n\nIf, for whichever reason, you'd like to close this thread and cancel the request, simply press the button below. Thank you for your patience, and again, thank you for choosing L.A.R.`)
        .setThumbnail('https://cdn.discordapp.com/avatars/1207431210528411668/69ef505a61c1fb847f56aa83b7042421?size=1024')
        .setColor('#9b0002')
        .setFooter({text: `L.A.R. ${loreYear}`})
        .setTimestamp();
}

/**
 * Creates a confirmation embed message for closing a resupply request.
 * @param {string} state - The state in which this request was closed.
 * @param {User} user - The user object of the user closing the thread.
 * @returns {EmbedBuilder} An EmbedBuilder object configured for confirming the closing of the resupply request.
 */
function generateCloseThreadEmbed(state, user) {
    return new EmbedBuilder()
        .setAuthor({ name: 'Logistics Active Resupply'})
        .setDescription(`This request has been ${state} by ${user}. If this was a mistake, please reopen the request and a logistics member will be with you shortly.`)
        .setFooter({ text: `L.A.R. ${loreYear}` })
        .setTimestamp();
}

/**
 * Generates an embed with selectable item choices based on the supply types provided
 * @param {Array<String>} supplyTypes - The types of supplies to include in the choices
 * @returns {EmbedBuilder} The embed containing selectable item choices
 */
function generateItemChoicesEmbed(supplyTypes) {
    const possibleFields = [];

    if(supplyTypes.includes('Ammunition')) {
        possibleFields.push({ name: 'Selectable Ammunition', value: `• ${selectables.ammunition.join('\n• ')}`, inline: true })
    }

    if(supplyTypes.includes('Weaponry')) {
        possibleFields.push({ name: 'Selectable Weapons', value: `• ${selectables.weaponry.join('\n• ')}`, inline: true })
    }

    if(supplyTypes.includes('Vehicles')) {
        possibleFields.push({ name: 'Selectable Vehicles', value: `• ${selectables.vehicles.join('\n• ')}`, inline: true })
    }

    return new EmbedBuilder()
        .setAuthor({ name: 'Logistics Active Resupply'})
        .setTitle(`Requestable items`)
        .setDescription(`Due to you selecting options with multiple specific choices, such as weapons,  vehicles, or ammunition, please view the items you can request below and send the ones you'd like to request in this thread for the member of the logistics team handling your request.`)
        .setThumbnail('https://cdn.discordapp.com/avatars/1207431210528411668/69ef505a61c1fb847f56aa83b7042421?size=1024')
        .addFields(possibleFields)
        .setColor('#9b0002')
        .setFooter({text: `L.A.R. ${loreYear}`})
        .setTimestamp();
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
    .setStyle(ButtonStyle.Primary);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resupply')
        .setDescription('Calls an active resupply to your current location.')
        .setDMPermission(false),

    async execute(interaction) {
        const client = interaction.client;
        const requestID = generateRandomID();
        let systemName;
        let nearestPlanet;
        let supplyTypes;
        let rushOrder;
        let requestClient;
        const responderUser = [];

        const config = await readConfigFile();

        try {
            // Check for proper channel usage
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
                const selectMenuCollector = selectMenuResponse.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 300_000});
                
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
                        
                        // Creating the thread for the alert, adding the user to it and sending the welcome message
                        const userChannel = await client.channels.fetch(config.userChannel);
                        const thread = await userChannel.threads.create({ name: `Resupply #${requestID}`, type: ChannelType.PrivateThread });
    
                        const threadWelcomeMessage = await thread.send({ embeds: [generateThreadEmbed(requestID)], 
                            components: [new ActionRowBuilder().addComponents(threadCancelButton)]});
                        const threadDeleteButtonCollector = await threadWelcomeMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 7_200_000});
    
                        await thread.members.add(requestClient.id);
                        await i.update({ephemeral: true, embeds: [generateConfirmationEmbed(requestID, thread)], components: []});
    
                        // Sending alert to the logistics channel and registering all buttons
                        const logisticsChannel = await client.channels.fetch(config.logisticsChannel);
                        const alertMessage = await logisticsChannel.send({ embeds: [generateAlertEmbed(requestID, systemName, nearestPlanet, 'Open', requestClient, supplyTypes, 'Resupply', responderUser, rushOrder)], components: [new ActionRowBuilder().addComponents(respondButton)]});
                        
                        if(supplyTypes.includes('Ammunition') ||
                            supplyTypes.includes('Weaponry') ||
                            supplyTypes.includes('Vehicles')) {
                                await thread.send({embeds: [generateItemChoicesEmbed(supplyTypes)]});
                            }
                        
                        const alertRespondButtonCollector = await alertMessage.createMessageComponentCollector({componentType: ComponentType.Button, time: 7_200_000});
    
                        const archiveChannel = await client.channels.fetch(config.archiveChannel);
    
                        // Handling of user cancellation
                        threadDeleteButtonCollector.on('collect', async i => {
                            const currentUser = await i.guild.members.fetch(i.member.id);

                            if(i.customId === 'threadCancelButton') {
                                if(currentUser.user.id !== requestClient.id) {
                                    await i.reply({ephemeral: true, content: `You are not the client of this request and are thus not able to cancel it. If you are part of the response team and need to cancel this request, please use the Abort button in ${logisticsChannel}`});
                                } else {
                                    await i.reply({ephemeral: true, content: 'You have sucessfully cancelled this alert. This thread is now locked.'});
                                    await threadWelcomeMessage.edit({embeds: threadWelcomeMessage.embeds, components: []});
                                    await thread.send({embeds: [generateCloseThreadEmbed('cancelled', currentUser)]});
                                    alertMessage.delete();
                                    thread.setArchived(true);
                                    archiveChannel.send({embeds: [generateAlertEmbed(requestID, systemName, nearestPlanet, 'Cancelled', requestClient, supplyTypes, 'Resupply', responderUser, rushOrder)]});
                                }
                            }
                        })

                        // Handling of logistics team interaction with the alert
                        alertRespondButtonCollector.on('collect', async i => {
                            if(!i.member.roles.cache.has(config.logisticsRole) && !isAdmin) {
                                await i.reply({ephemeral: true, content: 'You do not have the permission to interact with this.'});
                                return;
                            }
    
                            const currentUser = await i.guild.members.fetch(i.member.id);
                            
                            // Creating a list of all responders to the alert
                            if(!responderUser.includes(currentUser)) {
                                responderUser.push(currentUser);
                            }
    
                            const allThreadMembers = await thread.members.fetch();
    
                            // Handling of respond function and unwanted members
                            if(i.customId === 'respondButton') {
    
                                if(allThreadMembers.has(currentUser.user.id) || currentUser.user.id == requestClient.id) {
                                    i.reply({ephemeral: true, content: 'You have already responded to this thread or are the client of it.'});
        
                                } else {
                                    thread.members.add(currentUser.user.id);
                                    i.reply({ ephemeral: true, content: `You have succesfully replied to the request and have been added to ${thread}.`});
    
                                    alertMessage.edit({embeds: [generateAlertEmbed(requestID, systemName, nearestPlanet, 'In progress...', requestClient, supplyTypes, 'Resupply', responderUser, rushOrder)], 
                                        components: [new ActionRowBuilder().addComponents([respondButton, abortButton, completeButton])]});
                                }

                            // Handling of abort function and unwanted members
                            } else if (i.customId === 'abortButton') {
    
                                if(!allThreadMembers.has(currentUser.user.id)) {
                                    i.reply({ephemeral: true, content: 'You are not part of this request.'});
        
                                } else {
                                    await i.reply({ephemeral: true, content: 'You have sucessfully closed this alert. This thread is now locked.'});
                                    await threadWelcomeMessage.edit({embeds: threadWelcomeMessage.embeds, components: []});
                                    await thread.send({embeds: [generateCloseThreadEmbed('aborted', currentUser)]});
                                    alertMessage.delete();
                                    thread.setArchived(true);
    
                                    archiveChannel.send({embeds: [generateAlertEmbed(requestID, systemName, nearestPlanet, 'Aborted', requestClient, supplyTypes, 'Resupply', responderUser, rushOrder)]});
                                }

                            // Handling of complete function and unwanted members
                            } else if (i.customId === 'completeButton') {
    
                                if(!allThreadMembers.has(currentUser.user.id)) {
                                    i.reply({ephemeral: true, content: 'You are not part of this request.'});
        
                                } else {
                                    await i.reply({ephemeral: true, content: 'You have sucessfully closed this alert. This thread is now locked.'});
                                    await threadWelcomeMessage.edit({embeds: threadWelcomeMessage.embeds, components: []});
                                    await thread.send({embeds: [generateCloseThreadEmbed('completed', currentUser)]});
                                    alertMessage.delete();
                                    thread.setArchived(true);
    
                                    const successEmbed = generateAlertEmbed(requestID, systemName, nearestPlanet, 'Completed', requestClient, supplyTypes, 'Resupply', responderUser, rushOrder);
                                    successEmbed.setColor('#57F287');
                                    archiveChannel.send({embeds: [successEmbed]});
                                }
                            }
                        })
                    }
                })
            }
        } catch (error) {
            await interaction.channel.send({ephemeral: true, content: 'Something went wrong, please try again. If this keeps happening, please contact an admin.'})
            console.log(error);
        }
    }
};