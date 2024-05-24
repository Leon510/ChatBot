require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { OpenAI } = require("openai");
const { Partials } = require("discord.js");
const gambleCommand = require("./commands/economy/gamble");
const dailyCommand = require("./commands/economy/daily");
const balanceCommand = require("./commands/economy/balance");
const leaderboardCommand = require("./commands/economy/leaderboard");
const coinflipCommand = require("./commands/economy/coinflip");
const CHANNELS = [process.env.CHANNEL];
const mongoose = require("mongoose");
const IGNORE_PREFIX = "!";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const cooldowns = new Map();



const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  // Check if the user is on cooldown
  const lastCommand = cooldowns.get(interaction.user.id);
  if (lastCommand && (Date.now() - lastCommand) < 3000) {
    interaction.reply({
      content: "Du musst 3 Sekunden warten, bevor du einen Befehl erneut ausführen kannst!",
      ephemeral: true,
    });
    return;
  }

  // Update the time the user last ran a command
  cooldowns.set(interaction.user.id, Date.now());

  if (interaction.commandName === "gamble") {
    gambleCommand.run({ interaction });
  }
  if (interaction.commandName === "daily") {
    dailyCommand.run({ interaction });
  }
  if (interaction.commandName === "balance") {
    balanceCommand.run({ interaction });
  }
  if (interaction.commandName === "leaderboard") {
    leaderboardCommand.run({ interaction });
  }
  if (interaction.commandName === "coinflip") {
    coinflipCommand.run({ interaction });
  }
});
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.type !== 1 && !CHANNELS.includes(message.channel.id))
    return;

  let conversation = [];
  conversation.push({
    role: "system",
    content: "Sei ein hilfreicher Assistent.",
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

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  client.login(process.env.DISCORD_TOKEN);
})();
