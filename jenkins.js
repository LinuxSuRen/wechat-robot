const { Wechaty } = require('wechaty');
const { PuppetPadchat } = require('wechaty-puppet-padchat');
const QRCode = require('qrcode-terminal');
const Parser = require('./msg-parser');
const GitterUtils = require('./gitter-utils');
const CommandUtils = require('./command-utils');
const Dialog = require('./dialog');
const DBUtils = require('./db-utils');
const RoomID = require('./roomid.json');
const Util = require('util');
const puppet = new PuppetPadchat();

const bot = new Wechaty({
    name: "JenkinsInChina",
    puppet: puppet
});

function onScan(qrcode, status) {
    QRCode.generate(qrcode, { small: true });
    const qrcodeImageUrl = [
        'https://api.qrserver.com/v1/create-qr-code/?data=',
        encodeURIComponent(qrcode),
    ].join('');
    console.log(status);
    console.log(qrcodeImageUrl);
}

function onLogin(user) {
    console.log(`${user} login`);
}

function onLogout(user) {
    console.log(`${user} logout`);
}

async function onMessage(msg) {
    if (msg.age() > 60) {
        return;
    }
    if (msg.payload) {
        if (msg.room() != null && msg.payload.type != bot.Message.Type.Unknown) {
            var room = await msg.room();
            console.log(await room.topic() + ":" + room.id);
            GitterUtils.sendMsgToGitter(bot, msg);
            CommandUtils.do_room_command(bot, msg);
        } else if (msg.payload.type != bot.Message.Type.Unknown && msg.from().name() != "Jenkins中文社区") {
            CommandUtils.do_user_command(bot, msg);
        }
        DBUtils.save_msg(msg);
    }
}

async function onFriendship(friendship) {
    console.log(Util.inspect(friendship));
    if (friendship.type() == bot.Friendship.Type.Receive) {
        await friendship.accept();
    } else if (friendship.type() == bot.Friendship.Type.Confirm) {
        var contact = await friendship.contact();
        await contact.sync();
        contact.say(Dialog.greeting);
        DBUtils.save_wechat_friend(contact);
    }
}

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage);
bot.on('friendship', onFriendship);

bot.start()
    .then(() => console.log('Starter Bot Started.'))
    .catch(e => console.error(e));

