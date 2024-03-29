const { SlashCommandBuilder } = require('@discordjs/builders');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fetch = require('node-fetch');
const Discord = require('discord.js')
const stringSimilarity = require("string-similarity");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('will answer your question about a player.')
        .addStringOption(option => option.setName('question').setRequired(true).setDescription('The question you\'d like to ask.')),

    async execute(interaction) {
        let original_question = interaction.options.getString('question')
        let original_atQ = original_question.replace(/ /g, '-')
        let question = interaction.options.getString('question').includes("stats") ? interaction.options.getString('question') : `${interaction.options.getString('question')} stats`
        let atQ = question.replace(/ /g, '-')
        var query = atQ
        console.log(query)
        const url = `https://www.statmuse.com/ask/${query}`
        const data = await fetch(url)
        const rawHtml = await data.text()    
        const dom = new JSDOM(rawHtml)

        // Scrapes statmuse, grabs the raw html of the website, and converts it to a DOM so you can access it as you would with react or vanilla JS.
        try {
            const answer = dom.window.document.getElementsByClassName('nlg-answer')[0].children[0].textContent // This grabs the element which contains the answer
            similarity = stringSimilarity.compareTwoStrings(answer.replace('stats', ''), interaction.options.getString('question')) // Compares the answer to the question; needed because when statmuse doesn't know the answer it tends to just echo back the question in a slightly different form. Simple QoL thing
            if(similarity > 0.7) {
                try {
                    // this will check to see if removing the "stats" auto-append will fix the similarity issue
                    let newUrl = `https://www.statmuse.com/ask/${original_atQ}`
                    let newData = await fetch(newUrl)
                    let newrawHtml = await newData.text()
                    let newdom = new JSDOM(newrawHtml)
                    let newanswer = newdom.window.document.getElementsByClassName('nlg-answer')[0].children[0].textContent
                    let newsimilarity = stringSimilarity.compareTwoStrings(newanswer.replace('stats', ''), interaction.options.getString('question'))
                    if (newsimilarity < similarity) {
                        const image = newdom.window.document.getElementsByClassName('h-44 md:h-52 self-center md:self-end mt-2 md:mt-0 md:pl-6 md:pr-1.5 select-none')[0].src // grabs the statmuse player image
                        const embed = new Discord.MessageEmbed()
                        .setTitle(`Question: "*${interaction.options.getString('question')}*"`)
                        .setURL(newUrl)
                        .setDescription(newanswer)
                        .setThumbnail(image)
                        .setFooter({text: 'Made by Jayleaf | Powered by Statmuse', iconURL: 'https://i.imgur.com/uENX5KO.jpg' })
                        .setAuthor({name: `Question asked by ${interaction.member.nickname ? interaction.member.nickname : interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()})
                        .setColor('#0099ff')
                        interaction.reply({embeds: [embed]})
                        return;
                    } 
                }catch(e) {
                    try {
                        // this code runs if the answer is not found. The element structure is different if it doesn't have an answer, so I have to change the code a little bit to make it appear.
                        const answer = dom.window.document.getElementsByClassName('nlg-answer')[0].textContent
                        const image = dom.window.document.getElementsByClassName('h-44 md:h-52 self-center md:self-end mt-2 md:mt-0 md:pl-6 md:pr-1.5 select-none')[0].src
                        const embed = new Discord.MessageEmbed()
                            .setTitle(`Question: "*${interaction.options.getString('question')}*"`)
                            .setURL(url)
                            .setDescription(answer)
                            .setThumbnail(image)
                            .setFooter({text: 'Made by Jayleaf | Powered by Statmuse', iconURL: 'https://i.imgur.com/uENX5KO.jpg' })
                            .setAuthor({name: `Question asked by ${interaction.member.nickname ? interaction.member.nickname : interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()})
                            .setColor('#0099ff')
                        interaction.reply({embeds: [embed]})
                        return;
                    } catch(e) {
                        
                    }
                }
                // runs if the answer is similar enough to the question for the reasoning above
                const image = dom.window.document.getElementsByClassName('h-44 md:h-52 self-center md:self-end mt-2 md:mt-0 md:pl-6 md:pr-1.5 select-none')[0].src // grabs the statmuse player image
                const embed = new Discord.MessageEmbed()
                    .setTitle(`Question: "*${interaction.options.getString('question')}*"`)
                    .setURL(url)
                    .setDescription('I didn\'t quite catch that; try rewording your question.')
                    .setThumbnail(image)
                    .setFooter({text: 'Made by Jayleaf | Powered by Statmuse', iconURL: 'https://i.imgur.com/uENX5KO.jpg' })
                    .setAuthor({name: `Question asked by ${interaction.member.nickname ? interaction.member.nickname : interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()})
                    .setColor('#0099ff')
                interaction.reply({embeds: [embed]})
                return;              
            }
            const image = dom.window.document.getElementsByClassName('h-44 md:h-52 self-center md:self-end mt-2 md:mt-0 md:pl-6 md:pr-1.5 select-none')[0].src
            const embed = new Discord.MessageEmbed()
                .setTitle(`Question: "*${interaction.options.getString('question')}*"`)
                .setURL(url)
                .setDescription(answer)
                .setThumbnail(image)
                .setFooter({text: 'Made by Jayleaf | Powered by Statmuse', iconURL: 'https://i.imgur.com/uENX5KO.jpg' })
                .setAuthor({name: `Question asked by ${interaction.member.nickname ? interaction.member.nickname : interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()})
                .setColor('#0099ff')
            if (Math.floor(Math.random() * 16) == 15) {
                embed.addFields({name: "Enjoying the bot? Leave us a review on top.gg!", value: "https://top.gg/bot/985799424108269569#reviews"})
            }
            interaction.reply({embeds: [embed]})
            return;
        } catch(e) {
            try {
                // this code runs if the answer is not found. The element structure is different if it doesn't have an answer, so I have to change the code a little bit to make it appear.
                const answer = dom.window.document.getElementsByClassName('nlg-answer')[0].textContent
                const image = dom.window.document.getElementsByClassName('h-44 md:h-52 self-center md:self-end mt-2 md:mt-0 md:pl-6 md:pr-1.5 select-none')[0].src
                const embed = new Discord.MessageEmbed()
                    .setTitle(`Question: "*${interaction.options.getString('question')}*"`)
                    .setURL(url)
                    .setDescription(answer)
                    .setThumbnail(image)
                    .setFooter({text: 'Made by Jayleaf | Powered by Statmuse', iconURL: 'https://i.imgur.com/uENX5KO.jpg' })
                    .setAuthor({name: `Question asked by ${interaction.member.nickname ? interaction.member.nickname : interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()})
                    .setColor('#0099ff')
                interaction.reply({embeds: [embed]})
                return;
            } catch(e) {
                
            }
        } 
    }
}
