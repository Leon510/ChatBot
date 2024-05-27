require("dotenv").config();
const { REST, Routes } = require("discord.js");
const dailyCommand = require("./commands/economy/daily"); // Pfad zu Ihrem daily-Befehlsmodul
const gambleCommand = require("./commands/economy/gamble"); // Pfad zu Ihrem gamble-Befehlsmodul
const balanceCommand = require("./commands/economy/balance");
const leaderboardCommand = require("./commands/economy/leaderboard");
const coinflipCommand = require("./commands/economy/coinflip");
const profileCommand = require("./commands/economy/profile");
const transferCommand = require("./commands/economy/transfer");
const commands = [
  dailyCommand.data,
  gambleCommand.data,
  balanceCommand.data,
  leaderboardCommand.data,
  coinflipCommand.data,
  profileCommand.data,
  transferCommand.data
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Deleting server slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: [] }
    );

    console.log("Server slash commands were deleted successfully!");

    console.log("Registering global slash commands...");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Global slash commands were registered successfully!");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();
