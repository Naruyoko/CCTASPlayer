# Cookie Clicker TAS Player
Made for v. 2.022
## Set up
1. Go to official version (or clone/archive) of Cookie Clicker.
2. Open the Java**S**cript console at the game. If bolding the capital "S" was not clear enough, it's the real one, not the in-game building.
3. Copy the contents of `index.js`, and paste and run it.
4. Follow the instructions.
## Spreadsheet Syntax
Spreadsheets must have a header row as the first row. In each subsequent rows, put the play. The rows must be in chronological order.

These columns **must** be present:
* `time (ms)` - a number. Time this row finishes execution

These columns **may** be present:
* `clicks more` - a number. Number of clicks
* `lag?` - y/n. Whether or not to have pseudo-lag this row.
* `u` - text. Upgrades to buy. Multiple lines to buy multiple upgrades.
* `GC buff` - text. Name of the golden cookie buff.
* `cookies baked` - a number. Expected cookies baked stat. For debug utility.
* `adelayl` - a number. Expected accumulatedDelay. For debug utility.
* Buildings (will attempt to buy/sell to the amount given as a number):
  * `c` - Cursor
  * `g` - Grandma
  * `f` - Farm
  * `m` - Mine
  * `F` - Factory
  * `b` - Bank
  * `t` - Temple
  * `wt` - Wizard tower
  * `s` - Shipment
  * `al` - Alchemy lab
  * `p` - Portal
  * `tm` - Time machine
  * `ac` - Antimatter condenser
  * `P` - Prism
  * `C` - Chancemaker
  * `fe` - Fractal engine
  * `jc` - Javascript console

Any column headers not specified here are ignored.