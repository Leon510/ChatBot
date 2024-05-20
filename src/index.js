require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { OpenAI } = require("openai");
const CHANNELS = ["1242154113836257300"];
const IGNORE_PREFIX = "!";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.once("ready", () => {
  console.log(
    `Ready! Logged in as ${client.user.tag}! I'm on ${client.guilds.cache.size} servers!`
  );
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "santa") {
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setImage(
        `https://media3.giphy.com/media/pyrgLdTlTcSdbjZUyS/200w.gif?cid=6c09b9529ipvkpsj4psk85a0f62uxm9ot2n98kfcxn51p2z1&ep=v1_gifs_search&rid=200w.gif&ct=g`
      );
    await interaction.reply({ embeds: [embed] });
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(IGNORE_PREFIX)) return;
  if (
    !CHANNELS.includes(message.channelId) &&
    !message.mentions.users.has(client.user.id)
  )
    return;

  await message.channel.sendTyping();

  let conversation = [];
  conversation.push({
    role: "system",
    content: "You are a helpful assistant.",
  });

  let prevMessages = await message.channel.messages.fetch({ limit: 10 });
  prevMessages.reverse();

  prevMessages.forEach((msg) => {
    if (msg.author.bot && msg.author.id !== client.user.id) return;
    if (msg.content.startsWith(IGNORE_PREFIX)) return;

    const username = msg.author.username.replace(/[^a-zA-Z0-9]/g, "");

    if (msg.author.id === client.user.id) {
      conversation.push({
        role: "assistant",
        name: username,
        content: msg.content,
      });
      return;
    }

    conversation.push({
      role: "user",
      name: username,
      content: msg.content,
    });
  });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: conversation,
  });

  message.reply(response.choices[0].message.content);
});

client.login(process.env.DISCORD_TOKEN);

