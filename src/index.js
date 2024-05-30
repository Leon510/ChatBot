const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { OpenAI } = require("openai");
const mongoose = require("mongoose");
require("dotenv").config();

const gambleCommand = require("./commands/economy/gamble");
const dailyCommand = require("./commands/economy/daily");
const balanceCommand = require("./commands/economy/balance");
const leaderboardCommand = require("./commands/economy/leaderboard");
const coinflipCommand = require("./commands/economy/coinflip");
const profileCommand = require("./commands/economy/profile");
const UserProfile = require("./schemas/UserProfile");
const giveUserXP = require("./commands/economy/messageCreate/giveUserXp");
const transferCommand = require("./commands/economy/transfer");
const digCommand = require("./commands/economy/dig");
const CHANNELS = [process.env.CHANNEL];
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

  // Check if the user is on cooldown
  const lastCommand = cooldowns.get(interaction.user.id);
  if (lastCommand && Date.now() - lastCommand < 3000) {
    interaction.reply({
      content:
        "Du musst 3 Sekunden warten, bevor du einen Befehl erneut ausführen kannst!",
      ephemeral: true,
    });
    return;
  }

  // Update the time the user last ran a command
  cooldowns.set(interaction.user.id, Date.now());

  let userProfile = await UserProfile.findOne({ userId: interaction.user.id });

  // If no user profile was found, create a new one
  if (!userProfile) {
    userProfile = new UserProfile({ userId: interaction.user.id });
    await userProfile.save();
  }

  if (interaction.commandName === "gamble") {
    const success = gambleCommand.run({ interaction });
    userProfile.commands += 1;
    userProfile.save();
  }
  if (interaction.commandName === "daily") {
    dailyCommand.run({ interaction });
    userProfile.commands += 1;
    userProfile.save();
  }
  if (interaction.commandName === "balance") {
    balanceCommand.run({ interaction });
    userProfile.commands += 1;
    userProfile.save();
  }
  if (interaction.commandName === "leaderboard") {
    leaderboardCommand.run({ interaction });
    userProfile.commands += 1;
    userProfile.save();
  }
  if (interaction.commandName === "coinflip") {
    const success = coinflipCommand.run({ interaction });
    userProfile.commands += 1;
    userProfile.save();
  }
  if (interaction.commandName === "profile") {
    profileCommand.run({ interaction });
    userProfile.save();
  }
  if (interaction.commandName === "transfer") {
    transferCommand.run({ interaction });
    userProfile.save();
  }
  if (interaction.commandName === "dig") {
    const today = new Date().setHours(0, 0, 0, 0);
    const lastDigCommandDate = new Date(
      userProfile.lastDigCommandDate
    ).setHours(0, 0, 0, 0);

    if (today === lastDigCommandDate && userProfile.digCommandsPerDay >= 3) {
      interaction.reply({
        content: "Du kannst den Befehl /dig nur dreimal pro Tag ausführen!",
        ephemeral: true,
      });
      return;
    }

    if (today !== lastDigCommandDate) {
      userProfile.digCommandsPerDay = 0;
      userProfile.lastDigCommandDate = Date.now();
    }

    digCommand.run({ interaction });
    userProfile.digCommandsPerDay += 1;
    userProfile.save();
  }
});

/* client.on("messageCreate", async (message) => {
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
}); */

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  client.login(process.env.DISCORD_TOKEN);
})();
