# Scriba economy bot
[![Dependencies: Up to date](https://david-dm.org/arcayn/rpg-econbot.svg)](https://david-dm.org/arcayn/rpg-econbot) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)


Discord app written in node I built for use in tabletop RPG campaigns. A little unreliable at the moment but is in early stages
of development. The main progress will be in catching errors so it doesn't fail silently/corrupt data files.

Designed to work well with (and make up for features not found in) Avrae and other similar bots. To deploy on your own server: 
 - install it
 - make a Discord application and get its token 
 - fill in `opt.js` (remember to remove `.example`)
 - run the node app on your server
 - invite the bot to your Discord chat
 - ???
 - profit
 
 ## Features
  - Track XP for your party
  - Track your party's money
  - Auto levelling with custom tables
  - Track any numerical attributes of your party
 
 ## Commands
 Invoke the bot with `!scriba`
  - `levelup` does what is says on the tin
  - `addxp <amount>` ... gives you xp
  - `nextlevel`replies with xp until next level
  - `resetxp` resets your xp to 0
  - `earn <amount> <reason>` adds `amount` of gp to your personal balance (for a good `reason`)
  - `spend <amount> <reason>` opposite of `earn`
  - `pool <amount>` adds money from your personal balance to the communal pool
  - `take <amount>` takes money from the communal pool, putting it in your personal balance
  - `balance` displays the balances of party members + the communal pool
  - `party` displays the currents **levels** and xp values of party members
  - `transactions` views recent spendings/earnings with reasons
  - `p <command>` pages commands

## Pages Commands
Scriba's pages allow you to keep track of any numerical values of your party. General syntax is:
 - `!scriba p <pageName> <command>` where command is the command + arguments and pageName is the page to operate on

The commands which follow this syntax are:
 - `create` creates a new page
 - `remove` removes selected page
 - `toggle <property>` toggles the value of a property for selected page. Available properties are:
     * `protected` only editable by admins
     * `poolable` allows for a communal pool of the resource
     * `totalled` totals the resource when listed
     * `transferrable` allows the resource to be transferred with `give`
     * `negativeable` allows the value to go below 0
 - `add <amount>` adds an amount to your page balance
 - `sub <amount>` subtracts an amount from your page balance
 - `set <amount>` sets your page balance to an amount
 - `give <amount> <party member>` gives an amount from your page balance to another party member
 - `pool <amount>` adds an amount from your page balance to the communal pool
 - `unpool <amount>` increases your page balance from the communal pool
 - `list` lists the page balances of your party members

The one command that does not follow this syntax:
 - `!scriba p listall` lists all pages

## Admin mode
Adding a user to admins allows them to execute commands as other people and level up multiple levels at a time. You also must specify channel names where admin mode can be used in your settings file to prevent admin mode syntax from messing with normal usage.

Some commands have specific admin mode syntax. For commands not listed here, simply append a username param to any command and parameters to execute that command as that person (eg. `!scriba earn 500 joe`).
  - `levelup <amount> <target>` specifies number of levels to level up by
  - `spend <amount> <target> <reason>` slightly inverted syntax
  - `earn <amount> <target> <reason>` same as above
