const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");
const giveUserXP = require("../economy/messageCreate/giveUserXp");

module.exports = {
  run: async ({ interaction }) => {
    try {
      // Defer the reply to allow more time for processing
      await interaction.deferReply({ ephemeral: true });

      let userProfile = await UserProfile.findOne({
        userId: interaction.user.id,
      });

      if (!interaction.inGuild()) {
        await interaction.followUp({
          content: "Du musst in einem Server sein um diesen Command auszuführen!",
          ephemeral: true,
        });
        return;
      }

      if (!userProfile) {
        userProfile = new UserProfile({
          userId: interaction.user.id,
        });

        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription(
            "Du hast noch kein Konto! Ich habe eins für dich erstellt. Gib **/daily** ein um dein täglichen Bonus zu bekommen"
          );

        await userProfile.save();
        await interaction.followUp({ embeds: [embed], ephemeral: true });
        return;
      }

      const amount = interaction.options.getNumber("amount");
      let xpToGive;

      if (amount < 10) {
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription("Du musst mindestens **10€** betragen!");
        await interaction.followUp({ embeds: [embed], ephemeral: true });
        return;
      }

      if (amount > 5000) {
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription("Es darf maximal **5000€** betragen!");
        await interaction.followUp({ embeds: [embed], ephemeral: true });
        return;
      }

      if (amount > userProfile.balance) {
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription(
            `Du hast nicht genug Geld! Du hast nur **${userProfile.balance}€**`
          );
        await interaction.followUp({ embeds: [embed], ephemeral: true });
        return;
      }

      userProfile.balance -= amount;

      let number;
      let probability = Math.floor(Math.random() * 100) + 1;

      if (probability > 50) {
        number = Math.floor(Math.random() * 50) + 51;
      } else {
        number = Math.floor(Math.random() * 50) + 1;
      }

      if (number > 50) {
        userProfile.balance += amount * 2;
        userProfile.gewonnen += amount;
        xpToGive = 25;
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription(
            `Die Zahl ist **${number}!**  Du hast  **${amount}€** gewonnen!`
          )
          .addFields({
            name: "\u200b",
            value: `Du hast **${xpToGive}XP** erhalten`,
          })
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      } else {
        userProfile.verloren += amount;
        xpToGive = 10;
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription(
            `Die Zahl ist **${number}!**  Du hast  **${amount}€** verloren!`
          )
          .addFields({
            name: "\u200b",
            value: `Du hast **${xpToGive}XP** erhalten`,
          })
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      }

      await giveUserXP(interaction, xpToGive);
      await userProfile.save();
    } catch (error) {
      console.error(error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: `Ein Fehler ist aufgetreten: ${error.message}`,
          ephemeral: true,
        });
      }
    }
  },

  data: {
    name: "gamble",
    description: "Spiele mit dem Bot",
    options: [
      {
        name: "amount",
        description: "Der zu setzende Betrag",
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
    ],
  },
};
