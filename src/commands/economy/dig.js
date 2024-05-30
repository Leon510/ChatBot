const {
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");
const giveUserXP = require("../economy/messageCreate/giveUserXp");
const headImageUrl = "https://i.imgur.com/5KflMXJ.png";

module.exports = {
  run: async ({ interaction }) => {
    try {
      const userId = interaction.user.id;
      let userProfile = await UserProfile.findOne({ userId: userId });
      if (!interaction.inGuild()) {
        await interaction.followUp({
          content:
            "Du musst in einem Server sein um diesen Command auszuführen!",
          ephemeral: true,
        });
        return;
      }

      if (!userProfile) {
        userProfile = new UserProfile({ userId: userId });
        await userProfile.save();

        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle("Kontoeröffnung")
          .setDescription(
            `Du hast noch kein Konto! Ich habe eins für dich erstellt. Gib /daily ein, um deinen täglichen Bonus zu bekommen.`
          );

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const numbers = [-250, 25, 50, 75, 150, 500, 1000, 10000, 50000];
      const probabilities = [
        0.05, 0.34, 0.22, 0.15, 0.1, 0.08, 0.03, 0.02, 0.01,
      ];
      function generateWinningAmount(numbers, probabilities) {
        const random = Math.random();
        let cumulativeProbability = 0;
        for (let i = 0; i < numbers.length; i++) {
          cumulativeProbability += probabilities[i];
          if (random <= cumulativeProbability) {
            return numbers[i];
          }
        }
        return numbers[numbers.length - 1];
      }

      const amount = generateWinningAmount(numbers, probabilities);
      const xpToGive = Math.round(amount / 10);

      if (amount < 1) {
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription(
            "Ohh nein! Deine Ausrüstung ist kaputt gegangen! Du musst 250 Euro für neue Ausrüstung zahlen."
          );
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Schaufeln")
        .setThumbnail(headImageUrl)
        .setDescription(
          `Du hattest Erfolg. Beim Schaufeln hast du **${amount}€** gefunden! Grab weiter und finde nochmehr schätze!`
        )
        .addFields({
          name: "\u200b",
          value: `Du hast **${xpToGive}XP** erhalten`,
        });
      userProfile.balance += amount;

      if (amount > 1) {
        userProfile.gewonnen += amount;
      } else {
        userProfile.verloren += amount;
      }
      await userProfile.save();
      await giveUserXP(interaction, xpToGive);
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
    }
  },
  data: {
    name: "dig",
    description: "Schaufel um dein Glück",
  },
};
