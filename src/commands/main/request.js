const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');

const subcommandSelector = new StringSelectMenuBuilder()
    .setCustomId('subcommandSelector')
    .setPlaceholder('Select the type of service you require...')
    .addOptions([
        new StringSelectMenuOptionBuilder()
            .setLabel('Refuel')
            .setValue('Refuel'),
        new StringSelectMenuOptionBuilder()
            .setLabel('Resupply')
            .setValue('Resupply')
    ])

module.exports = {
    data: new SlashCommandBuilder()
        .setName('request')
        .setDescription('Calls an active resupply or refuel to your current location.')
        .setDMPermission(false),
    async execute(interaction) {
        // const refuel = require('./refuel.js');
        // const resupply = require('./resupply.js');

        // if(!refuel && !resupply) throw new Error('Invalid files.');
        
        // const selectMenuResponse = await interaction.reply({components: [new ActionRowBuilder().setComponents(subcommandSelector)], ephemeral: true})
        // const selectMenuCollector = selectMenuResponse.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000});

        // selectMenuCollector.on('collect', async i => {
        //     const userChoice = await i.values[0];
        //     if(userChoice === 'Refuel') {
        //         await refuel.execute(i, true);
        //     } else {
        //         await resupply.execute(i, true);
        //     }
        // })
        interaction.reply({ephemeral: true, content: 'This dont work yet.'});
    }
};