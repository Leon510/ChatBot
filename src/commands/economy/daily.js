const UserProfile = require("../../schemas/UserProfile");
const { EmbedBuilder } = require("discord.js");

const dailyAmount = 500;

module.exports = {
  run: async ({ interaction }) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "You must be in a server to use this command!",
        ephemeral: true,
      });
      return;
    }

    try {

      let userProfile = await UserProfile.findOne({
        userId: interaction.member.id,
      });

      if (userProfile) {
        const lastDailyDate = userProfile.lastDailyCollected?.toDateString();
        const currentDate = new Date().toDateString();
        if (lastDailyDate === currentDate) {
          const embed = new EmbedBuilder()

            .setColor(0x0099ff)
            .setTitle("Täglicher Bonus")
            .setDescription(
              `Du hast den Täglichen Bonus bereits erhalten! Dein Aktueller Kontostand beträgt **${userProfile.balance}€**`
            );
            await interaction.reply({ embeds: [embed], ephemeral: true });

          return;
        }
      } else {
        userProfile = new UserProfile({
          userId: interaction.member.id,
        });
      }

      userProfile.balance += dailyAmount;
      userProfile.lastDailyCollected = new Date();
      await userProfile.save();

      const embed = new EmbedBuilder()

      .setColor(0x0099ff)
      .setTitle("Täglicher Bonus")
      .setDescription(
        `Dein Täglichen Bonus von **${dailyAmount}€** hast du erhalten. \nDu hast jetzt **${userProfile.balance}€**`
      );
      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.log(error);
    }
  },

  data: {
    name: "daily",
    description: "Get your daily reward!",
  },
};
