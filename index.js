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

// ============================================================
// BOT READY
// ============================================================

client.once('clientReady', () => {
    console.log('========================================');
    console.log('🤖 BOT CONNECTÉ');
    console.log(`Nom    : ${client.user.tag}`);
    console.log(`ID     : ${client.user.id}`);
    console.log(`Salon  : ${SPAM_CHANNEL_ID}`);
    console.log('========================================');
});

// ============================================================
// MESSAGE HANDLER
// ============================================================

client.on('messageCreate', async (message) => {

    console.log('\n----------------------------------------');
    console.log('📩 NOUVEAU MESSAGE REÇU');

    console.log(`Serveur  : ${message.guild?.name || 'DM'}`);
    console.log(`Salon    : #${message.channel?.name || 'inconnu'}`);
    console.log(`Auteur   : ${message.author.tag}`);
    console.log(`Contenu  : "${message.content}"`);

    // --------------------------------------------------------
    // 1. IGNORER LES BOTS
    // --------------------------------------------------------

    if (message.author.bot) {
        console.log('⏭️ IGNORÉ → message envoyé par un bot');
        return;
    }

    console.log('✅ Auteur humain → traitement continu');

    // --------------------------------------------------------
    // 2. VÉRIFIER LES MENTIONS
    // --------------------------------------------------------

    console.log(`👥 Nombre de mentions utilisateur : ${message.mentions.users.size}`);

    if (message.mentions.users.size === 0) {
        console.log('⏭️ IGNORÉ → aucune mention utilisateur');
        return;
    }

    console.log('✅ Au moins une mention détectée');

    // --------------------------------------------------------
    // 3. RETIRER LES MENTIONS DU CONTENU
    // --------------------------------------------------------

    const contentWithoutMentions = message.content
        .replace(/<@!?\d+>/g, '')
        .trim();

    console.log(`🔍 Contenu après suppression des mentions : "${contentWithoutMentions}"`);

    // --------------------------------------------------------
    // 4. VÉRIFIER QU'IL N'Y A QUE DES MENTIONS
    // --------------------------------------------------------

    if (contentWithoutMentions.length > 0) {
        console.log('⏭️ IGNORÉ → le message contient du texte supplémentaire');
        return;
    }

    console.log('🚨 MESSAGE DE SPAM DÉTECTÉ');
    console.log(
        `👤 Auteur : ${message.author.tag} (${message.author.id})`
    );

    console.log(
        `🎯 Mentions : ${[...message.mentions.users.values()]
            .map(user => `${user.tag} (${user.id})`)
            .join(', ')}`
    );

    // --------------------------------------------------------
    // 5. RÉCUPÉRER LE CHANNEL DE DESTINATION
    // --------------------------------------------------------

    try {

        console.log(`🔎 Recherche du salon ${SPAM_CHANNEL_ID}...`);

        const targetChannel = await message.guild.channels.fetch(
            SPAM_CHANNEL_ID
        );

        if (!targetChannel) {
            console.error('❌ ERREUR → salon de destination introuvable');
            return;
        }

        console.log(
            `✅ Salon trouvé : #${targetChannel.name} (${targetChannel.id})`
        );

        if (!targetChannel.isTextBased()) {
            console.error('❌ ERREUR → le salon de destination n\'est pas textuel');
            return;
        }

        // ----------------------------------------------------
        // 6. CONSTRUIRE LE MESSAGE
        // ----------------------------------------------------

        const mentionedUsers = [...message.mentions.users.values()]
            .map(user => `<@${user.id}>`)
            .join(' ');

        const spamMessage =
            `La pétasse <@${message.author.id}> spam : ${mentionedUsers}`;

        console.log(`📝 Message à envoyer : "${spamMessage}"`);

        // ----------------------------------------------------
        // 7. ENVOYER LE MESSAGE
        // ----------------------------------------------------

        console.log('📤 Envoi du message dans le salon central...');

        await targetChannel.send({
            content: spamMessage,
            allowedMentions: {
                users: [
                    message.author.id,
                    ...message.mentions.users.keys()
                ]
            }
        });

        console.log('✅ Message envoyé avec succès');

        // ----------------------------------------------------
        // 8. SUPPRIMER LE MESSAGE ORIGINAL
        // ----------------------------------------------------

        console.log(
            `🗑️ Suppression du message original (${message.id})...`
        );

        await message.delete();

        console.log('✅ Message original supprimé');

        console.log('🎉 TRAITEMENT TERMINÉ AVEC SUCCÈS');

    } catch (error) {

        console.error('========================================');
        console.error('❌ ERREUR PENDANT LE TRAITEMENT');
        console.error('========================================');

        console.error(error);

        console.error('----------------------------------------');
        console.error('Message ID :', message.id);
        console.error('Auteur     :', message.author.tag);
        console.error('Salon      :', message.channel.id);
        console.error('----------------------------------------');
    }
});

// ============================================================
// ERREURS GLOBALES
// ============================================================

client.on('error', (error) => {
    console.error('❌ ERREUR CLIENT DISCORD :');
    console.error(error);
});

client.on('warn', (warning) => {
    console.warn('⚠️ WARNING DISCORD :');
    console.warn(warning);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ UNHANDLED REJECTION :');
    console.error(error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ UNCAUGHT EXCEPTION :');
    console.error(error);
});

// ============================================================
// CONNEXION
// ============================================================

console.log('🔌 Connexion à Discord...');

client.login(process.env.DISCORD_TOKEN);

