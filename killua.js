require("./kill");
require("./database/Menu/KilluaMenu");
const fs = require("fs");
const axios = require("axios");
const Ai4Chat = require("./scrape/Ai4Chat");
const tiktok2 = require("./scrape/Tiktok");

module.exports = async (kill, m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const body =
        msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.remoteJid;

    const pushname = msg.pushName || "Killua";

    const args = body.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();
    const text = (q = args.join(" "));

    if (!body.startsWith(prefix)) return;

    const killreply = teks =>
        kill.sendMessage(sender, { text: teks }, { quoted: msg });
    const isGroup = sender.endsWith("@g.us");
    const isAdmin = admin.includes(sender);
    const menuImage = fs.readFileSync(image);

    switch (command) {
        case "menu":
            {
                await kill.sendMessage(
                    sender,

                    {
                        image: menuImage,
                        caption: killuamenu,
                        mentions: [sender]
                    },
                    { quoted: msg }
                );
            }
            break;

        case "admin":
            {
                if (!isAdmin) return killreply(mess.admin); // COntoh Penerapan Hanya Admin
                killreply("🎁 *Kamu Adalah Admin*"); // Admin Akan Menerima Pesan Ini
            }
            break;

        case "group":
            {
                if (!isGroup) return killreply(mess.group); // Contoh Penerapan Hanya Group
                killreply("🎁 *Kamu Sedang Berada Di Dalam Grup*"); // Pesan Ini Hanya Akan Dikirim Jika Di Dalam Grup
            }
            break;

        case "ai":
            {
                if (!q)
                    return killreply("☘️ *Contoh:* !ai Apa itu JavaScript?");
                killreply(mess.wait);
                try {
                    const killai = await Ai4Chat(q);
                    await killreply(`*☆Killua AI*\n\n${killai}`);
                } catch (error) {
                    console.error("Error:", error);
                    killreply(mess.error);
                }
            }
            break;

        case "ttdl":
            {
                if (!q) return killreply("⚠ *Mana Link Tiktoknya?*");
                killreply(mess.wait);
                try {
                    const result = await tiktok2(q); // Panggil Fungsi Scraper

                    // Kirim Video
                    await kill.sendMessage(
                        sender,
                        {
                            video: { url: result.no_watermark },
                            caption: `*🎁 kill Tiktok Downloader*`
                        },
                        { quoted: msg }
                    );
                } catch (error) {
                    console.error("Error TikTok DL:", error);
                    killreply(mess.error);
                }
            }
            break;

        case "igdl":
            {
                if (!q) return killreply("⚠ *Mana Link Instagramnya?*");
                try {
                    killreply(mess.wait);

                    // Panggil API Velyn
                    const apiUrl = `https://www.velyn.biz.id/api/downloader/instagram?url=${encodeURIComponent(
                        q
                    )}`;
                    const response = await axios.get(apiUrl);

                    if (!response.data.status || !response.data.data.url[0]) {
                        throw new Error("Link tidak valid atau API error");
                    }

                    const data = response.data.data;
                    const mediaUrl = data.url[0];
                    const metadata = data.metadata;

                    // Kirim Media
                    if (metadata.isVideo) {
                        await kill.sendMessage(
                            sender,
                            {
                                video: { url: mediaUrl },
                                caption:
                                    `*Instagram Reel*\n\n` +
                                    `*Username :* ${metadata.username}\n` +
                                    `*Likes :* ${metadata.like.toLocaleString()}\n` +
                                    `*Comments :* ${metadata.comment.toLocaleString()}\n\n` +
                                    `*Caption :* ${
                                        metadata.caption || "-"
                                    }\n\n` +
                                    `*Source :* ${q}`
                            },
                            { quoted: msg }
                        );
                    } else {
                        await kill.sendMessage(
                            sender,
                            {
                                image: { url: mediaUrl },
                                caption:
                                    `*Instagram Post*\n\n` +
                                    `*Username :* ${metadata.username}\n` +
                                    `*Likes :* ${metadata.like.toLocaleString()}\n\n` +
                                    `*Caption :* ${metadata.caption || "-"}`
                            },
                            { quoted: msg }
                        );
                    }
                } catch (error) {
                    console.error("Error Instagram DL:", error);
                    killreply(mess.error);
                }
            }
            break;
    }
};
