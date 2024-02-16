const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, ChannelType } = require('discord.js');
const { ActionRowBuilder } = require('@discordjs/builders');
const fs = require('fs');
const selectables = require('../../resources/selectables.json');
const path = require('path');

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
        .setFooter({text: 'L.A.R. 2024'})
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
        .setFooter({text: 'L.A.R. 2024'})
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


        const response = await interaction.reply({
            components: [new ActionRowBuilder().addComponents(selectSystem)],
            ephemeral: true
        })

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000});

        collector.on('collect', async i => {
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
                await thread.members.add(i.user.id);
                await i.update({ephemeral: true, embeds: [generateConfirmationEmbed(requestID, thread)], components: []});
            }
        })
        

        //const embed = generateAlertEmbed(requestID, systemName, nearestPlanet, requestStatus, clientUserName, shipSize);
        //await interaction.followUp({embeds: [embed]});
    }
}