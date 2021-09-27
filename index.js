const express = require('express')
const moment = require('moment');
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const Discord = require('discord.js');

const app = express()
app.set('view engine', 'pug');
moment.locale('fr');

const TOKEN_BOT = 'TOKEN BOT HERE';
const URL_FIVEM = 'URL FIVEM DETAIL SERVER HERE EXAMPLE : https://servers.fivem.net/servers/detail/id';
const ID_CHANNEL_PLAYERS = 'ID CHANNEL TO CHANGE NAME OF THIS';

const PORT = process.env.PORT || 3000;

async function getInfos() {
    try {

        const client = new Discord.Client({intents: [Discord.Intents.FLAGS.GUILDS]});

        client.on("ready", async () => {
            console.log('BOT DISCORD CONNECTED AND STARTED...');
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();

            await page.goto(URL_FIVEM);

            console.log('INFORMATIONS OF SERVER RECEIVED...');
            const element = await page.$('.players-count');
            if (!!element) {
                const text = await (await element.getProperty('textContent')).jsonValue();

                /**
                 * SET NUMBER OF PLAYERS INTO NAME CHANNEL DISCORD
                 * COMMENT/DECOMMENT BLOCK TO USE IT
                 **/
                client.channels.fetch(ID_CHANNEL_PLAYERS).then(channel => {
                    console.log('SET NEW NAME WITH PLAYERS ON CHANNEL NAME...');
                    channel.setName(`Joueurs: ${text.replace('group', '')}`);
                    console.log(`JOUEURS: ${text.replace('group', '')}`);
                });

                /**
                 * SET NUMBER OF PLAYERS IN ACTIVITY BOT
                 * COMMENT/DECOMMENT LINE TO USE IT
                 **/
                client.user.setActivity(`${text.replace('group', '')} Joueurs`);

            } else {
                console.log('FIVEM ERROR GET INFORMATIONS... RETRY LATER');
            }
            await browser.close();
        });
        client.login(TOKEN_BOT);
    } catch (error) {
        console.log(error);
    }
}

app.get('/', async (req, res) => { //get method
    res.render('index');
});

app.get('/health', (req, res) => {
    res.status(200).send();
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await getInfos();

    cron.schedule('*/2 * * * *', async () => {
        await getInfos();
    });
});

