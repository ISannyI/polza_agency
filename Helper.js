const OpenAI = require('openai')
const client = new OpenAI({apiKey: process.env.OPENAI_KEY})
const {PROMPT, IP_API_URL, SENTIMENTAL_URL} = require('./config')


class Helper {
    static async openAI(text) {
        try {
            return await client.responses.create({
                model: 'gpt-3.5-turbo',
                input: [{role: "user", content: PROMPT.replace("$text", text)}],
            })
        } catch (e) {
            console.log(`[ERROR] Helper => openAI\n${e.message}`);
        }
    }

    static async ipApi(ip) {
        try {
            return await (await fetch(IP_API_URL + ip)).json()
        } catch (e) {
            console.log(`[ERROR] Helper => ipApi\n${e.message}`);
        }
    }

    static async sentimentApi(text) {
        try {
            const {sentiment} = await (await fetch(SENTIMENTAL_URL, {
                method: 'POST',
                headers: {
                    'apiKey': process.env.SENTIMENTAL_KEY
                },
                redirect: 'follow',
                body: text.toString(),
            })).json()
            if (sentiment) return sentiment
        } catch (e) {
            console.log(`[ERROR] Helper => sentimentApi\n${e.message}`);
        }
    }
}

module.exports = {Helper}
