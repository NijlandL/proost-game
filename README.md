# Proost! 🍻

Een multiplayer drankspel app gebouwd met React Native en Firebase.

## Features
- Multiplayer lobbies (tot 8 spelers)
- Real-time synchronisatie
- Bussen kaartspel
- Web, iOS en Android support

## Development
```bash
npm install
npm run web
```

## Deployment
```bash
npm run build
```

## Tech Stack
- React Native
- Expo
- Firebase Realtime Database
- TypeScript

## Scripts
- npm start : Dev (native/web)
- npm run web : Web dev
- npm run build : Static export → dist (Netlify publishes dist)

## Deployment (Netlify)
Uses expo export (static web). Ensure Node 18 (already set in netlify.toml).

## Fixes Applied
- Removed missing plugin react-native-paper/babel
- Fixed invalid babel.config.js
- Cleaned metro.config.js
- Added package.json, tsconfig

## Local Build Test
npm install
npm run build
Serve dist/ (e.g. npx serve dist)

# Proost!

Expo + React Native + Firebase Realtime Database.

## Scripts
- npm start (dev)
- npm run web (web dev)
- npm run build (static export → dist voor Netlify)

## Deploy (Netlify)
Publish dir: dist  
Build command: npm install && npm run build

## Fixes
- Lege package.json gevuld
- babel.config.js gerepareerd
- .babelrc opgeschoond
- metro.config.js gededupliceerd
- netlify.toml build vereenvoudigd

## Test lokaal
npm install
npm run build
npx serve dist
