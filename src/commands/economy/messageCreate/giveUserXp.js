const { EmbedBuilder } = require("discord.js");
const UserProfile = require("../../../schemas/UserProfile");
const calculateLevelXP = require("../../utils/calculateLevelXP");

/**
 * @param {Interaction} interaction
 * @param {number} xpToGive
 */
module.exports = async (interaction, xpToGive) => {
  console.log(`User ${interaction.user.id} received ${xpToGive} XP`);

  const query = {
    userId: interaction.user.id,
  };

  try {
    let userProfile = await UserProfile.findOne(query);

    if (userProfile) {
      userProfile.xp += xpToGive;
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

      await userProfile.save().catch((e) => console.log(e));
    } else {
      const newUserProfile = new UserProfile({
        userId: interaction.user.id,
        xp: xpToGive,
      });

      await newUserProfile.save().catch((e) => console.log(e));
    }
  } catch (error) {
    console.log(error);
  }
};
