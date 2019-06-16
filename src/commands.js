//TODO: Add 'fairshare' command

Discord = require("discord.js");

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
		"pages": ['pages', 'p'],
		"removePerson": ['removeperson']
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
	},
	removePerson: {
		isAdminOnly: true,
		action: removePerson
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
	
	if (isNaN(balInc) || balInc <= 0)
		return [1, 'Enter a valid positive number!'];
	
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
    var personObj = await storage.getItem(person);
	personObj.gp = personObj.gp + balInc;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' balance is now at: **'+ (personObj.gp).toString() + 'gp**');
	var reason = (params.length) ? params.join(" ") : "no good reason";
	
    storage.setItem(person, personObj);
	
	return [0, person + " earned **" + (balInc).toString() + "gp** for " + reason];
}

async function spendCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	var balDec = parseInt(params.shift());
	
	if (isNaN(balDec) || balDec <= 0)
		return [1, 'Enter a valid positive number!'];
	
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
	
	return [0, person + " spent **" + (balDec).toString() + "gp** on " + reason];
}

async function communismCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	var balDec = parseInt(params.shift());
	
	if (isNaN(balDec) || balDec <= 0)
		return [1, 'Enter a valid positive number!'];
	
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
	
	if (isNaN(balInc) || balInc <= 0)
		return [1, 'Enter a valid positive number!'];
	
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
		if (isNaN(inc))
			return [1, 'Enter a valid number!'];
		if (params.length) { person = params.shift(); await checkTarget(person, storage); }
	}

    var personObj = await storage.getItem(person);
	
	personObj.level = (personObj.level + inc < 1) ? 1 : personObj.level + inc;
	if (personObj.level <= globalParams.Levels[globalParams.levelling].values.length) { personObj.xp = (globalParams.Levels[globalParams.levelling].cumulative) ? globalParams.Levels[globalParams.levelling].values[personObj.level - 1] : 0; }
	
    storage.setItem(person, personObj);
	
	var personName = (isAdmin) ? person + " is" : "You are";
	
    msg.reply('Congratulations! ' + personName + ' now level **'+ (personObj.level).toString() + '**!');
	return false;
}

async function addxpCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	var inc = parseInt(params.shift());
	if (isNaN(inc))
		return [1, 'Enter a valid number!'];
	
	if (isAdmin) {
		if (params.length) { person = params.shift(); await checkTarget(person, storage); }
	}

    var personObj = await storage.getItem(person);
	
	var currLevel = personObj.level;
	var newLevel;
	if (globalParams.Levels[globalParams.levelling].cumulative) {
		console.log("here");
		for (var i = 0; i < globalParams.Levels[globalParams.levelling].values.length; i++) {
			if (globalParams.Levels[globalParams.levelling].values[i] < personObj.xp) {
				currLevel = i + 1;
			}
			if (globalParams.Levels[globalParams.levelling].values[i] < personObj.xp + inc) {
				newLevel = i + 1;
			}
		}
		personObj.xp = personObj.xp + inc;
		if (currLevel != newLevel) { personObj.level = newLevel; }
	} else {
		var currXP = personObj.xp + inc;
		var levelCounter = 0;
		
		for (var i = personObj.level; i < globalParams.Levels[globalParams.levelling].values.length; i++) {
			var tempXP = currXP - globalParams.Levels[globalParams.levelling].values[i];
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
	if (globalParams.Levels[globalParams.levelling].values.length <= 1) {
		msg.reply("No levelling system selected!");
		return false;
	}
	
	if (isAdmin) {
		if (params.length) { person = params.shift(); await checkTarget(person, storage); }
	}
	
	var personObj = await storage.getItem(person);
	
	if (globalParams.Levels[globalParams.levelling].cumulative) {
		for (var i = 0; i < globalParams.Levels[globalParams.levelling].values.length; i++) {
			if (personObj.xp < globalParams.Levels[globalParams.levelling].values[i]) {
				msg.reply((globalParams.Levels[globalParams.levelling].values[i] - personObj.xp).toString() + "xp until level " + (i+1).toString() + "!");
				break;
			}
		}
	} else {
		msg.reply((globalParams.Levels[globalParams.levelling].values[personObj.level] - personObj.xp).toString() + "xp until level " + (personObj.level + 1).toString() + "!");
	}
	
	return false;
}

async function removePerson(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	if (params.length) 
		var target = params.shift();
	else
		return [1, "Enter a user to remove!"]
	
	for (var i = 0; i < people.length; i++) {
		if (people[i] == target) {
			people.splice(i,1);
			await storage.setItem('ADMIN_PEOPLE', people);
			return false;
		}
	}
	
	return [1, "No user by name " + target];
}

async function pagesCommand(storage, globalParams, params, person, isAdmin, msg, protoPeople) {
	people = protoPeople;
	pages = await storage.getItem('ADMIN_PAGES');
	
	if (params.length)
		var page = params.shift();
	else
		return [1, 'Enter a page to modify!'];
	
	if (page == 'listall') {
		await listPages(page, storage, globalParams, params, person, isAdmin, msg);
		return false;
	}
	
	if (!pages.includes(page))
		return [1, 'Page ' + page + 'does not exist!'];
	
	if (params.length)
		var sentAction = params.shift();
	else
		return [1, 'Enter a command to execute on the page!'];
	
	for (var action in PAGE_ACTIONS) {
		if (PAGE_ACTIONS.hasOwnProperty(action)) {
			if (action == sentAction) {
				return PAGE_ACTIONS[action](page, storage, globalParams, params, person, isAdmin, msg);
			}
		}
    }
	
	return false;
}


async function createPage(page, storage, globalParams, params, person, isAdmin, msg) {
	if (!isAdmin) {
		return [1, 'Only admins can create pages'];
	}
	
	var startValue = parseInt(params.shift());
	if (isNaN(startValue))
		startValue = 0;
	
	for (var i = 0; i < pages.length; i++) {
		if (pages[i][0] == page)
			return [1, "Page already exists"];
	}
	
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
	return false;
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
		return [1, 'Only admins can delete pages!'];
	}
	
	pages.splice(getPageObj(page, 1), 1);
	storage.setItem('ADMIN_PAGES', pages);
	
	for (var i = 0; i < people.length; i++) {
		var personObj = await storage.getItem(people[i]);
		delete personObj[page];
		storage.setItem(people[i], personObj);
	}
	
	msg.reply("Page " + page + " successfully removed");
	return false;
}

async function togglePage(page, storage, globalParams, params, person, isAdmin, msg) {
	if (!isAdmin) {
		return [1, 'Only admins can manage pages!'];
	}
	
	var pageObj;
	for (var i = 0; i < pages.length; i++) {
		if (pages[i][0] == page) {
			pageObj = pages[i];
			break;
		}
	}
	
	if (pageObj == undefined) {
		return [1, "Page doesn't exist"];
	}
	
	var property = params.shift();
	
	if (!(property in PAGE_ATTRIBUTES))
		return [1, "Attribute doesn't exist"];

	pageObj[2][PAGE_ATTRIBUTES[property]] = (pageObj[2][PAGE_ATTRIBUTES[property]]) ? false : true;
	storage.setItem('ADMIN_PAGES', pages);
	
	msg.reply("Set attribute **" + property + "** to **" + pageObj[2][PAGE_ATTRIBUTES[property]].toString() + "**");

	return false;
}

async function addPageVariable(page, storage, globalParams, params, person, isAdmin, msg) {
	if (getPageObj(page)[2][0] && !isAdmin) {
		return [1, 'Only admins can modify this page!'];
	}
	
	var balInc = parseInt(params.shift());
	if (isNaN(balInc) || balInc <= 0)
		return [1, 'Enter a valid positive number!'];
	
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
    var personObj = await storage.getItem(person);
	personObj[page] = personObj[page] + balInc;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**');

    storage.setItem(person, personObj);
	
	return false;
}

async function subPageVariable(page, storage, globalParams, params, person, isAdmin, msg) {
	var pageObj = getPageObj(page);
	if (pageObj[2][0] && !isAdmin) {
		return [1, 'Only admins can modify this page!'];
	}
	
	var balDec = parseInt(params.shift());
	if (isNaN(balDec) || balDec <= 0)
		return [1, 'Enter a valid positive number!'];
	
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
    var personObj = await storage.getItem(person);
	
	if (personObj[page] - balDec < 0 && !pageObj[2][4]) {
		return [1, page + ' value not high enough!'];
	}
	personObj[page] = personObj[page] - balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**');

    storage.setItem(person, personObj);
	
	return false;
}

async function setPageVariable(page, storage, globalParams, params, person, isAdmin, msg) {
	var pageObj = getPageObj(page);
	if (pageObj[2][0] && !isAdmin) {
		return [1, 'Only admins can modify this page!'];
	}
	
	var balSet = parseInt(params.shift());
	if (isNaN(balSet))
		return [1, 'Enter a valid number!'];
	
	balSet = (balSet < 0 && !pageObj[2][4]) ? 0 : balSet;
	
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
    var personObj = await storage.getItem(person);
	personObj[page] = balSet;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**');

    storage.setItem(person, personObj);
	
	return false;
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
		return [1, 'Only admins can modify this page!'];
	}
	if (!pageObj[2][3]) {
		return [1, 'Cannot transfer this page value!'];
	}
	
	var balDec = parseInt(params.shift());
	if (isNaN(balDec) || balDec <= 0)
		return [1, 'Enter a valid positive number!'];
	
	if (params.length)
		var target = params.shift();
	else
		return [1, 'Enter a give target'];
	
	if (!people.includes(target))
		return [1, "No user by name " + target];
	
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
	
    var personObj = await storage.getItem(person);
	var targetObj = await storage.getItem(target);
	
	if (personObj[page] - balDec < 0 && !pageObj[2][4]) {
		return [1, page + ' value not high enough!'];
	}
	
	personObj[page] = personObj[page] - balDec;
	targetObj[page] = targetObj[page] + balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**, ' + target + "'s is now: **"+ (targetObj[page]).toString() + '**');

    storage.setItem(person, personObj);
	storage.setItem(target, targetObj);
	
	return false;
}

async function poolPageVariable(page, storage, globalParams, params, person, isAdmin, msg) {
	var pageObj = getPageObj(page);
	if (pageObj[2][0] && !isAdmin) {
		return [1, 'Only admins can modify this page!'];
	}
	if (!pageObj[2][1]) {
		return [1, 'Cannot pool this page value!'];
	}
	
	var balDec = parseInt(params.shift());
	if (isNaN(balDec) || balDec <= 0)
		return [1, 'Enter a valid positive number!'];

    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
	
    var personObj = await storage.getItem(person);
	var targetObj = await storage.getItem('COMMUNAL_PAGES');
	
	if (personObj[page] - balDec < 0 && !pageObj[2][4]) {
		return [1, page + ' value not high enough!'];
	}
	
	personObj[page] = personObj[page] - balDec;
	targetObj[page] = targetObj[page] + balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**, the communal pool\'s is now: **'+ (targetObj[page]).toString() + '**');

    storage.setItem(person, personObj);
	storage.setItem('COMMUNAL_PAGES', targetObj);
	
	return false;
}

async function unpoolPageVariable(page, storage, globalParams, params, person, isAdmin, msg) {
	var pageObj = getPageObj(page);
	if (pageObj[2][0] && !isAdmin) {
		return [1, 'Only admins can modify this page!'];
	}
	if (!pageObj[2][1]) {
		return [1, 'Cannot pool this page value!'];
	}
	
	var balInc = parseInt(params.shift());
	if (isNaN(balInc) || balInc <= 0)
		return [1, 'Enter a valid positive number!'];
	
    if (isAdmin && params.length) { person = params.shift(); await checkTarget(person, storage); }
	
    var personObj = await storage.getItem(person);
	var targetObj = await storage.getItem('COMMUNAL_PAGES');
	
	if (targetObj[page] - balInc < 0 && !pageObj[2][4]) {
		return [1, page + ' value not high enough!'];
	}
	
	personObj[page] = personObj[page] + balInc;
	targetObj[page] = targetObj[page] - balInc;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**, the communal pool\'s is now: **'+ (targetObj[page]).toString() + '**');

    storage.setItem(person, personObj);
	storage.setItem('COMMUNAL_PAGES', targetObj);
	
	return false;
}
