# Repentance Run Tracker project
Repentance Run Tracker is an [Electron](https://www.electronjs.org/) app to record your runs in [The Binding Of Isaac: Repentance](https://store.steampowered.com/app/1426300/The_Binding_of_Isaac_Repentance/) (not supporting older version of the game). This project was inspired by [RebirthItemTracker](https://github.com/Rchardon/RebirthItemTracker) project wich reads and parse the ``log.txt`` to track what is happening during the game, and also The [Finding of Items](https://moddingofisaac.com/mod/900/the-finding-of-items).

The project is still in early state but it's more and more stable, you can ask for features or open a bug ticket on this github from the issue tab

# Usage

## Settings

![Settings](/doc/img/settings.jpg)
### Language
Change app language to :
- English
- Français
- Deutsch
- Español
- Русский
- 日本語
- 한국어
- 中文

Except french and english, other languages are partial translations (datas from the original game only), if you want to contribute or help, you can contact me or directly fork and edit jsons translations here : src\renderer\i18n

Available languages are currently officialy supported languages from the game (except french), but if you want to add your own language let me know
### Date format
Change the date format to :
- Day / Month / Year
- Month / Day / Year
### Hour format
Change the hour format to :
- 24 hours
- 12 hours
### Hide active items
It hides active items from floors.
### Isaac mods folder
This is important for extra runs informations, like all the character infos (life, bombs, keys, coins, stats) not available in logs. It adds a mod in your game then write extra lines in logs.
The mod folder is in the game folder (since repentance update), from steam right click on the game then click on "Manage" then "Browse local files", open "mods" folder and copy the full path.
Exemple : ``C:\Program Files (x86)\Steam\steamapps\common\The Binding of Isaac Rebirth\mods``
## Winstreaks

![Winstreaks](/doc/img/winstreaks.jpg)

You can build custom winstreaks rules for each saves (1, 2 and 3) and it analyzes your recorded runs to validate each streak, if you add multi characters (exemple : Isaac THEN Cain THEN Judas) and/or multi bosses you must respect the order to validate the rule. The rule will show you wich character you have to play and wich boss you have to beat in case of multi characters/bosses.

## Customize runs

![Edit runs](/doc/img/edit-run.jpg)
### Title
You can add title to your run, it will be used for search and (later) visible on the cards.
### Run Duration
The app can not get the ingame time (i didn't find a way yet) so at the moment it checks the start run date and end run date to guess the run duration, you can still edit it manually.
### Video link
You can add any video link here.
### Video Higlights
If something exciting happens during your run you can add a timecode, if the video link is from YouTube or Twitch it automatically opens the link with the right timecode on click.
### Tags
You can add tags used for filtering (tags filter available later).
## Screenshots

## Filters

### Search box
In the search box you can type :
- Character name
- Custom run name
- Seed
- Id

Or a custom query :
- Search an item : `:item:[item id]:[floor number, default = 1]`
exemple, search runs with Pentagram found at second floor : `:item:51:2`

![Screen1](/doc/img/screen1.jpg)

![Screen2](/doc/img/screen2.jpg)

![Screen2](/doc/img/screen3.jpg)

# Contribute
## Project setup
Environment : Windows 10 x64\
Backend : [NodeJS](https://nodejs.org/en/download/) v16.14.2, [Electron](https://www.electronjs.org/) v19.0.4\
Frontend : [VueJS](https://vuejs.org/) v2.6.11, [Vue Router](https://router.vuejs.org/), [Vuex ORM Next](https://next.vuex-orm.org/)
```
npm install -g node-gyp
npm install
```

### Run app for development
```
npm run electron:serve
```
