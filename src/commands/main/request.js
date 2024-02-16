const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ComponentType, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const selectables = require('../../resources/selectables.json');

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

    }
};