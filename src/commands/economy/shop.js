const UserProfile = require("../../schemas/UserProfile");
const ShopItem = require("../../schemas/ShopItem");
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

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
        userId: interaction.user.id,
      });

      if (!userProfile) {
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle("Kein Account")
          .setDescription(
            "Du hast noch keinen Account. Gib /daily ein um einen Account zu erstellen"
          );
        await interaction.reply({ embeds: [embed] });
        return;
      }

      const shopItems = await ShopItem.find({});
      const rows = [];

      // Create buttons and action rows
      shopItems.forEach((item, index) => {
        const button = new ButtonBuilder()
          .setCustomId(`buy_${item.name}`)
          .setLabel(item.name)
          .setStyle(ButtonStyle.Primary);

        if (index % 5 === 0) {
          rows.push(new ActionRowBuilder());
        }
        rows[rows.length - 1].addComponents(button);
      });

      // Create a detailed embed message
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Shop")
        .setDescription("Hier sind die verfügbaren Items:")
        .setTimestamp()
        .setFooter({ text: "Shop" });

      shopItems.forEach(item => {
        embed.addFields([
          { name: item.name, value: `${item.cost}€\n${item.additional || ''}`, inline: false }
        ]);
      });

      await interaction.reply({ embeds: [embed], components: rows });

      await userProfile.save();
    } catch (error) {
      console.log(error);
    }
  },


  
  data: {
    name: "shop",
    description: "Kaufe mit deinem Geld Items",
  },
};
