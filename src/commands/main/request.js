const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ComponentType, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const serviceType = [
    {
        label: 'Ammo',
        value: 'Ammo',
    },
    {
        label: 'Armor',
        value: 'Armor',
    },
    {
        label: 'Medical',
        value: 'Medical',
    },
    {
        label: 'Vehicle',
        value: 'Vehicle',
    },
    {
        label: 'Weapon',
        value: 'Weapon',
    },
]

const starSystems = [
    {
        label: 'Stanton',
        value: 'Stanton'
    },
    {
        label: 'Pyro',
        value: 'Pyro'
    },
]

const stantonLocations = [
    {
        label: 'Orison',
        value: 'Orison'
    },
    {
        label: 'Hurston',
        value: 'Hurston'
    },
    {
        label: 'MicroTech',
        value: 'MicroTech'
    },
    {
        label: 'ArcCorp',
        value: 'ArcCorp'
    },
]

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }  

function createSelector(id, array, multi) {
    const options = array.map(item => {
        return new StringSelectMenuOptionBuilder()
            .setValue(item.value)
            .setLabel(item.label)
    });

    if(multi) {
        return new ActionRowBuilder()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId(id)
                .setMaxValues(array.length)
                .setPlaceholder('Select an option...')
                .addOptions(options));
    } else {
        return new ActionRowBuilder()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId(id)
                .setPlaceholder('Select an option...')
                .addOptions(options));
    }
}

async function sendModal(interaction, 
                        clientUserName, 
                        orderedService, 
                        systemName, 
                        nearestPlanet, 
                        requestID) {

    const configPath = path.resolve(__dirname, '../../config.json');
    const configFileContent = fs.readFileSync(configPath, 'utf8');
    const configFile = JSON.parse(configFileContent);
                        
    const client = interaction.client;
    const alertChannel = await client.channels.fetch(configFile.alertChannel);

    let embed = new EmbedBuilder()
        .setAuthor({
            name: `Logistics Active Resupply #${requestID}`,
        })
        .addFields(
        {
            name: "System",
            value: `${systemName}`,
            inline: true
        },
        {
            name: "Nearest Planet",
            value: `${nearestPlanet}`,
            inline: true
        },
        {
            name: "Service",
            value: `${orderedService.join('\n')}`,
            inline: true
        },
        {
            name: "Client",
            value: `${clientUserName}`,
            inline: true
        },
        {
            name: "Team",
            value: `0/6`,
            inline: true
        },
        {
            name: "Status",
            value: "asd",
            inline: true
        },
        {
            name: "Thread",
            value: "asd",
            inline: false
        },
        {
            name: "Team Lead",
            value: "asd",
            inline: false
        },
    )
        .setThumbnail("https://cdn.discordapp.com/avatars/1207431210528411668/69ef505a61c1fb847f56aa83b7042421?size=1024")
        .setColor("#9b0002")
        .setFooter({
            text: "L.A.R. 2024",
        })
        .setTimestamp();
    
    const buttonSelect = await alertChannel.send({
        embeds: [embed],
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('request')
        .setDescription('Calls an active resupply to your current location.')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('rsi-handle')
                .setDescription('Your in-game name in Star Citizen.')
                .setRequired(true)),
    async execute(interaction) {

        const response = await interaction.reply({
            content: 'What resupply survices do you require?',
            ephemeral: true,
            components: [createSelector('service-selector', serviceType, true)],
        });

        const ingameName = interaction.options.getString('rsi-handle');
        const discordUser = interaction.user; //user tag

        const collectorFilter = i => i.user.id === interaction.user.id;

        let confirmation;

        try {
            confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

        } catch (e) {
            console.log(e);
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }

        await interaction.editReply({
            content: `${confirmation.values.join(', ')}\nWhat is your current location?`,
            components: [],
        });

        const requestID = Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
        sendModal(interaction, discordUser, confirmation.values, 'Stanton', 'MicroTech', requestID);
    }
};