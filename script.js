const mongoose = require('mongoose');
const ShopItem = require('./src/schemas/ShopItem');

mongoose.connect('mongodb+srv://leoncieslik23:0Mr61N1BOM9pgbyO@discorduser.te9rvys.mongodb.net/?retryWrites=true&w=majority&appName=DiscordUser', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected...");
  })
  .catch((err) => console.log(err));

const items = [
  { name: 'Item4', cost: 300, description: 'Description 4', additional: 'Additional 4' },
];

ShopItem.insertMany(items)
  .then(() => console.log('Items added'))
  .catch((err) => console.log(err));