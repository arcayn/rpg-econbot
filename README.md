# rpg-econbot
[![Dependencies: Up to date](https://david-dm.org/arcayn/rpg-econbot.svg)](https://david-dm.org/arcayn/rpg-econbot) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)


Small Discord app written in node I built for use in tabletop RPG campaigns. Very basic and janky at the moment but is in early stages
of development.

Designed to work well with (and make up for features not found in) Avrae and other similar bots. To deploy on your own server: 
 - install it
 - get a Discord application token 
 - fill in `opt.js` (remember to remove `.example`)
 - invite it to your server
 - ???
 - profit
 
 ## Commands
  - `!levelup` does what is says on the tin
  - `!addxp <amount>` ... gives you xp
  - `!resetxp` resets your xp to 0
  - `!earn <amount> <reason>` adds `amount` of gp to your personal balance (for a good `reason`)
  - `!spend <amount> <reason>` opposite of `!earn`
  - `!communism <amount>` adds money from your personal balance to the communal pool
  - `!capitalism <amount>` takes money from the communal pool, putting it in your personal balance
  - `!balance` displays the balances of party members + the communal pool
  - `!party` displays the currents **levels** and xp values of party members
  - `!transactions` views recent spendings/earnings with reasons
  
## Admin mode commands
Some commands work differently in admin mode (+ 1 extra command for free). For commands not listed here, simply append a username param to any 
command and parameters to execute that command as that person.
  - `!levelup <amount> <target>` specifies number of levels to level up by
  - `!spend <amount> <target> <reason>` slightly inverted syntax
  - `!earn <amount> <target> <reason>` same as above
  - `!addtarget <username>` people are added to the party database the first time they interact with the bot. If you want to use admin mode on
    someone who hasn't yet interacted with the bot, you must add them to the database first like this.
