# Repentance Run Tracker
Repentance Run Tracker is an [Electron](https://www.electronjs.org/) app to track your runs in [The Binding Of Isaac: Repentance](https://store.steampowered.com/app/1426300/The_Binding_of_Isaac_Repentance/) (not supporting older version of the game). This project was inspired by [RebirthItemTracker](https://github.com/Rchardon/RebirthItemTracker) project wich reads and parse the ``log.txt`` to track what is happening during the game.

This can be usefull if you are a streaker or if you want to see your progress

The project is in his very early state but here is the functionality ToDo list :
- [x] Show and save all runs
- [x] Show current run with live updates
- [X] Automatically remove last generated run if reset button is pressed
- [ ] Edit runs from the ui (custom name, add a video link...)
- [ ] Add items informations
- [ ] Add compact current run item tracker view component
- [ ] Add search engine to filter by character, seed, custom name, date...\
More to add...

# Contribute
## Project setup
Environment : Windows 10 x64\
Backend : [NodeJS](https://nodejs.org/en/download/) v15, [Electron](https://www.electronjs.org/) v11.4.2\
Frontend : [VueJS](https://vuejs.org/) v2.6.11, [Vue Router](https://router.vuejs.org/), [Vuex ORM Next](https://next.vuex-orm.org/)
```
npm install
```

### Run app for development
```
npm run electron:serve
```

# Not working
Since logs doesn't gives all the ingame informations, some issues can happen :
- It is not possible to make a difference between 2 seeded runs with the same seed on the same save slot if the first run isn't over