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
		"resetxp": ['resetxp', 'xpreset'],
		"addxp": ['addxp', 'xp', 'xpadd'],
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

function addTrans(trans, data, keptTransactions) {
  data.transactions.push(trans);
  if (data.transactions.length > keptTransactions) {
    data.transactions.shift();
  }
  return data;
}

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

async function checkTarget(person, data) {
	if (!data.people.includes(person)) {
		data.people.push(person);
		
		var pObj = {'gp': 0,
			'level': 1,
			'xp': 0
		};
		
		for (var i = 0; i < data.pages.length; i++) {
			let page = data.page_data[data.pages[i]];
			pObj[data.pages[i]] = page[0];
		}
		data.person_data[person] = pObj;
	}
	return data;
}

function getPageObj(page, data) {
	return data.page_data[page];
}

async function earnCommand(data, globalParams, params, person, isAdmin, msg) {
	var balInc = parseInt(params.shift());
	
	if (isNaN(balInc) || balInc <= 0)
		return [1, 'Enter a valid positive number!'];
	
    if (isAdmin && params.length) { person = params.shift(); data = await checkTarget(person, data); }
    let personObj = data.person_data[person];
	personObj.gp = personObj.gp + balInc;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' balance is now at: **'+ (personObj.gp).toString() + 'gp**');
	var reason = (params.length) ? params.join(" ") : "no good reason";
	
	
	data = addTrans(person + " earned **" + (balInc).toString() + "gp** for " + reason, data, globalParams.keptTransactions);
	return [0, data, true];
}

async function spendCommand(data, globalParams, params, person, isAdmin, msg) {
	var balDec = parseInt(params.shift());
	
	if (isNaN(balDec) || balDec <= 0)
		return [1, 'Enter a valid positive number!'];
	
    if (isAdmin && params.length) { person = params.shift(); data = await checkTarget(person, data); }
    let personObj = data.person_data[person];
	if (personObj.gp - balDec < 0) {
		return [1, 'come back when you get some money buddy!'];
	}
	
	personObj.gp = personObj.gp - balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' balance is now at: **'+ (personObj.gp).toString() + 'gp**');
	var reason = (params.length) ? params.join(" ") : "nothing in particular";
	
    data = addTrans(person + " spent **" + (balDec).toString() + "gp** on " + reason, data, globalParams.keptTransactions);
	return [0, data, true];
}

async function communismCommand(data, globalParams, params, person, isAdmin, msg) {
	var balDec = parseInt(params.shift());
	
	if (isNaN(balDec) || balDec <= 0)
		return [1, 'Enter a valid positive number!'];
	
    if (isAdmin && params.length) { person = params.shift(); data = await checkTarget(person, data); }
    let personObj = data.person_data[person];
	var communalBalance = data.communal;
	
	if (personObj.gp - balDec < 0)
		return [1, 'Come back when you get some money buddy!'];
	
	personObj.gp = personObj.gp - balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	msg.reply(personName + ' balance is now at: **'+ (personObj.gp).toString() + 'gp**, there is **' + (communalBalance + balDec).toString() + 'gp** in the communal pool');
	data.communal = communalBalance + balDec;
	
	data = addTrans(person + " pooled **" + (balDec).toString() + "** gp.", data, globalParams.keptTransactions);
	
	return [0, data, true];
}

async function capitalismCommand(data, globalParams, params, person, isAdmin, msg) {
	var balInc = parseInt(params.shift());
	
	if (isNaN(balInc) || balInc <= 0)
		return [1, 'Enter a valid positive number!'];
	
    if (isAdmin && params.length) { person = params.shift(); data = await checkTarget(person, data); }
    let personObj = data.person_data[person];
	var communalBalance = data.communal;
	
	if (communalBalance - balInc < 0)
		return [1, 'Can\'t take that much!'];
	
	personObj.gp = personObj.gp + balInc;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' balance is now at: **'+ (personObj.gp).toString() + 'gp**, there is **' + (communalBalance - balInc).toString() + 'gp** in the communal pool');
	data.communal = communalBalance - balInc;
	
	data = addTrans(person + " unpooled **" + (balInc).toString() + "** gp.", data, globalParams.keptTransactions);
	
    return [0, data, true];
}

async function balanceCommand(data, globalParams, params, person, isAdmin, msg) {
    var embed = new Discord.RichEmbed().setTitle("Current Balances:").setColor(globalParams.color);
	
    for (var i = 0; i < data.people.length; i++) {
       var personObj = data.person_data[data.people[i]];
       embed.addField(data.people[i], personObj.gp.toString(), true);
    }
	
    var communalBal = data.communal;
    embed.addField('***Communal Pool***', communalBal.toString(), true);
    msg.channel.send({embed});
	
	return [0, data, false];
}

async function transactionsCommand(data, globalParams, params, person, isAdmin, msg) {
    var embed = new Discord.RichEmbed().setTitle("Recent transactions:").setColor(globalParams.color);
    var text = "";
	
    for (var i = 0; i < data.transactions.length; i++) {
       text += "\n" + data.transactions[i];
    }
	
    embed.setDescription(text);
    msg.channel.send({embed});
	
	return [0, data, false];
}
  
async function levelupCommand(data, globalParams, params, person, isAdmin, msg) {
	var inc = 1;
	if (isAdmin) {
		if (params.length) { inc = parseInt(params.shift()); }
		if (isNaN(inc))
			return [1, 'Enter a valid number!'];
		if (params.length) { person = params.shift(); data = await checkTarget(person, data); }
	}

    let personObj = data.person_data[person];
	
	personObj.level = (personObj.level + inc < 1) ? 1 : personObj.level + inc;
	if (personObj.level <= globalParams.Levels[globalParams.levelling].values.length) { personObj.xp = (globalParams.Levels[globalParams.levelling].cumulative) ? globalParams.Levels[globalParams.levelling].values[personObj.level - 1] : 0; }
	
	var personName = (isAdmin) ? person + " is" : "You are";
    msg.reply('congratulations! ' + personName + ' now level **'+ (personObj.level).toString() + '**!');
	
	return [0, data, true];
}

async function addxpCommand(data, globalParams, params, person, isAdmin, msg) {
	var inc = parseInt(params.shift());
	if (isNaN(inc))
		return [1, 'Enter a valid number!'];
	
	if (isAdmin) {
		if (params.length) { person = params.shift(); data = await checkTarget(person, data); }
	}

    let personObj = data.person_data[person];
	
	var currLevel = personObj.level;
	var newLevel;
	if (globalParams.Levels[globalParams.levelling].cumulative) {
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

	var personName = (isAdmin) ? person + " now has" : "You now have";
    var reply = 'Congratulations! ' + personName + ' **'+ (personObj.xp).toString() + 'xp**';
	
	if (currLevel != personObj.level) {
		var personName = (isAdmin) ? "is" : "are";
		reply +=  ' and ' + personName + ' level **'+ (personObj.level).toString() + '**';
	}
	
	msg.reply(reply + '!');
	return [0, data, true];
}

async function resetxpCommand(data, globalParams, params, person, isAdmin, msg) {
	if (isAdmin) {
		if (params.length) { person = params.shift(); data = await checkTarget(person, data); }
	}

    let personObj = data.person_data[person];
	
	if (globalParams.Levels[globalParams.levelling].cumulative)
		personObj.xp = globalParams.Levels[globalParams.levelling].values[personObj.level - 1];
	else
		personObj.xp = 0;
    msg.reply('reset xp to ' + personObj.xp);
	return [0, data, true];
}

async function partyCommand(data, globalParams, params, person, isAdmin, msg) {
	var embed = new Discord.RichEmbed().setTitle("Current Levels:").setColor(globalParams.color);;
	
    for (var i = 0; i < data.people.length; i++) {
       let personObj = data.person_data[data.people[i]];
       embed.addField(data.people[i], '**' + personObj.level.toString() + '** ' + personObj.xp.toString(), true);
    }
    msg.channel.send({embed});
	return [0, data, false];
}

async function nextlevelCommand(data, globalParams, params, person, isAdmin, msg) {
	if (globalParams.Levels[globalParams.levelling].values.length <= 1) {
		return [1, 'No levelling system selected!'];
	}
	
	if (isAdmin) {
		if (params.length) { person = params.shift(); data = await checkTarget(person, data); }
	}
	
	let personObj = data.person_data[person];
	
	if (personObj.level >= globalParams.Levels[globalParams.levelling].values.length) {
		msg.reply('already at max level!');
		return [0, data, false];
	}
	
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
	
	return [0, data, false];
}

async function removePerson(data, globalParams, params, person, isAdmin, msg) {
	if (params.length) 
		var target = params.shift();
	else
		return [1, "Enter a user to remove!"];
	
	for (var i = 0; i < data.people.length; i++) {
		if (data.people[i] == target) {
			data.people.splice(i,1);
			delete data.person_data[target];
			msg.reply('person **' + target + '** removed successfully');
			return [0, data, true];
		}
	}
	
	return [1, "No user by name " + target];
}

async function pagesCommand(data, globalParams, params, person, isAdmin, msg) {
	let pages = data.pages;
	
	if (params.length)
		var page = params.shift();
	else
		return [1, 'Enter a page to modify!'];
	
	if (page == 'listall') {
		await listPages(page, data, globalParams, params, person, isAdmin, msg);
		return [0, data, false];
	}
	
	if (params.length)
		var sentAction = params.shift();
	else
		return [1, 'Enter a command to execute on the page!'];

        if (!pages.includes(page) && sentAction != 'create')
                return [1, 'Page ' + page + ' does not exist!'];
	for (var action in PAGE_ACTIONS) {
		if (PAGE_ACTIONS.hasOwnProperty(action)) {
			if (action == sentAction) {
				return PAGE_ACTIONS[action](page, data, globalParams, params, person, isAdmin, msg);
			}
		}
    }
	
	return [1, 'Page command ' + sentAction + ' does not exist'];
}


async function createPage(page, data, globalParams, params, person, isAdmin, msg) {
	if (!isAdmin) {
		return [1, 'Only admins can create pages'];
	}
	
	var startValue = parseInt(params.shift());
	if (isNaN(startValue))
		startValue = 0;
	
	for (var i = 0; i < data.pages.length; i++) {
		if (pages[i][0] == page)
			return [1, "Page already exists"];
	}
	
	data.page_data[page] = [startValue, 0, [false, false, false, false, false]];
	data.pages.push(page);

	for (var i = 0; i < data.people.length; i++) {
		let prson = data.people[i];
		let personObj = data.person_data[prson];
		personObj[page] = startValue;
	}
	
	msg.reply("page **" + page + "** created successfully!");
	return [0, data, true];
}

async function listPages(page, data, globalParams, params, person, isAdmin, msg) {
	var embed = new Discord.RichEmbed().setTitle("All pages:").setColor(globalParams.color);
    var text = "";
	
    for (var i = 0; i < data.pages.length; i++) {
       text += "\n" + data.pages[i];
    }
	
    embed.setDescription(text);
    msg.channel.send({embed});
	
	return [0, data, false];
}

async function removePage(page, data, globalParams, params, person, isAdmin, msg) {
	if (!isAdmin) {
		return [1, 'Only admins can delete pages!'];
	}

	delete data.page_data[page];
	
	for (var i = 0; i < data.people.length; i++) {
		let prson = data.people[i];
		var personObj = data.person_data[prson];
		delete personObj[page];
	}
	
	for (var i = 0; i < data.pages.length; i++) {
		if (data.pages[i] == target) {
			data.pages.splice(i,1);
			break;
		}
	}
	
	msg.reply("page **" + page + "** successfully removed");
	return [0, data, true];
}

async function togglePage(page, data, globalParams, params, person, isAdmin, msg) {
	if (!isAdmin) {
		return [1, 'Only admins can manage pages!'];
	}
	
	var pageObj = data.page_data[page];
	
	var property = params.shift();
	
	if (!(property in PAGE_ATTRIBUTES))
		return [1, "Attribute doesn't exist"];

	pageObj[2][PAGE_ATTRIBUTES[property]] = (pageObj[2][PAGE_ATTRIBUTES[property]]) ? false : true;
	
	msg.reply("set attribute **" + property + "** to **" + pageObj[2][PAGE_ATTRIBUTES[property]].toString() + "**");

	return [0, data, true];
}

async function addPageVariable(page, data, globalParams, params, person, isAdmin, msg) {
	if (data.page_data[page][2][0] && !isAdmin) {
		return [1, 'Only admins can modify this page!'];
	}
	
	var balInc = parseInt(params.shift());
	if (isNaN(balInc) || balInc <= 0)
		return [1, 'Enter a valid positive number!'];
	
    if (isAdmin && params.length) { person = params.shift(); data = await checkTarget(person, data); }
	
    var personObj = data.person_data[person];
	personObj[page] = personObj[page] + balInc;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**');
	
	return [0, data, true];
}

async function subPageVariable(page, data, globalParams, params, person, isAdmin, msg) {
	var pageObj = data.page_data[page];
	if (pageObj[2][0] && !isAdmin) {
		return [1, 'Only admins can modify this page!'];
	}
	
	var balDec = parseInt(params.shift());
	if (isNaN(balDec) || balDec <= 0)
		return [1, 'Enter a valid positive number!'];
	
    if (isAdmin && params.length) { person = params.shift(); data = await checkTarget(person, data); }
    var personObj = data.person_data[person];
	
	if (personObj[page] - balDec < 0 && !pageObj[2][4]) {
		return [1, page + ' value not high enough!'];
	}
	personObj[page] = personObj[page] - balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**');
	
	return [0, data, true];
}

async function setPageVariable(page, data, globalParams, params, person, isAdmin, msg) {
	var pageObj = data.page_data[page];
	if (pageObj[2][0] && !isAdmin) {
		return [1, 'Only admins can modify this page!'];
	}
	
	var balSet = parseInt(params.shift());
	if (isNaN(balSet))
		return [1, 'Enter a valid number!'];
	
	balSet = (balSet < 0 && !pageObj[2][4]) ? 0 : balSet;
	
    if (isAdmin && params.length) { person = params.shift(); data = await checkTarget(person, data); }
    var personObj = data.person_data[person];
	personObj[page] = balSet;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**');
	
	return [0, data, true];
}

async function listPageVariable(page, data, globalParams, params, person, isAdmin, msg) {
    var embed = new Discord.RichEmbed().setTitle("Current values of " + page + ":").setColor(globalParams.color);
	
	var total = 0;
    for (var i = 0; i < data.people.length; i++) {
       var personObj = data.person_data[data.people[i]];
	   total += personObj[page];
       embed.addField(data.people[i], personObj[page].toString(), true);
    }
	
	var pageObj = data.page_data[page];
	if (pageObj[2][1]) {
		var communal = pageObj[1];
		total += communal;
		embed.addField('***Communal Pool***', communal.toString(), true);
	}
	if (pageObj[2][2]) {
		embed.addField('***Party Total***', total.toString(), true);
	}
		
    msg.channel.send({embed});	
	return [0, data, false];
}

async function givePageVariable(page, data, globalParams, params, person, isAdmin, msg) {
	var pageObj = data.page_data[page];
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
	
	if (!data.people.includes(target))
		return [1, "No user by name " + target];
	
    if (isAdmin && params.length) { person = params.shift(); data = await checkTarget(person, data); }
	
    var personObj = data.person_data[person];
	var targetObj = data.person_data[target];
	
	if (personObj[page] - balDec < 0 && !pageObj[2][4]) {
		return [1, page + ' value not high enough!'];
	}
	
	personObj[page] = personObj[page] - balDec;
	targetObj[page] = targetObj[page] + balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**, ' + target + "'s is now: **"+ (targetObj[page]).toString() + '**');
	
	return [0, data, true];
}

async function poolPageVariable(page, data, globalParams, params, person, isAdmin, msg) {
	var pageObj = data.page_data[page];
	if (pageObj[2][0] && !isAdmin) {
		return [1, 'Only admins can modify this page!'];
	}
	if (!pageObj[2][1]) {
		return [1, 'Cannot pool this page value!'];
	}
	
	var balDec = parseInt(params.shift());
	if (isNaN(balDec) || balDec <= 0)
		return [1, 'Enter a valid positive number!'];

    if (isAdmin && params.length) { person = params.shift(); data = await checkTarget(person, data); }
	
    var personObj = data.person_data[person];
	
	if (personObj[page] - balDec < 0 && !pageObj[2][4]) {
		return [1, page + ' value not high enough!'];
	}
	
	personObj[page] = personObj[page] - balDec;
	pageObj[1] = pageObj[1] + balDec;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**, the communal pool\'s is now: **'+ (pageObj[1]).toString() + '**');
	
	return [0, data, true];
}

async function unpoolPageVariable(page, data, globalParams, params, person, isAdmin, msg) {
	var pageObj = data.page_data[page];
	if (pageObj[2][0] && !isAdmin) {
		return [1, 'Only admins can modify this page!'];
	}
	if (!pageObj[2][1]) {
		return [1, 'Cannot pool this page value!'];
	}
	
	var balInc = parseInt(params.shift());
	if (isNaN(balInc) || balInc <= 0)
		return [1, 'Enter a valid positive number!'];
	
    if (isAdmin && params.length) { person = params.shift(); data = await checkTarget(person, data); }
	
    var personObj = data.person_data[person];
	
	if (pageObj[1] - balInc < 0 && !pageObj[2][4]) {
		return [1, page + ' value not high enough!'];
	}
	
	personObj[page] = personObj[page] + balInc;
	pageObj[1] = pageObj[1] - balInc;
	
	var personName = (isAdmin) ? person + "'s" : "Your";
	
	msg.reply(personName + ' ' + page + ' value is now at: **'+ (personObj[page]).toString() + '**, the communal pool\'s is now: **'+ (pageObj[1]).toString() + '**');
	
	return [0, data, true];
}
