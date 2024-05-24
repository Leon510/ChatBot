const { EmbedBuilder } = require("discord.js");
const UserProfile = require("../../schemas/UserProfile");

module.exports = {
  run: async ({ interaction }) => {
    try {
      // Find all user profiles and sort them by balance in descending order
      const userProfiles = await UserProfile.find().sort({ balance: -1 });

      // Create an embed for the leaderboard
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Leaderboard");

      // Add each user to the embed
      for (let i = 0; i < userProfiles.length; i++) {
        const profile = userProfiles[i];
        // Fetch the user to get their username and avatar
        const user = await interaction.client.users.fetch(profile.userId);
        
        // Determine the medal based on the position
        let medal;
        if (i === 0) medal = '🥇';
        else if (i === 1) medal = '🥈';
        else if (i === 2) medal = '🥉';
        else medal = `#${i + 1}`;
  
        embed.addFields({ name: '\u200b', value: `${medal} - **${profile.balance}€**  ${user.tag}`, inline: false });
      }
  
      // Send the embed
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },

  data: {
    name: "leaderboard",
    description: "Zeigt das Leaderboard nach Kontostand",
  },
};
