const { EmbedBuilder } = require("discord.js");
const UserProfile = require("../../../schemas/UserProfile");
const calculateLevelXP = require("../../utils/calculateLevelXP");

/**
 * @param {Interaction} interaction
 * @param {number} xpToGive
 */
module.exports = async (interaction, xpToGive) => {
  console.log(`User ${interaction.user.id} received ${xpToGive} XP`);

  try {
    // Stellen Sie sicher, dass xpToGive eine gültige Zahl ist
    if (isNaN(xpToGive)) {
      throw new Error("Invalid XP value");
    }

    const query = {
      userId: interaction.user.id,
    };

    let userProfile = await UserProfile.findOne(query);

    if (userProfile) {
      // Aktualisieren Sie das XP-Profil des Benutzers
      userProfile.xp += xpToGive;

      // Überprüfen, ob der Benutzer ein neues Level erreicht hat
      if (userProfile.xp >= calculateLevelXP(userProfile.level)) {
        userProfile.xp = 0;
        userProfile.level += 1;

        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setDescription(
            `**${interaction.user.username}** hat das Level **${userProfile.level}** erreicht.`
          );

        await interaction.channel.send({ embeds: [embed] });
      }

      await userProfile.save(); // Fehler werden automatisch abgefangen
    } else {
      // Erstellen Sie ein neues UserProfile-Dokument für den Benutzer
      const newUserProfile = new UserProfile({
        userId: interaction.user.id,
        xp: xpToGive,
      });

      await newUserProfile.save(); // Fehler werden automatisch abgefangen
    }
  } catch (error) {
    console.error(error);
  }
};
