const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");

module.exports = {
  run: async ({ interaction }) => {
    try {
      // Überprüfen, ob die Interaktion gültig ist
      if (!interaction) return;
      await interaction.deferReply();

      const targetUser = interaction.options.getUser("user");

      let user1 = await UserProfile.findOne({
        userId: interaction.user.id,
      });
      const amount = interaction.options.getNumber("amount");
      const message = interaction.options.getString("message");
      let user2 = await UserProfile.findOne({
        userId: targetUser.id,
      });
      if (!user2) {
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription(`Der User hat noch kein Account`);
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      if (user1.balance < amount) {
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription(
            `Du hast nicht genug Geld. Du hast nur **${user1.balance}€**.`
          );
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      if (amount < 50) {
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription("Du musst mindestens **50€** überweisen!");
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      user1.balance -= amount;
      user2.balance += amount;
      await user1.save();
      await user2.save();
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Transaktion erfolgreich!")
        .setDescription(
          `Es wurden **${amount}€** an **${targetUser.username}** gesendet`
        );

      interaction.followUp({ embeds: [embed] });
      const dmEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Du hast Geld erhalten!")
        .setDescription(
          `**${interaction.user.username}** hat dir **${amount}€** gesendet`
        )
        if (message) {
            dmEmbed.addFields(
              {
                name: "\u200b",
                value: `${message}`,
              },
            );
          }
          
      try {
        await targetUser.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(
          "Could not send DM to the user. They might have DMs disabled."
        );
      }
    } catch (error) {
      console.log(error);
      const errorEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Ein Fehler ist aufgetreten!")
        .setDescription("Bitte versuche es später erneut.");
      interaction.followUp({ embeds: [errorEmbed] });
    }
  },

  data: {
    name: "transfer",
    description: "Transferiere deinen Kontostand zu einem anderen Benutzer",
    options: [
      {
        name: "user",
        type: 6,
        description: "Der Benutzer, dessen Profil angezeigt werden soll",
        required: true,
      },
      {
        name: "amount",
        description: "Betrag",
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
      {
        name: "message",
        description: "Deine Nachricht",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
};
