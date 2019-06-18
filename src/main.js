const Discord = require('discord.js');
const storage = require('node-persist');
var Params = require('./opt.js');
const Levels = require('./levels.js');
const Commands = require('./commands.js');
const client = new Discord.Client();
client.on('error', console.error);

Params.Levels = Levels;

const Priorities = {
	'ERROR': 5,
	'CRITICAL': 4,
	'HIGH': 3,
	'INFO': 2,
	'LOG': 1
}

var masterData;

async function setup() {
  masterData = {};
  await storage.init({dir: Params.storageLocation});
  
  masterData['SERVERS'] = await storage.getItem('SERVER_LIST');
  if (typeof(masterData['SERVERS']) == 'undefined')
	  masterData['SERVERS'] = [];
  
  let servers = masterData['SERVERS'];
  //console.log(servers); 

  for (var i = 0; i < servers.length; i++) {
	  let server = servers[i];
	  //console.log(server);
	  let data = {};
	  data['people'] = await storage.getItem(server + ':PEOPLE_LIST');
	  data['communal'] = await storage.getItem(server + ':COMMUNAL');
	  data['transactions'] = await storage.getItem(server + ':TRANSACTIONS');
	  data['pages'] = await storage.getItem(server + ':PAGE_LIST');
	  data['person_data'] = await storage.getItem(server + ':PEOPLE');
	  data['page_data'] = await storage.getItem(server + ':PAGES');
	  
	  if (typeof(data['people']) == 'undefined') {
		data['people'] = [];
	  }
	  if (typeof(data['transactions']) == 'undefined') {
		data['transactions'] = [];
	  }
	  if (typeof(data['pages']) == 'undefined') {
		data['pages'] = [];
		await storage.setItem(server + ':PAGE_LIST', []);
	  }
	  if (typeof(data['page_data']) == 'undefined') {
		data['page_data'] = {};
	  }
	  if (typeof(data['person_data']) == 'undefined') {
		data['person_data'] = {};
	  }
	  if (typeof(data['communal']) != 'number') {
		await storage.setItem(server + ':COMMUNAL', 0);
		data['communal'] = 0;
	  }
	  //console.log(data.person_data);
	  masterData[server] = data;
  }
  //console.log(masterData);
}

function updateStorage(val, key, server) {
	storage.setItem(server + ':' + key, val);
}

function updateServerData(server) {
	let datapoints = [
	['people', 'PEOPLE_LIST'],
	['communal', 'COMMUNAL'],
	['transactions', 'TRANSACTIONS'],
	['pages', 'PAGE_LIST'],
	['person_data', 'PEOPLE'],
	['page_data', 'PAGES']
	];
	
	for (var i = 0; i < datapoints.length; i++) {
		let datum = datapoints[i];
		updateStorage(masterData[server][datum[0]], datum[1], server); 
	}
}



async function addNewPerson(person, server) {
	masterData[server].people.push(person);
	updateStorage(masterData[server].people, 'PEOPLE_LIST', server);
    var pObj = {'gp': 0,
		'level': 1,
		'xp': 0
	};
		
	pages = await storage.getItem(server + ':PAGE_LIST');
		for (var i = 0; i < masterData[server].pages.length; i++) {
			let page = masterData[server].page_data[masterData[server].pages[i]];
			pObj[masterData[server].pages[i]] = page[0];
		}
	masterData[server].person_data[person] = pObj;
	updateStorage(masterData[server].person_data, 'PEOPLE', server);
}

async function giveUserError(msg, error) {
	msg.reply('**ERROR**: `' + error + '`');
}

async function executeCommand(command, messageWords, person, admin, msg, server) {
	if (!Commands[command].isAdminOnly || admin) {
		var retVal = await Commands[command].action(masterData[server], Params, messageWords, person, admin, msg);
		if (retVal[0] == 0) {
			masterData[server] = retVal[1];
			if (retVal[2]) {
				//console.log('here'); 
				updateServerData(server); 
			}
		}
                 else {
                   giveUserError(msg, retVal[1]);
		}
	} else {
		giveUserError(msg, 'This command requires admin!');
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
  var server = msg.guild.id;
  var person = msg.author.username;
  //console.log(masterData);
  if (!masterData['SERVERS'].includes(server)) {
	  masterData['SERVERS'].push(server);
	  await storage.setItem('SERVER_LIST', masterData['SERVERS']);
	  masterData = {};
	  await setup();
  }
  
  if (!masterData[server].people.includes(person)) {
    await addNewPerson(person, server);
  }
  sendConsoleMsg("Recieved command: " + sentCommand, Priorities.LOG);
  
  var admin = (Params.adminNames.includes(person) && Params.adminChannels.includes(msg.channel.name)) ? true : false;
  for (var command in Commands.aliases) {
    if (Commands.aliases.hasOwnProperty(command)) {
        if (Commands.aliases[command].includes(sentCommand)) {
			await executeCommand(command, messageWords, person, admin, msg, server);
			return;
		}
    }
  }
  
  giveUserError(msg, "No command by name " + sentCommand);
});

client.login(Params.token);
