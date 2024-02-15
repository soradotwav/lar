const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, ActionRowBuilder, ComponentType } = require('discord.js');

async function initialQuestion(interaction) {
    const ingameName = interaction.options.getString('rsi-handle');
    const discordUser = interaction.user; //user tag

    const selectionOptions = [
        {
            label: 'Ammo',
            value: 'AMMO'
        },
        {
            label: 'Armor',
            value: 'ARMOR'
        },
        {
            label: 'Medical',
            value: 'MEDICAL'
        },
        {
            label: 'Vehicle',
            value: 'VEHICLE'
        },
        {
            label: 'Weapon',
            value: 'WEAPON'
        },
    ]

    const resupplyTypeSelector = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(interaction.id)
            .setPlaceholder('Select Request Type')
            .setMinValues(1)
            .setMaxValues(selectionOptions.length)
            .addOptions(
                selectionOptions.map((selType) => {
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(selType.label)
                        .setValue(selType.value);
                })
            )
    )

    const reply = await interaction.reply({
        content: `Hello ${discordUser}, do you confirm that your username is ${ingameName}`,
        ephemeral: true,
        components: [resupplyTypeSelector],
    });

    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id && i.customId == interaction.id,
        time: 60_000,
    })

    collector.on('collect', (interaction) => {
        console.log(interaction.values);
    })
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('request')
        .setDescription('Calls an active resupply to your current location.')
        .addStringOption(option =>
            option.setName('rsi-handle')
                .setDescription('Your in-game name in Star Citizen.')
                .setRequired(true)),
    execute(interaction) {
        initialQuestion(interaction);
    }
};