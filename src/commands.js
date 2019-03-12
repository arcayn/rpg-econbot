//TODO: Add 'fairshare' command

Discord = require("discord.js");


const LEVELS = {
	'DnD5e': {
		values: [0, 300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000],
		cumulative: true
	},
	'none': {
		values: [0],
		cumulative: false
	}
};

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
		"party": ['party', 'people', 'levels', 'xp'],
		"nextlevel": ['nextlevel', 'next'],
		"pages": ['pages', 'p']
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
	},
	nextlevel: {
		isAdminOnly: false,
		action: nextlevelCommand
	},
	pages: {
		isAdminOnly: false,
		action: pagesCommand
	}
};

var people = [];
var pages = [];

const PAGE_ACTIONS = {
	'create': createPage,
	'toggle': togglePage,
	'add': addPageVariable,
	'sub': subPageVariable,
	'set': setPageVariable,
	'list': listPageVariable,
	'listall': listPages,
	'give': givePageVariable,
	'remove': removePage,
	'pool': poolPageVariable,
	'unpool': unpoolPageVariable
};

const PAGE_ATTRIBUTES = {
	'protected': 0,
	'poolable': 1,
	'totalled': 2,
	'transferrable': 3,
	'negativeable': 4
};

async function checkTarget(person, storage) {
	if (!people.includes(person)) {
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
}

function getPageObj(page, mode=0) {
	for (var i = 0; i < pages.length; i++) {
		if (pages[i][0] == page) {
			return (mode == 0) ? pages[i] : i;
		}
	}
	return false;
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
    var embed = new Discord.RichEmbed().setTitle("Current Balances:").setColor(globalParams.color);
	
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
    var embed = new Discord.RichEmbed().setTitle("Recent transactions:").setColor(globalParams.color);
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
	
	personObj.level = (personObj.level + inc < 1) ? 1 : personObj.level + inc;
	if (personObj.level <= LEVELS[globalParams.levelling].values.length) { personObj.xp = (LEVELS[globalParams.levelling].cumulative) ? LEVELS[globalParams.levelling].values[personObj.level - 1] : 0; }
	
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
	
	var currLevel = personObj.level;
	var newLevel;
	if (LEVELS[globalParams.levelling].cumulative) {
		console.log("here");
		for (var i = 0; i < LEVELS[globalParams.levelling].values.length; i++) {
			if (LEVELS[globalParams.levelling].values[i] < personObj.xp) {
				currLevel = i + 1;
			}
			if (LEVELS[globalParams.levelling].values[i] < personObj.xp + inc) {
				newLevel = i + 1;
			}
		}
		personObj.xp = personObj.xp + inc;
		if (currLevel != newLevel) { personObj.level = newLevel; }
	} else {
		var currXP = personObj.xp + inc;
		var levelCounter = 0;
		
		for (var i = personObj.level; i < LEVELS[globalParams.levelling].values.length; i++) {
			var tempXP = currXP - LEVELS[globalParams.levelling].values[i];
			if (tempXP < 0) {
				break;
			}
			currXP = tempXP;
			levelCounter++;
		}
		
		personObj.xp = currXP;
		personObj.level = personObj.level + levelCounter;	
	}
	
    storage.setItem(person, personObj);

	var personName = (isAdmin) ? person + " now has" : "You now have";
    var reply = 'Congratulations! ' + personName + ' **'+ (personObj.xp).toString() + 'xp**';
	
	if (currLevel != personObj.level) {
		var personName = (isAdmin) ? "is" : "are";
		reply +=  ' and ' + personName + ' level **'+ (personObj.level).toString() + '**';
	}
	
	msg.reply(reply + '!');
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
	var embed = new Discord.RichEmbed().setTitle("Current Levels:").setColor(globalParams.color);;
	
    for (var i = 0; i < people.length; i++) {
       var personObj = await storage.getItem(people[i]);
       embed.addField(people[i], '**' + personObj.level.toString() + '** ' + personObj.xp.toString(), true);
    }
    msg.channel.send({embed});
	return false;
}

async function nextlevelCommand (storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	if (LEVELS[globalParams.levelling].values.length <= 1) {
		msg.reply("No levelling system selected!");
		return false;
	}
	
	if (isAdmin) {
		if (params.length) { person = params.shift(); await checkTarget(person, storage); }
	}
	
	var personObj = await storage.getItem(person);
	
	if (LEVELS[globalParams.levelling].cumulative) {
		for (var i = 0; i < LEVELS[globalParams.levelling].values.length; i++) {
			if (personObj.xp < LEVELS[globalParams.levelling].values[i]) {
				msg.reply((LEVELS[globalParams.levelling].values[i] - personObj.xp).toString() + "xp until level " + (i+1).toString() + "!");
				break;
			}
		}
	} else {
		msg.reply((LEVELS[globalParams.levelling].values[personObj.level] - personObj.xp).toString() + "xp until level " + (personObj.level + 1).toString() + "!");
	}
	
	return false;
}

async function pagesCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	pages = await storage.getItem('ADMIN_PAGES');
	
	var page = params.shift();
	if (page == 'listall') {
		await listPages(page, storage, globalParams, params, person, isAdmin, msg);
		return false;
	}
	var sentAction = params.shift();
	
	for (var action in PAGE_ACTIONS) {
		if (PAGE_ACTIONS.hasOwnProperty(action)) {
			if (action == sentAction) {
				PAGE_ACTIONS[action](page, storage, globalParams, params, person, isAdmin, msg);
				break;
			}
		}
    }
	
	return false;
}


async function createPage(page, storage, globalParams, params, person, isAdmin, msg) {
	if (!isAdmin) {
		msg.reply('Only admins can create pages!');
		return false;
	}
	
	var startValue = 0;
	if (params.length) { startValue = parseInt(params.shift()); }
	
	//console.log(pages);
	pages.push([page, startValue, [false, false, false, false, false]]);
	storage.setItem('ADMIN_PAGES', pages);
	
	for (var i = 0; i < people.length; i++) {
		var personObj = await storage.getItem(people[i]);
		personObj[page] = startValue;
		storage.setItem(people[i], personObj);
	}
	
	var communalObj = await storage.getItem('COMMUNAL_PAGES');
	communalObj[page] = startValue;
	storage.setItem('COMMUNAL_PAGES', communalObj);
	
	msg.reply("Page " + page + " created successfully!");
	return true;
}

async function listPages(page, storage, globalParams, params, person, isAdmin, msg) {
	var embed = new Discord.RichEmbed().setTitle("All pages:").setColor(globalParams.color);
    var text = "";
	
    for (var i = 0; i < pages.length; i++) {
       text += "\n" + pages[i][0];
    }
	
    embed.setDescription(text);
    msg.channel.send({embed});
	
	return false;
}

async function removePage(page, storage, globalParams, params, person, isAdmin, msg) {
	if (!isAdmin) {
		msg.reply('Only admins can delete pages!');
		return false;
	}
	
	pages.splice(getPageObj(page, 1), 1);
	storage.setItem('ADMIN_PAGES', pages);
	
	for (var i = 0; i < people.length; i++) {
		var personObj = await storage.getItem(people[i]);
		delete personObj[page];
		storage.setItem(people[i], personObj);
	}
	
	msg.reply("Page " + page + " successfully removed");
	return true;
}

async function togglePage(page, storage, globalParams, params, person, isAdmin, msg) {
	if (!isAdmin) {
		msg.reply('Only admins can manage pages!');
		return false;
	}
	
	var pageObj;
	for (var i = 0; i < pages.length; i++) {
		if (pages[i][0] == page) {
			pageObj = pages[i];
			break;
		}
	}
	
	if (pageObj == undefined) {
		msg.reply("Page doesn't exist");
		return false;
	}
	
	var property = params.shift();

	pageObj[2][PAGE_ATTRIBUTES[property]] = (pageObj[2][PAGE_ATTRIBUTES[property]]) ? false : true;
	storage.setItem('ADMIN_PAGES', pages);
	
	msg.reply("Set attribute **" + property + "** to **" + pageObj[2][PAGE_ATTRIBUTES[property]].toString() + "**");

	return true;
}

async function addPageVariable(page, storage, globalParams, params, person, isAdmin, msg) {
	if (getPageObj(page)[2][0] && !isAdmin) {
		msg.reply('Only admins can modify this page!');
		return false;
	}
	
	var balInc = parseInt(params.shift());
	balInc = (balInc < 0) ? 0 : balInc;
	
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
    var personObj = await storage.getItem(person);
	personObj[page] = personObj[page] + balInc;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**');

    storage.setItem(person, personObj);
	
	return true;
}

async function subPageVariable(page, storage, globalParams, params, person, isAdmin, msg) {
	var pageObj = getPageObj(page);
	if (pageObj[2][0] && !isAdmin) {
		msg.reply('Only admins can modify this page!');
		return false;
	}
	
	var balDec = parseInt(params.shift());
	balDec = (balDec < 0) ? 0 : balDec;
	
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
    var personObj = await storage.getItem(person);
	
	if (personObj[page] - balDec < 0 && !pageObj[2][4]) {
		msg.reply(page + ' value not high enough!');
		return false;
	}
	personObj[page] = personObj[page] - balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**');

    storage.setItem(person, personObj);
	
	return true;
}

async function setPageVariable(page, storage, globalParams, params, person, isAdmin, msg) {
	var pageObj = getPageObj(page);
	if (pageObj[2][0] && !isAdmin) {
		msg.reply('Only admins can modify this page!');
		return false;
	}
	
	var balSet = parseInt(params.shift());
	
	balSet = (balSet < 0 && !pageObj[2][4]) ? 0 : balSet;
	
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
    var personObj = await storage.getItem(person);
	personObj[page] = balSet;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**');

    storage.setItem(person, personObj);
	
	return true;
}

async function listPageVariable(page, storage, globalParams, params, person, isAdmin, msg) {
    var embed = new Discord.RichEmbed().setTitle("Current values of " + page + ":").setColor(globalParams.color);
	
	var total = 0;
    for (var i = 0; i < people.length; i++) {
       var personObj = await storage.getItem(people[i]);
	   total += personObj[page];
       embed.addField(people[i], personObj[page].toString(), true);
    }
	
	var pageObj = getPageObj(page);
	if (pageObj[2][1]) {
		var communalObj = await storage.getItem('COMMUNAL_PAGES');
		total += communalObj[page];
		embed.addField('***Communal Pool***', communalObj[page].toString(), true);
	}
	if (pageObj[2][2]) {
		embed.addField('***Party Total***', total.toString(), true);
	}
		
    msg.channel.send({embed});	
	return false;
}

async function givePageVariable(page, storage, globalParams, params, person, isAdmin, msg) {
	var pageObj = getPageObj(page);
	if (pageObj[2][0] && !isAdmin) {
		msg.reply('Only admins can modify this page!');
		return false;
	}
	if (!pageObj[2][3]) {
		msg.reply('Cannot transfer this page value!');
		return false;
	}
	
	var balDec = parseInt(params.shift());
	var target = params.shift();
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
	
    var personObj = await storage.getItem(person);
	var targetObj = await storage.getItem(target);
	
	if (personObj[page] - balDec < 0 && !pageObj[2][4]) {
		msg.reply(page + ' value not high enough!');
		return false;
	}
	
	personObj[page] = personObj[page] - balDec;
	targetObj[page] = targetObj[page] + balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**, ' + target + "'s is now: **"+ (targetObj[page]).toString() + '**');

    storage.setItem(person, personObj);
	storage.setItem(target, targetObj);
	
	return true;
}

async function poolPageVariable(page, storage, globalParams, params, person, isAdmin, msg) {
	var pageObj = getPageObj(page);
	if (pageObj[2][0] && !isAdmin) {
		msg.reply('Only admins can modify this page!');
		return false;
	}
	if (!pageObj[2][1]) {
		msg.reply('Cannot pool this page value!');
		return false;
	}
	
	var balDec = parseInt(params.shift());
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
	
    var personObj = await storage.getItem(person);
	var targetObj = await storage.getItem('COMMUNAL_PAGES');
	
	if (personObj[page] - balDec < 0 && !pageObj[2][4]) {
		msg.reply(page + ' value not high enough!');
		return false;
	}
	
	personObj[page] = personObj[page] - balDec;
	targetObj[page] = targetObj[page] + balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**, the communal pool\'s is now: **'+ (targetObj[page]).toString() + '**');

    storage.setItem(person, personObj);
	storage.setItem('COMMUNAL_PAGES', targetObj);
	
	return true;
}

async function unpoolPageVariable(page, storage, globalParams, params, person, isAdmin, msg) {
	var pageObj = getPageObj(page);
	if (pageObj[2][0] && !isAdmin) {
		msg.reply('Only admins can modify this page!');
		return false;
	}
	if (!pageObj[2][1]) {
		msg.reply('Cannot pool this page value!');
		return false;
	}
	
	var balInc = parseInt(params.shift());
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
	
    var personObj = await storage.getItem(person);
	var targetObj = await storage.getItem('COMMUNAL_PAGES');
	
	if (targetObj[page] - balInc < 0 && !pageObj[2][4]) {
		msg.reply(page + ' value not high enough!');
		return false;
	}
	
	personObj[page] = personObj[page] + balInc;
	targetObj[page] = targetObj[page] - balInc;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**, the communal pool\'s is now: **'+ (targetObj[page]).toString() + '**');

    storage.setItem(person, personObj);
	storage.setItem('COMMUNAL_PAGES', targetObj);
	
	return true;
}
