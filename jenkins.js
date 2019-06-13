const {
    Wechaty,
    config
} = require('wechaty') // import { Wechaty } from 'wechaty'

const bot = new Wechaty({
    profile: config.default.DEFAULT_PROFILE,
})

async function onMessage(msg) {
    console.log(`Message: ` + msg.toString())

    if(msg.type() != bot.Message.Type.Text) {
        console.log('Message discared because I just can take care of text')
        return
    }

    await msg.say('good to see you')
}

bot // Global Instance
.on('scan', (qrcode, status) => console.log(`Scan QR Code to login: ${status}\nhttps://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`))
.on('login',            user => console.log(`User ${user} logined`))
.on('logout',           user => console.log(`User ${user} logouted`))
.on('message', onMessage)
.start()
.catch(async e => {
    console.error('Bot start fail:', e)
    await bot.stop()
    process.exit(-1)
})
