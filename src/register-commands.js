require("dotenv").config();
const { REST, Routes } = require("discord.js");
const dailyCommand = require("./commands/economy/daily"); // Pfad zu Ihrem daily-Befehlsmodul
const gambleCommand = require("./commands/economy/gamble"); // Pfad zu Ihrem gamble-Befehlsmodul
const balanceCommand = require("./commands/economy/balance");
const commands = [dailyCommand.data, gambleCommand.data, balanceCommand.data];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("Slash commands were registered successfully!");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();