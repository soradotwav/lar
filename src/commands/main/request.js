const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

const serviceType = [
    {
        label: 'Ammo',
        value: 'ammo',
    },
    {
        label: 'Armor',
        value: 'armor',
    },
    {
        label: 'Medical',
        value: 'medical',
    },
    {
        label: 'Vehicle',
        value: 'vehicle',
    },
    {
        label: 'Weapon',
        value: 'weapon',
    },
]

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
                .setMinValues(1)
                .setMaxValues(array.length)
                .setPlaceholder('Select an option...')
                .addOptions(options));
    } else {
        return new ActionRowBuilder()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId(id)
                .setMinValues(1)
                .setPlaceholder('Select an option...')
                .addOptions(options));
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('request')
        .setDescription('Calls an active resupply to your current location.')
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

        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
        
            await interaction.editReply({
                content: confirmation.values.join(', '),
                components: [],
            });

        } catch (e) {
            console.log(e);
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
    }
};