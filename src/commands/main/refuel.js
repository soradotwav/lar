const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function generateRandomID() {
    const min = 1000000000;
    const max = 9999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmbed() {
    return new EmbedBuilder()
        .setAuthor({ name: 'Logistics Active Resupply' })
        .setDescription(`Refuel Request #${requestID}`)
        .addFields(
            { name: 'System', value: `${systemName}`, inline: true },
            { name: 'Nearest Planet', value: `${nearestPlanet}`, inline: true },
            { name: 'Status', value: `${requestStatus}`, inline: true },
            { name: 'Client', value: `${clientUserName}`, inline: true },
            { name: 'Client Ship', value: `${clientShip}`, inline: true},
            { name: 'Thread', value: `asd`, inline: false },
            { name: 'Request being handled by', value: `N/A`, inline: false })
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

        const requestID = generateRandomID();
        const systemName = 'Stanton';
        const nearestPlanet = 'MicroTech';
        const requestStatus = 'Open';
        const clientUserName = 'soradotwav';
        const clientShip = 'Spirit C1';

        const embed = 

        await interaction.reply({embeds: [embed]});
    }
}