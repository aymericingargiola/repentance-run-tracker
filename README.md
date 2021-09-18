# Repentance Run Tracker project
Repentance Run Tracker is an [Electron](https://www.electronjs.org/) app to track your runs in [The Binding Of Isaac: Repentance](https://store.steampowered.com/app/1426300/The_Binding_of_Isaac_Repentance/) (not supporting older version of the game). This project was inspired by [RebirthItemTracker](https://github.com/Rchardon/RebirthItemTracker) project wich reads and parse the ``log.txt`` to track what is happening during the game.

This can be usefull if you are a streaker or if you want to see your progress

The project is in his very early state but here is the functionality ToDo list :
- [x] Show and save all runs
- [x] Show current run with live updates
- [X] Automatically remove last generated run if reset button is pressed
- [x] Edit runs from the ui (custom name, add a video link...)
- [x] Add winstreak builder
- [ ] Add compact current run item tracker view component
- [ ] Add search engine to filter by character, seed, custom name, date...\
More to add...

# Usage

## Settings
### Date format
Change the date format for :
- Day / Month / Year
- Month / Day / Year
### Hour format
Change the hour format for :
- 24 hours
- 12 hours
### Hide active items
It will hide active items from floors in run cards to have more room.
### Isaac mods folder
This is important to have extra runs informations like all the character infos (life, bombs, keys, coins, stats) that are not in the logs. The app will add a mod (Repentance Run Tracker) and it will add extra lines to the logs.
The mod folder is in the game folder, from steam right click on the game then click on "Manage" then "Browse local files", open the "mods" folder and copy the full path.
For exemple : ``C:\Program Files (x86)\Steam\steamapps\common\The Binding of Isaac Rebirth\mods``

![Settings](/doc/img/settings.jpg)
## Winstreaks
You can build custom winstreaks rules for each saves (1, 2 or 3) and it will analyze your runs to validate each streak, if you add multi characters (exemple : Isaac THEN Cain THEN Judas) and/or multi bosses you must respect the order to validate the rule. The rule will show you wich character you have to play and wich boss you have to beat.

![Winstreaks](/doc/img/winstreaks.jpg)

## Customize runs

![Edit runs](/doc/img/edit-run.jpg)
### Title
You can add title to your run, it will be used for search and it will show on the card (for the moment it will not show yet).
### Run Duration
The app can not get the ingame time (i didn't find a way yet) so at the moment it will check the start run date and end run date to guess the run duration, you can still edit it.
### Video link
You can add any video link.
### Video Higlights
If something exciting happens during your run you can add a timecode, if the video link is from YouTube or Twitch it will automatically open the link with the timecode when you click on it.
### Tags
You can add tags, it will be used for filtering. If a tag already exist on an other run and you start writing the same tag name it will show a dropdown with existing tags.
## Screenshots

![Screen2](/doc/img/screen2.jpg)

![Settings](/doc/img/screen1.jpg)

# Contribute
## Project setup
Environment : Windows 10 x64\
Backend : [NodeJS](https://nodejs.org/en/download/) v12.18.3, [Electron](https://www.electronjs.org/) v11.4.2\
Frontend : [VueJS](https://vuejs.org/) v2.6.11, [Vue Router](https://router.vuejs.org/), [Vuex ORM Next](https://next.vuex-orm.org/)
```
npm install -g node-gyp
npm install
```

### Run app for development
```
npm run electron:serve
```

# Not working
Since logs doesn't gives all the ingame informations, some issues can happen :
- It is not possible to make a difference between 2 seeded runs with the same seed on the same save slot if the first run isn't over
- Didn't find a wy to have the ingame run duration
- Black hearts appears as blue hearts in the app