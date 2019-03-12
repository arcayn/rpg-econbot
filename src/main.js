const Discord = require('discord.js');
const storage = require('node-persist');
const Params = require('./opt.js');
const Commands = require('./commands.js');
const client = new Discord.Client();

const Priorities = {
	'ERROR': 5,
	'CRITICAL': 4,
	'HIGH': 3,
	'INFO': 2,
	'LOG': 1
}

var people = [];
var transactions = [];
var pages = [];

async function setup() {
  await storage.init({dir: Params.storageLocation});
  people = await storage.getItem('ADMIN_PEOPLE');
  communal = await storage.getItem('COMMUNAL');
  transactions = await storage.getItem('ADMIN_TRANSACTIONS');
  pages = await storage.getItem('ADMIN_PAGES');
  if (typeof(people) == 'undefined') {
    people = [];
  }
  if (typeof(transactions) == 'undefined') {
    transactions = [];
  }
  if (typeof(pages) == 'undefined') {
    pages = [];
	await storage.setItem('ADMIN_PAGES', pages);
  }
  if (typeof(await storage.getItem('COMMUNAL_PAGES')) == 'undefined') {
    await storage.setItem('COMMUNAL_PAGES', {})
  }
  if (typeof(communal) != 'number') {
    await storage.setItem('COMMUNAL', 0);
  }
}

function addTrans(trans) {
  transactions.push(trans);
  if (transactions.length > Params.keptTransactions) {
    transactions.shift();
  }
  storage.setItem("ADMIN_TRANSACTIONS", transactions);
}

async function addNewPerson(person) {
	people.push(person);
    storage.setItem('ADMIN_PEOPLE', people);
    var pObj = {'gp': 0,
		'level': 1,
		'xp': 0
	};
		
	pages = await storage.getItem('ADMIN_PAGES');
	for (var page in pages) {
		pObj[page[0]] = page[1];
	}
	
	await storage.setItem(person, pObj);
}

async function executeCommand(command, messageWords, person, admin, msg) {
	if (!Commands[command].adminOnly || admin) {
		var retVal = await Commands[command].action(storage, Params, messageWords, person, admin, msg, people, transactions);
		if (retVal) {
			addTrans(retVal);
		}
	}
}

var sendConsoleMsg = (msg, priority=Priorities.LOG) => {
	if (priority > 4 - Params.verbosity) { console.log(msg); }
}

setup();

client.on('ready', () => {
  sendConsoleMsg(`Logged in as ${client.user.tag}. Listening...`, Priorities.CRITICAL);
});

client.on('message', async (msg) => {
  var messageWords = msg.content.split(" ");
  if (msg.author.bot || messageWords[0] != '!scriba') { return; }
  messageWords.shift();
  var sentCommand = messageWords.shift().toLowerCase();
  var person = msg.author.username;
  
  if (!people.includes(person)) {
    await addNewPerson(person);
  }
  sendConsoleMsg("Recieved command: " + sentCommand, Priorities.LOG);
  var admin = (Params.adminNames.includes(person) && Params.adminChannels.includes(msg.channel.name)) ? true : false;
  for (var command in Commands.aliases) {
    if (Commands.aliases.hasOwnProperty(command)) {
        if (Commands.aliases[command].includes(sentCommand)) {
			await executeCommand(command, messageWords, person, admin, msg);
			break;
		}
    }
  }
});

client.login(Params.token);
