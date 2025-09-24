# Proost Game - Netlify Deployment

Dit React Native Expo project is geconfigureerd voor deployment op Netlify.

## 🚀 Deployment Instructies

### Automatische Deployment (Aanbevolen)

1. **Push je code naar GitHub**
   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push origin main
   ```

2. **Netlify Site Setup**
   - Ga naar [netlify.com](https://netlify.com) en log in
   - Klik op "New site from Git"
   - Verbind je GitHub repository
   - Netlify detecteert automatisch de instellingen uit `netlify.toml`

### Handmatige Deployment

Als alternatief kun je handmatig deployen:

1. **Build het project lokaal**
   ```bash
   npm run build
   ```

2. **Upload de dist folder**
   - Ga naar Netlify dashboard
   - Sleep de `dist` folder naar de deployment area

## 📁 Belangrijke Bestanden

- `netlify.toml` - Netlify configuratie
- `app.json` - Expo configuratie voor web builds
- `package.json` - Bevat build scripts

## 🛠️ Lokaal Testen

```bash
# Development server starten
npm start

# Web versie in browser
npm run web

# Production build maken
npm run build
```

## 🔧 Configuratie Details

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18
- **Redirects**: SPA redirect voor React Router

## 📱 Platform Support

Deze app draait op:
- ✅ Web (via Netlify)
- ✅ iOS (via Expo Go)
- ✅ Android (via Expo Go)

## 🔗 Netlify Features

- Automatische builds bij Git push
- Preview deploys voor pull requests
- Custom domain support
- SSL certificates
- CDN optimization

## 🚨 Troubleshooting

Als je problemen hebt:

1. Check of alle dependencies geïnstalleerd zijn:
   ```bash
   npm install
   ```

2. Clear Expo cache:
   ```bash
   npx expo start --clear
   ```

3. Rebuild:
   ```bash
   rm -rf dist
   npm run build
   ```