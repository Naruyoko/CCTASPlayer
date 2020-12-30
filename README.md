# Cookie Clicker TAS Player
Made for v. 2.022

## Set up
1. Go to official version (or clone/archive) of Cookie Clicker.
2. Open the Java**S**cript console at the game. If bolding the capital "S" was not clear enough, it's the real one on browser, not the in-game building.
3. Copy the contents of `index.js`, and paste and run it.
4. Follow the instructions.

## Spreadsheet Syntax
Spreadsheets must have a header row as the first row. In each subsequent rows, put the play.

The rows must be in chronological order.

If the first row has `time (ms)` set to -1, then it will set various settings.

Rows must be separated by a `\n` or `\r\n`.

### Columns of General Row

Columns must be separated by a tab character (`\t`).

These columns **must** be present:
* `time (ms)` - a number. Time this row finishes execution

These columns **may** be present:
* `clicks more` - a number. Number of clicks
* `lag?` - y/n. Whether or not to have pseudo-lag this row.
* `u` - text. Upgrades to buy. Multiple lines to buy multiple upgrades.
* `GC buff` - text. Name of the golden cookie buff.
* `cookies baked` - a number. Expected cookies baked stat. For debug utility.
* `adelayl` - a number. Expected accumulatedDelay. For debug utility.
* Buildings (will attempt to buy/sell to the amount given as a number, or will not buy/sell if set to X):
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
* `utilcodebefore`, `utilcodeafter` - Executes a specified code as JavaScript. This should be build on provided utilities as much as possible. `utilcodebefore` will be executed just before running `Game.Loop`, while `utilcodeafter` will be executed just after. You can find the list of utility functions and which column to use below.

Any column headers not specified here are ignored.

### Setter Row

Signify that the first row is setter row by setting `time (ms)` to -1.

Place settings in `utilcodebefore` column. Each item must be in form `key:value`, separated by a comma.

Settings:
* `seed` - Sets `Game.seed`. Defaults to `""` (not set; set randomly on each run).
* `season` - Starting season. Defaults to `""` (no season).
* `startTime` - Sets internal start time. Defaults to the time `TAS.setup` was called.

## Utility functions

### Before

These should be put in `utilcodebefore` column.

* `TAS.util.ShowMenu(s)` - `s` is a string. If `s=="close"`, then it will close any menu open. Else it will open any menu, such as `"stats"`.
* `TAS.util.ChangeBakeryName(s)` - Changes the bakery name to `s`.
* `TAS.util.ClickNews()` - Clicks news.
* `TAS.util.MakeNextNewsFortuneWhenPossible(fortune)` - Request a fortune (green news ticker) specified when possible. `fortune` may be `"fortuneGC"`, `"fortuneCPS"`, or id within fortune upgrade list, upgrade id, name, or object representing a fortune upgrade.
* `TAS.util.Buy(building,amount)` - Buys specified building by specified amount.
* `TAS.util.Sell(building,amount)` - Sells specified building by specified amount.
* `TAS.util.SpawnWrinkler(id)` - Requests a wrinkler to be spawned at `id`. The wrinkler will always be shiny.
* `TAS.util.SelectWrinkler(id)` - Requests to select the wrinkler at `id`.
* `TAS.util.HurtWrinkler()` - Requests to hurt the wrinkler selected until `TAS.util.LeaveWrinkler()` is called.
* `TAS.util.LeaveWrinkler()` - Requests to not hurt the wrinkler.
* `TAS.util.Ascend()` - Ascends.
* `TAS.util.PurchaceHeavenlyUpgrade(a)` - If `a` specifies a heavenly upgrade by id, name, or object, it will attempt to buy it. If `a` is an array that specifies heavenly upgrades by ids, names, or objects, it will attempt to buy them.
* `TAS.util.PickAscensionMode(mode)` - Changes ascension mode to the specified `mode`. `mode` must be either 0 or 1.
* `TAS.util.Reincarnate()` - Reincarnates (exits heavenly upgrade tree).
* `TAS.util.ToggleSantaTab(on)` - Toggles on or off the Santa menu.
* `TAS.util.UpgradeSanta(drop)` - Upgrades Santa with specified gift `drop`.
* `TAS.util.ToggleDragonTab(on)` - Toggles on or off the dragon menu.
* `TAS.util.UpgradeDragon()` - Upgrades dragon.
* `TAS.util.clickLump()` - Clicks sugar lump.
* `TAS.util.ToggleMute(building)` - Mute/unmutes a building.
* `TAS.util.ToggleMinigameMenu(building)` - Toggles minigame menu if available.
* `TAS.util.LevelUp(building)` - Levels up a building using sugar lump.
* `TAS.util.RefillGarden()` - Refills garden cool down.
* `TAS.util.Garden.ToggleMenu()` - Toggles garden minigame menu.
* `TAS.util.Garden.Refill()` - Refills garden cool down.
* `TAS.util.Garden.HarvestAll()` - Harvests all plants.
* `TAS.util.Garden.HarvestAllMature()` - Harvests all mature plants.
* `TAS.util.Garden.ToggleFreeze()` - Freezes/unfreezes the garden.
* `TAS.util.Garden.Convert()` - Converts plant seeds to sugar lumps if all plants seeds are unlocked.
* `TAS.util.Garden.SelectSeed(plant)` - Selects the specified plant.
* `TAS.util.Garden.UnselectSeed()` - Unselects plants.
* `TAS.util.Garden.PlantAtTile(plant,x,y)` - Plants a specified plant at specified garden plot.
* `TAS.util.Garden.HarvestTile(x,y)` - Harvests the plant at specified garden plot.
* `TAS.util.Garden.ChangeSoil(soil)` - Changes soil.
* `TAS.util.RefillPantheon()` - Refills pantheon swaps.
* `TAS.util.Pantheon.ToggleMenu()` - Toggles pantheon minigame menu.
* `TAS.util.Pantheon.Refill()` - Refills pantheon swaps.
* `TAS.util.Pantheon.SlotGod(god,slot)` - Places specified god to specified slot.
* `TAS.util.RefillGrimoire()` - Refills grimoire magic.
* `TAS.util.Grimoire.ToggleMenu()` - Toggles pantheon minigame menu.
* `TAS.util.Grimoire.CastSpell(spell)` - Casts specified spell.

### After

These should be put in `utilcodeafter` column.

* `TAS.util.SpawnGoldenCookie(force)` - Spawns a golden cookie of specified effect.
* `TAS.util.SpawnReindeer(cookie)` - Spawns a reindeer of specified cookie drop.
* `TAS.util.PopShimmers` - Pops shimmers (golden cookies and reindeers). This will be automatically be ran without specifying.

### Non-strategy functions

These should not be used in a strategy.

* `TAS.util.searchSeed(criterias)` - Searches for a seed meeting all criterias.

## Things note when making a TAS

* Game will only register big cookie clicks every 4ms.
* Game will only handle maximum lag of 5000ms.
* `Game.Loop` will be ran every 33ms with absolutely no lag.
* Some achievements and upgrades may not appear instantly after meeting the condition.
* It takes a frame between Santa appearing and being able to open and upgrade them after buying the upgrade that unlock them.
* It takes a frame to open Dragon menu before upgrading them.
* It takes a frame between button appears to open minigames after leveling up the building.
* After clicking ascend, it takes at least a frame to move to upgrade tree.
* Following are based on `Game.seed` and can not be arbitrarily manipulated:
  * Lump type uses `Game.seed+'/'+Game.lumpT`, dependent on seed and time.
  * FortuneCPS fortune's lucky number displayed uses `Game.seed+'-fortune'`, dependent on seed.
  * Deviations in positions of buildings except cursors and grandmas shown in the center uses `Game.seed+' '+[Building type's id]+' '+[Ordinal of currently calculated building]`, dependent on seed.
  * Deviations in positions, age, and name of grandmas shown in the center uses `Game.seed+' '+[Grandma's id]`, dependent on seed.
  * Whether or not "Reinforced membrane" takes effect is based on `Game.seed+'/'+Game.cookieClicks` for big cookie clicks and `Game.seed+'/'+Game.goldenClicks` for golden clicks.
  * Whether or not "Mice clicking mice" upgrade will show `blasphemouse` or `blasphemous` in the description uses `Game.seed+'-blasphemouse'`, dependent on seed.
  * Description of "Tombola computing" uses `Game.seed+'-tombolacomputing'`, dependent on seed.
  * Outcomes of spells are based on `Game.seed+'/'+[Total number of spells casted]`, dependent on seed.