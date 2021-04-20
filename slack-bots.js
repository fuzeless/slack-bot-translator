const SlackBot = require('slackbots');
const axios = require('axios');
const dotenv = require('dotenv');
const { Translate } = require('@google-cloud/translate').v2;
const path = require('path');

dotenv.config()

const bot = new SlackBot({
    token: `${process.env.BOT_TOKEN}`,
    name: 'TranslateBot'
})

// Start Handler
bot.on('start', () => {
    const params = {
        icon_emoji: ':robot_face:'
    }
})

// Error Handler
bot.on('error', (err) => {
    console.log(err);
})

// Message Handler
bot.on('message', (data) => {
    if (data.type !== 'message') {
        return;
    }
    handleMessage(data.text);
})

// Response Handler
const handleMessage = async (message) => {
    console.log('Message: ', message)
    const translatedMessage = await translate(message, { target: 'en' });
    if (!(translatedMessage.sourceLanguage === 'en' || translatedMessage.sourceLanguage === 'no')) {
        bot.postMessageToChannel('general', `${translatedMessage.translation} - translated from ${translatedMessage.sourceLanguage}`)
    }
}

// // inspire Me
function inspireMe() {
    axios.get('https://raw.githubusercontent.com/BolajiAyodeji/inspireNuggets/master/src/quotes.json')
        .then(res => {
            const quotes = res.data;
            const random = Math.floor(Math.random() * quotes.length);
            const quote = quotes[random].quote
            const author = quotes[random].author

            const params = {
                icon_emoji: ':male-technologist:'
            }

            bot.postMessageToChannel(
                'random',
                `:zap: ${quote} - *${author}*`,
                params
            );

        })
}

const translate = async (input = '', { target = 'en' } = {}) => {
    const keyFile =
        process.env.GOOGLE_APPLICATION_API_KEY ||
        path.resolve(__dirname, './api-key.json');
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFile;
    const apiKey = require(keyFile);
    const translate = new Translate({ projectId: apiKey.project_id });
    if (typeof input !== 'string') {
        throw new Error('Input text must be string');
    }
    const [translation, others] = await translate.translate(input, target);
    let sourceLanguage;
    try {
        sourceLanguage = others.data.translations[0].detectedSourceLanguage;
    } catch (err) {
        sourceLanguage = 'no'
    }
    return { translation, sourceLanguage };
}

