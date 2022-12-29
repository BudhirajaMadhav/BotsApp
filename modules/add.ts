import chalk from "chalk";
import STRINGS from "../lib/db.js";
import inputSanitization from "../sidekick/input-sanitization";
import CONFIG from "../config";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import BotsApp from "../sidekick/sidekick";
import { MessageType } from "../sidekick/message-type";
import format from "string-format";
import fs from 'fs';
const ADD = STRINGS.add;

module.exports = {
    name: "add",
    description: ADD.DESCRIPTION,
    extendedDescription: ADD.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        try {
            if (!BotsApp.isGroup) {
                client.sendMessage(
                    BotsApp.chatId,
                    STRINGS.general.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }

            await client.getGroupMetaData(BotsApp.chatId, BotsApp);
            if (!BotsApp.isBotGroupAdmin) {
                client.sendMessage(
                    BotsApp.chatId,
                    STRINGS.general.BOT_NOT_ADMIN,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }

            if (args.length == 0) {
                client.sendMessage(
                    BotsApp.chatId,
                    ADD.NO_ARG_ERROR,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }

            let numbers = [];
            for (let i = 0; i < args.length; i++) {
                let number;
                if (!args[i]) {
                    // client.sendMessage(
                    //     BotsApp.chatId,
                    //     ADD.NO_ARG_ERROR,
                    //     MessageType.text
                    // ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    continue;
                }
                if (parseInt(args[i]) === NaN || args[i][0] === "+" || args[i].length < 10) {
                    client.sendMessage(
                        BotsApp.chatId,
                        ADD.NUMBER_SYNTAX_ERROR + " in " + args[i],
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    continue;
                }
                if (args[i].length == 10 && !(parseInt(args[i]) === NaN)) {
                    number = CONFIG.COUNTRY_CODE + args[i];
                } else {
                    number = args[i];
                }
                const [exists] = await client.sock.onWhatsApp(
                    number + "@s.whatsapp.net"
                );
                if (!(exists)) {
                    client.sendMessage(
                        BotsApp.chatId,
                        format(ADD.NOT_ON_WHATSAPP, number),
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    continue;
                }
                numbers.push(number + "@s.whatsapp.net");
            }

            const responses: any = await client.sock.groupParticipantsUpdate(BotsApp.chatId, numbers, 'add');
            const code = await client.sock.groupInviteCode(BotsApp.chatId);
            const groupLink = `https://chat.whatsapp.com/${code}`;

            // responses is an array of objects
            console.log(chalk.greenBright("Responses: " + JSON.stringify(responses)));

            for (let i = 0; i < responses.length; i++) {
                const response = responses[i];
                // if (response.status == 408) {
                //     client.sendMessage(
                //         BotsApp.chatId,
                //         ADD.NO_24HR_BAN,
                //         MessageType.text
                //     ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                //     return;
                // } else 

                if (response.status == 403) {
                    // for (const index in response.participants) {
                    //     if ((number + "@c.us") in response.participants[index]) {
                    //         var code = response.participants[index][number + "@c.us"].invite_code;
                    //         var tom = response.participants[index][number + "@c.us"].invite_code_exp;
                    //     }
                    // }
                    // var invite = {
                    //     caption: "```Hi! You have been invited to join this WhatsApp group",
                    //     groupJid: BotsApp.groupId,
                    //     groupName: BotsApp.groupName,
                    //     inviteCode: code,
                    //     inviteExpiration: tom,
                    //     jpegThumbnail: fs.readFileSync('./images/BotsApp_invite.jpeg')
                    // }
                    await client.sendMessage(
                        response.jid,
                        "Follow this link to join my WhatsApp group: " + groupLink + " \n\nIf you are unable to join, please send me a message and I will add you manually.",
                        MessageType.text
                    );
                    // client.sendMessage(
                    //     BotsApp.chatId,
                    //     ADD.PRIVACY,
                    //     MessageType.text
                    // ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    continue;
                } 
                // else if (response.status == 409) {
                //     client.sendMessage(
                //         BotsApp.chatId,
                //         ADD.ALREADY_MEMBER,
                //         MessageType.text
                //     ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                //     continue;
                // }
            }

            return;
        } catch (err) {
            if (err.status == 400) {
                await inputSanitization.handleError(
                    err,
                    client,
                    BotsApp,
                    ADD.NOT_ON_WHATSAPP
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
            }
            await inputSanitization.handleError(err, client, BotsApp);
        }
        return;
    },
};
