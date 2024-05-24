const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");

module.exports = {
  run: async ({ interaction }) => {
    let userProfile = await UserProfile.findOne({
      userId: interaction.member.id,
    });

    if (!interaction.inGuild()) {
      interaction.reply({
        content: "Du musst in einem Server sein um diesen Command auszuführen!",
        ephemeral: true,
      });

      return;
    }
    if (!userProfile) {
      userProfile = new UserProfile({
        userId: interaction.member.id,
      });

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription(
          "Du hast noch kein Konto! Ich habe eins für dich erstellt. Gib **/daily** ein um dein täglichen Bonus zu bekommen"
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });

      await userProfile.save();

      return;
    }

    const amount = interaction.options.getNumber("amount");

    if (amount < 10) {
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription("Du musst mindestens **10€** betragen!");
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (amount > 5000) {
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription("Es darf maximal **5000€** betragen!");
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (amount > userProfile.balance) {
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription(
          `Du hast nicht genug Geld! Du hast nur **${userProfile.balance}€**`
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
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
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription(
          `Die Zahl ist **${number}!**  Du hast  **${amount}€** gewonnen!`
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription(
          `Die Zahl ist **${number}!**  Du hast  **${amount}€** verloren!`
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    userProfile.save();

    return;
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
