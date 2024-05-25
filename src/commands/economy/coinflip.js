const {
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");
const giveUserXP = require("../economy/messageCreate/giveUserXp");
const headImageUrl =
  "https://i.gifer.com/origin/e0/e02ce86bcfd6d1d6c2f775afb3ec8c01_w200.gif"; // URL zum SVG-Bild der Kopfseite der Münze
const numberImageUrl =
  "https://i.gifer.com/origin/e0/e02ce86bcfd6d1d6c2f775afb3ec8c01_w200.gif"; // URL zum SVG-Bild der Zahlseite der Münze

module.exports = {
  run: async ({ interaction }) => {
    try {
      const userId = interaction.user.id;
      let userProfile = await UserProfile.findOne({ userId: userId });

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

      const amount = interaction.options.getNumber("amount");
      if (amount < 1) {
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription("Du musst mindestens 1€ betragen!");
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      if (amount > 200) {
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription("Es darf maximal 200€ betragen!");
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

      const select = new StringSelectMenuBuilder()
        .setCustomId("coinflip")
        .setPlaceholder("Münzauswahl")
        .addOptions([
          {
            label: "Kopf",
            value: "Kopf",
            emoji: "🪙",
          },
          {
            label: "Zahl",
            value: "Zahl",
            emoji: "🪙",
          },
        ]);

      const row = new ActionRowBuilder().addComponents(select);

      await interaction.reply({ components: [row], ephemeral: true });

      const filter = (i) => i.customId === "coinflip" && i.user.id === userId;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector.on("collect", async (i) => {
        const result = Math.random() < 0.5 ? "Kopf" : "Zahl";

        let xpToGive;
        if (i.values[0] === result) {
          userProfile.balance += amount;
          userProfile.gewonnen += amount;
          xpToGive = 25;
          const embed = new EmbedBuilder()
            .setColor(0x00ff00) // Grün für Gewinn
            .setTitle("Glückwunsch!")
            .setThumbnail(result === "Kopf" ? headImageUrl : numberImageUrl)
            .setDescription(`Du hast gewonnen!\n Es war **${result}**`)
            .addFields(
              {
                name: "\u200b",
                value: `Neuer Kontostand: **${userProfile.balance}€**`,
              },
              {
                name: "\u200b",
                value: `Du hast **${xpToGive}XP** bekommen`,
              }
            );

          await i.update({
            ephemeral: true,
            embeds: [embed],
            components: [],
          });
        } else {
          userProfile.balance -= amount;
          userProfile.verloren += amount;
          xpToGive = 10;
          const embed = new EmbedBuilder()
            .setColor(0xff0000) // Rot für Verlust
            .setTitle("Oh nein!")
            .setThumbnail(result === "Kopf" ? headImageUrl : numberImageUrl)
            .setDescription(`Du hast verloren!\n Es war **${result}**`)
            .addFields(
              {
                name: "\u200b",
                value: `Neuer Kontostand: **${userProfile.balance}€**`,
              },
              {
                name: "\u200b",
                value: `Du hast **${xpToGive}XP** bekommen`,
              }
            );
          await i.update({
            ephemeral: true,
            embeds: [embed],
            components: [],
          });
        }

        await userProfile.save();
        await giveUserXP(interaction, xpToGive);
        collector.stop();
      });

      collector.on("end", async (collected) => {
        if (collected.size === 0) {
          await interaction.editReply({
            content: "Du hast keine Auswahl getroffen.",
            components: [],
          });
        }
      });
    } catch (error) {
      console.log(error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: `Ein Fehler ist aufgetreten: ${error.message}`,
          ephemeral: true,
        });
      }
    }
  },

  data: {
    name: "coinflip",
    description: "Wirf eine Münze",
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
