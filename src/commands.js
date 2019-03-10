//TODO: Add 'fairshare' command
//TODO: Add dnd autolevelling
Discord = require("discord.js");


const LEVELS = {
}

module.exports = {
	aliases: {
		"earn": ['earn', 'gain', 'obtain', 'recieve'],
		"spend": ['spend', 'lose', 'pay'],
		"communism": ['communism', 'pool'],
		"capitalism": ['capitalism', 'take', 'unpool'],
		"balance": ['balance', 'bal', 'balances', 'bals'],
		"transactions": ['trans', 'log', 'transactions'],
		"levelup": ['levelup', 'lvl'],
		"resetxp": ['resetxp', 'xpreset', ],
		"addxp": ['addxp', 'xp'],
		"party": ['party', 'people', 'levels', 'xplist']
	},
	earn: {
		isAdminOnly: false,
		action: earnCommand
	},
	spend: {
		isAdminOnly: false,
		action: spendCommand
	},
	communism: {
		isAdminOnly: false,
		action: communismCommand
	},
	capitalism: {
		isAdminOnly: false,
		action: capitalismCommand
	},
	balance: {
		isAdminOnly: false,
		action: balanceCommand
	},
	transactions: {
		isAdminOnly: false,
		action: transactionsCommand
	},
	levelup: {
		isAdminOnly: false,
		action: levelupCommand
	},
	resetxp: {
		isAdminOnly: false,
		action: resetxpCommand
	},
	addxp: {
		isAdminOnly: false,
		action: addxpCommand
	},
	party: {
		isAdminOnly: false,
		action: partyCommand
	}
}

var people = [];

async function checkTarget(person, storage) {
	if (!people.includes(person)) {
		people.push(person);
		storage.setItem('ADMIN_PEOPLE', people);
		await storage.setItem(person, {'gp': 0,
			'level': 1,
			'xp': 0
		});
	}
}

async function earnCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	var balInc = parseInt(params.shift());
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
    var personObj = await storage.getItem(person);
	personObj.gp = personObj.gp + balInc;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' balance is now at: **'+ (personObj.gp).toString() + 'gp**');
	var reason = (params.length) ? params.join(" ") : "no good reason";
	
    storage.setItem(person, personObj);
	
	return person + " earned **" + (balInc).toString() + "gp** for " + reason;
}

async function spendCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	var balDec = parseInt(params.shift());
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
    var personObj = await storage.getItem(person);
	if (personObj.gp - balDec < 0) {
		msg.reply('**Come back when you get some money buddy!**');
		return false;
	}
	
	personObj.gp = personObj.gp - balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' balance is now at: **'+ (personObj.gp).toString() + 'gp**');
	var reason = (params.length) ? params.join(" ") : "nothing in particular";
	
    storage.setItem(person, personObj);
	
	return person + " spent **" + (balDec).toString() + "gp** on " + reason;
}

async function communismCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	var balDec = parseInt(params.shift());
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
    var personObj = await storage.getItem(person);
	var communalBalance = await storage.getItem('COMMUNAL')
	
	if (personObj.gp - balDec < 0) {
		msg.reply('**Come back when you get some money buddy!**');
		return false;
	}
	
	personObj.gp = personObj.gp - balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' balance is now at: **'+ (personObj.gp).toString() + 'gp**, there is **' + (communalBalance + balDec).toString() + 'gp** in the communal pool');
	
    storage.setItem(person, personObj);
	storage.setItem('COMMUNAL', communalBalance + balDec);
	
	return false;
}

async function capitalismCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	var balInc = parseInt(params.shift());
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
    var personObj = await storage.getItem(person);
	var communalBalance = await storage.getItem('COMMUNAL')
	
	if (communalBalance - balInc < 0) {
		msg.reply('**Can\'t take that much!**');
		return false;
	}
	
	personObj.gp = personObj.gp + balInc;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' balance is now at: **'+ (personObj.gp).toString() + 'gp**, there is **' + (communalBalance - balInc).toString() + 'gp** in the communal pool');
	
    storage.setItem(person, personObj);
	storage.setItem('COMMUNAL', communalBalance - balInc);
	
	return false;
}

async function balanceCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
    var embed = new Discord.RichEmbed().setTitle("Current Balances:").setColor(0x00AE86)
	
    for (var i = 0; i < people.length; i++) {
       var personObj = await storage.getItem(people[i]);
       embed.addField(people[i], personObj.gp.toString(), true);
    }
	
    var communalBal = await storage.getItem('COMMUNAL');
    embed.addField('***Communal Pool***', communalBal.toString(), true);
    msg.channel.send({embed});
	
	return false;
}

async function transactionsCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople, transactions) {
	people = protoPeople;
    var embed = new Discord.RichEmbed().setTitle("Recent transactions:").setColor(0x00AE86)
    var text = "";
	
    for (var i = 0; i < transactions.length; i++) {
       text += "\n" + transactions[i];
    }
	
    embed.setDescription(text);
    msg.channel.send({embed});
	
	return false;
}
  
async function levelupCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	var inc = 1;
	if (isAdmin) {
		if (params.length) { inc = parseInt(params.shift()); }
		if (params.length) { person = params.shift(); await checkTarget(person, storage); }
	}

    var personObj = await storage.getItem(person);
	
	personObj.level += inc;
    storage.setItem(person, personObj);
	
	var personName = (isAdmin) ? person + " is" : "You are";
	
    msg.reply('Congratulations! ' + personName + ' now level **'+ (personObj.level).toString() + '**!');
	return false;
}

async function addxpCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	var inc = parseInt(params.shift());
	if (isAdmin) {
		if (params.length) { person = params.shift(); await checkTarget(person, storage); }
	}

    var personObj = await storage.getItem(person);
	
	personObj.xp += inc;
    storage.setItem(person, personObj);
	
	var personName = (isAdmin) ? person + " now has" : "You now have";
    msg.reply('Congratulations! ' + personName + ' **'+ (personObj.xp).toString() + 'xp**!');
	return false;
}

async function resetxpCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	if (isAdmin) {
		if (params.length) { person = params.shift(); await checkTarget(person, storage); }
	}

    var personObj = await storage.getItem(person);
	
	personObj.xp = 0;
    storage.setItem(person, personObj);
    msg.reply('Reset xp to 0');
	return false;
}

async function partyCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	var embed = new Discord.RichEmbed().setTitle("Current Levels:").setColor(0x00AE86);
	
    for (var i = 0; i < people.length; i++) {
       var personObj = await storage.getItem(people[i]);
       embed.addField(people[i], '**' + personObj.level.toString() + '** ' + personObj.xp.toString(), true);
    }
    msg.channel.send({embed});
	return false;
}
