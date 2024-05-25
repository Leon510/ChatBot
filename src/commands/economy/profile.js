const { EmbedBuilder } = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");
const calculateLevelXP = require("../utils/calculateLevelXP");

module.exports = {
  run: async ({ interaction }) => {
    try {
      // Überprüfen, ob die Interaktion gültig ist
      if (!interaction) return;

      const targetUser =
        interaction.options.getUser("user") || interaction.user;

      let userProfile = await UserProfile.findOne({
        userId: targetUser.id,
      });
      if (!userProfile) {
        userProfile = new UserProfile({
          userId: interaction.user.id,
        });

        await userProfile.save();
      }

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Dein Profil")
        .setDescription(`Kontostand** ${userProfile.balance}€**`);
      embed.addFields({
        name: "Gesamte Commands",
        value: `${userProfile.commands}`,
        inline: false,
      });
      embed.addFields({
        name: "letzter Daily",
        value: userProfile.lastDailyCollected
          ? userProfile.lastDailyCollected.toLocaleDateString()
          : "N/A",
        inline: false,
      });
      embed.addFields({
        name: "geholte Dailys",
        value: `${userProfile.dailyRewardCollected}`,
        inline: false,
      });
      embed.addFields({
        name: "Gewonnen",
        value: `${userProfile.gewonnen}€`,
        inline: false,
      });
      embed.addFields({
        name: "Verloren",
        value: `${userProfile.verloren}€`,
        inline: false,
      });

      // Calculate the total XP for the current level
      const totalXP = calculateLevelXP(userProfile.level);

      // Calculate the earned XP
      const earnedXP = userProfile.xp;

      // Calculate the XP ratio
      const xpRatio = earnedXP / totalXP;

      const progressBar =
        "[" +
        "█".repeat(Math.floor(xpRatio * 20)) +
        "▁".repeat(20 - Math.floor(xpRatio * 20)) +
        "]";

      embed.addFields({
        name: "XP Progress",
        value: progressBar + ` (${earnedXP}/${totalXP} XP)`,
        inline: false,
      });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },

  data: {
    name: "profile",
    description: "Erfahre deine Werte",
    options: [
      {
        name: "user",
        type: 6,
        description: "Der Benutzer, dessen Profil angezeigt werden soll",
        required: false,
      },
    ],
  },
};
