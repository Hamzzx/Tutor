//import module
const {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} = require("baileys");
const axios = require("axios");
const chalk = require("chalk");
const pino = require("pino");
const { resolve } = require("path");
const { version } = require("os");
const readline = require("readline");
const usePairingCode = true;

async function question(prompt) {
    process.stdout.write(prompt);
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve =>
        r1.question("", ans => {
            r1.close();
            resolve(ans);
        })
    );
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("./KillSesi");
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Killua Using WA v${version.join(".")}, isLatest: ${isLatest}`);

    const kill = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        version: version,
        syncFullHistory: true,
        generateHighQualityLinkPreview: true,
        getMessage: async key => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            }
            return proto.Message.fromObject({});
        }
    });

    if (usePairingCode && !kill.authState.creds.registered) {
        try {
            const phoneNumber = await question(
                "☘️ Masukan Nomor Yang Diawali Dengan 62 :\n"
            );
            const code = await kill.requestPairingCode(phoneNumber.trim());
            console.log(`🎁 Pairing Code : ${code}`);
        } catch (err) {
            console.error("Failed to get pairing code:", err);
        }
    }

    kill.ev.on("creds.update", saveCreds);

    kill.ev.on("connection.update", update => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            console.log(chalk.red("Koneksi Terputus"));
            connectToWhatsApp();
        } else if (connection === "open") {
            console.log(chalk.green("Bot Berhasil Terhubung Ke WhatsApp"));
        }
    });

    kill.ev.on("messages.upsert", async m => {
        const msg = m.messages[0];

        if (!msg.message) return;

        const body =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";
        const sender = msg.key.remoteJid;
        const pushname = msg.pushName || "Killua";
        const listColor = [
            "red",
            "green",
            "yellow",
            "magenta",
            "cyan",
            "white",
            "blue"
        ];
        const randomColor =
            listColor[Math.floor(Math.random() * listColor.length)];

        console.log(
            chalk.yellow.bold("Credit : Hamz"),
            chalk.green.bold("[ WhatsApp ]"),
            chalk[randomColor](pushname),
            chalk[randomColor](":"),
            chalk.white(body)
        );

        require("./killua")(kill, m);
    });
}
connectToWhatsApp();
