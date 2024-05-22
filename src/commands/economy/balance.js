const { EmbedBuilder } = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");

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
        const embed = new EmbedBuilder()

          .setColor(0x0099ff)
          .setTitle("Dein Kontostand")
          .setDescription(`Dein Kontostand beträgt ${userProfile.balance}€`);
        await interaction.reply({ embeds: [embed] });
      } else {
        userProfile = new UserProfile({
          userId: interaction.member.id,
        });
        const embed = new EmbedBuilder()

          .setColor(0x0099ff)
          .setTitle("Dein Kontostand")
          .setDescription(
            `Du hast noch kein Konto! Ich habe eins für dich erstellt. Gib /daily ein um dein täglichen Bonus zu bekommen`
          );

        await interaction.reply({
          ephemeral: true,
          embeds: [embed],
        });

        await userProfile.save();

        return;
      }
    } catch (error) {
      console.log(error);
    }
  },

  data: {
    name: "balance",
    description: "Erfahre deinen aktuellen Kontostand",
  },
};
