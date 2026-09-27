const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const SPAM_CHANNEL_ID = process.env.SPAM_CHANNEL_ID;

client.on('messageCreate', async (message) => {
    // Ignore les messages des bots
    if (message.author.bot) return;

    // On ne traite que les messages contenant au moins une mention
    if (message.mentions.users.size === 0) return;

    /*
     * On retire toutes les mentions utilisateur du contenu.
     *
     * Exemple :
     * "@Alice @Bob"
     * devient :
     * ""
     *
     * Si du texte reste après suppression des mentions,
     * ce n'est pas un message composé uniquement de mentions.
     */
    const contentWithoutMentions = message.content
        .replace(/<@!?\d+>/g, '')
        .trim();

    // Si autre chose que des mentions est présent, on ignore
    if (contentWithoutMentions.length > 0) return;

    try {
        const targetChannel = await message.guild.channels.fetch(SPAM_CHANNEL_ID);

        if (!targetChannel || !targetChannel.isTextBased()) {
            console.error(`Le salon ${SPAM_CHANNEL_ID} est introuvable ou n'est pas textuel.`);
            return;
        }

        // Mentions des personnes ciblées
        const mentionedUsers = [...message.mentions.users.values()]
            .map(user => `<@${user.id}>`)
            .join(' ');

        // Message final
        const spamMessage =
            `La pétasse <@${message.author.id}> spam : ${mentionedUsers}`;

        // Envoi dans le salon central
        await targetChannel.send({
            content: spamMessage,
            allowedMentions: {
                users: [
                    message.author.id,
                    ...message.mentions.users.keys()
                ]
            }
        });

        // Suppression du message original
        await message.delete();

        console.log(
            `[SPAM] ${message.author.tag} a mentionné : ${[...message.mentions.users.values()]
                .map(user => user.tag)
                .join(', ')}`
        );

    } catch (error) {
        console.error('Erreur lors du traitement du message de spam :', error);
    }
});

client.login(process.env.DISCORD_TOKEN);
