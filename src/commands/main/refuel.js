const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, ChannelType, ButtonStyle } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const fs = require('fs');
const selectables = require('../../resources/selectables.json');
const path = require('path');

const loreYear = new Date().getFullYear() + 930;

function generateRandomID() {
    const min = 1000000;
    const max = 9999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function readConfigFile() {
    try {
      const rawdata = fs.readFileSync(path.resolve(__dirname, '../../config.json'));
      return JSON.parse(rawdata);
    } catch (error) {
      console.error('Error reading config file:', error);
      return null;
    }
  }

function generateAlertEmbed(requestID, systemName, nearestPlanet, requestStatus, clientUserName, shipSize) {
    return new EmbedBuilder()
        .setAuthor({ name: 'Logistics Active Resupply' })
        .setDescription(`Refuel Request #${requestID}`)
        .addFields(
            { name: 'System', value: `${systemName}`, inline: true },
            { name: 'Nearest Planet', value: `${nearestPlanet}`, inline: true },
            { name: 'Status', value: `${requestStatus}`, inline: true },
            { name: 'Client', value: `${clientUserName}`, inline: true },
            { name: 'Ship Size', value: `${shipSize}`, inline: true},
            { name: 'Thread', value: `asd`, inline: false },
            { name: 'Request being handled by', value: `N/A`, inline: false })
        .setThumbnail('https://cdn.discordapp.com/avatars/1207431210528411668/69ef505a61c1fb847f56aa83b7042421?size=1024')
        .setColor('#9b0002')
        .setFooter({text: `L.A.R. ${loreYear}`})
        .setTimestamp();
}

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

        const clientCancelButton = new ButtonBuilder()
                .setCustomId('clientCancelButton')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger);


        const selectMenuResponse = await interaction.reply({
            components: [new ActionRowBuilder().addComponents(selectSystem)],
            ephemeral: true
        })

        const selectMenuCollector = selectMenuResponse.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000});

        selectMenuCollector.on('collect', async i => {
            if(i.customId === 'selectSystem') {
                systemName = i.values[0];

                await i.update({ components: [new ActionRowBuilder().addComponents(selectPlanet)], ephemeral: true });

            } else if (i.customId === 'selectPlanet') {
                nearestPlanet = i.values[0];
                await i.update({ components: [new ActionRowBuilder().addComponents(selectShipSize)], ephemeral: true});

            } else if (i.customId === 'selectShipSize') {
                shipSize = i.values[0];

                const alertChannel = await client.channels.fetch(readConfigFile().alertChannel);
                const thread = await alertChannel.threads.create({ name: `Request #${requestID}`, type: ChannelType.PrivateThread });

                const threadWelcomeMessage = await thread.send({ embeds: [generateThreadEmbed(requestID)], components: [new ActionRowBuilder().addComponents(clientCancelButton)]});
                const buttonCollector = await threadWelcomeMessage.createMessageComponentCollector({ componentType: ComponentType.Button });

                await thread.members.add(i.user.id);
                await i.update({ephemeral: true, embeds: [generateConfirmationEmbed(requestID, thread)], components: []});

                buttonCollector.on('collect', async i => {
                    if(i.customId === 'clientCancelButton') {
                        thread.delete();
                    }
                })
            }
        })

        //const embed = generateAlertEmbed(requestID, systemName, nearestPlanet, requestStatus, clientUserName, shipSize);
    }
}