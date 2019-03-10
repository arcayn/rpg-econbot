const Discord = require('discord.js');
const storage = require('node-persist');
const Params = require('./opt.js')
const client = new Discord.Client();

//await storage.setItem('name','yourname')
//console.log(await storage.getItem('name'));

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

var people = [];
var transactions = [];

async function setup() {
  await storage.init({dir: Params.storageLocation});
  people = await storage.getItem('ADMIN_PEOPLE');
  communal = await storage.getItem('COMMUNAL');
  transactions = await storage.getItem('ADMIN_TRANSACTIONS');
  if (typeof(people) == 'undefined') {
    people = [];
  }
  if (typeof(transactions) == 'undefined') {
    transactions = [];
  }
  if (typeof(communal) != 'number') {
    await storage.setItem('COMMUNAL', 0);
  }
  //people.shift();
  //transactions = [];
}

function addTrans(trans) {
  transactions.push(trans);
  if (transactions.length > 15) {
    transactions.shift();
  }
  storage.setItem("ADMIN_TRANSACTIONS", transactions);
}

setup();

client.on('message', async (msg) => {
  var wordz = msg.content.split(" ");
  if (msg.author.bot || msg.content.substr(0,1) != '!') { return; }
  var person = msg.author.username;
  if (!people.includes(person)) {
    people.push(person);
    storage.setItem('ADMIN_PEOPLE', people);
    await storage.setItem(person, 0);
    await storage.setItem(person + '_xp', 0);
    await storage.setItem(person + '_level', 0);
  }
  var admin = (Params.adminUsernames.includes(person) && Params.adminChannels.includes(msg.channel.name)) ? true : false;

  if (wordz[0] === '!earn') {
    wordz.shift();
    var inc = parseInt(wordz.shift());
    console.log(inc);
    if (admin) { person = wordz.shift(); }
    console.log(person);
    var curr = await storage.getItem(person);
    storage.setItem(person, inc + curr);
    msg.reply('Your balance is now at: **'+ (inc + curr).toString() + 'gp**');
    var reason = wordz.join(" ");
    addTrans(person + " earned **" + (inc).toString() + "gp** for " + reason);
  }
  else if (wordz[0] === '!spend') {
    wordz.shift();
    var dec = parseInt(wordz.shift());
    if (admin) { person = wordz.shift(); }
    var curr = await storage.getItem(person);
    if ((curr - dec) < 0) {
      msg.reply('**Come back when you have some money buddy!**');
    }
    else {
      storage.setItem(person, curr - dec);
      msg.reply('Your balance is now at: **'+ (curr - dec).toString() + 'gp**');
      var reason = wordz.join(" ");
      addTrans(person + " spent **" + (dec).toString() + "gp** on " + reason);
    }
  }
  else if (wordz[0] === '!communism') {
    var dec = parseInt(wordz[1]);
    if (wordz[2] && admin) { person = wordz[2]; }
    var curr = await storage.getItem(person);
    var comm = await storage.getItem('COMMUNAL');
    if ((curr - dec) < 0) {
      msg.reply('**Come back when you have some money buddy!**');
    }
    else {
      storage.setItem(person, curr - dec);
      storage.setItem('COMMUNAL', comm + dec);
      msg.reply('Your balance is now at: **'+ (curr - dec).toString() + 'gp**, there is **' + (comm + dec).toString() + 'gp** in the communal pool');
    }

  }
  else if (wordz[0] === '!fairshare') {

  }
  else if (wordz[0] === '!balance') {
    var embed = new Discord.RichEmbed().setTitle("Current Balances:").setColor(0x00AE86)
    for (var i = 0; i < people.length; i++) {
       var bal = await storage.getItem(people[i]);
       embed.addField(people[i], bal.toString(), true);
    }
    var bal = await storage.getItem('COMMUNAL');
    embed.addField('***Communal Pool***', bal.toString(), true);
    msg.channel.send({embed});
  }
  else if (wordz[0] === '!transactions') {
    var embed = new Discord.RichEmbed().setTitle("Recent transactions:").setColor(0x00AE86)
    var text = "";
    for (var i = 0; i < transactions.length; i++) {
       text += "\n" + transactions[i];
    }
    embed.setDescription(text);
    msg.channel.send({embed});
  }
  else if (wordz[0] === '!capitalism') {
    var dec = parseInt(wordz[1]);
    if (wordz[2] && admin) { person = wordz[2]; }
    var curr = await storage.getItem(person);
    var comm = await storage.getItem('COMMUNAL');
    if ((comm - dec) < 0) {
      msg.reply('**No Apple AirPods for you!**');
    }
    else {
      storage.setItem(person, curr + dec);
      storage.setItem('COMMUNAL', comm - dec);
      msg.reply('Your balance is now at: **'+ (curr + dec).toString() + 'gp**, there is **' + (comm - dec).toString() + 'gp** in the communal pool');
    }
  }
  else if (wordz[0] === '!levelup') {
    if (wordz[2] && admin) { person = wordz[2]; }
    var inc = 1;
    if (wordz[1] && admin) {inc = parseInt(wordz[1]);}
    var curr = await storage.getItem(person + '_level');
    storage.setItem(person + '_level', curr + inc);
    msg.reply('Congratulations! You are now level **'+ (curr + inc).toString() + '**');
  }
  else if (wordz[0] === '!addxp') {
    if (wordz[2] && admin) { person = wordz[2]; }
    var curr = await storage.getItem(person + '_xp');
    var inc = wordz[1];
    storage.setItem(person + '_xp', curr + inc);
    msg.reply('Congratulations! You now have **'+ (curr + inc).toString() + '**xp');
  }
  else if (wordz[0] === '!resetxp') {
   if (wordz[1] && admin) { person = wordz[1]; }
    var curr = await storage.getItem(person + '_xp');
    storage.setItem(person + '_xp', 0);
    msg.reply('Reset your xp to 0');
  }
  else if (wordz[0] === '!party') {
      var embed = new Discord.RichEmbed().setTitle("Current Levels:").setColor(0x00AE86)
    for (var i = 0; i < people.length; i++) {
       var lvl = await storage.getItem(people[i] + '_level');
       var xp = await storage.getItem(people[i] + '_xp');
       embed.addField(people[i], '**' + lvl.toString() + '** ' + xp.toString(), true);
    }
    msg.channel.send({embed});
  }
  else if (wordz[0] == "!addtarget" && admin) {
    var person = wordz[1];
    people.push(person);
    storage.setItem('ADMIN_PEOPLE', people);
    await storage.setItem(person, 0);
    await storage.setItem(person + '_xp', 0);
    await storage.setItem(person + '_level', 0);
  }

});

client.login(Params.token);
