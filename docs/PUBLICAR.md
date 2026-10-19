# Publicar SurvivorMon en Vercel

El juego es una web estática que Vercel publica gratis desde GitHub
(`LegonBCA/SurvivorMon_ls`, rama `main`).

## Cada versión
1. Edita `dev.html` y los scripts (nunca `index.html`).
2. Compila y prueba en local:
   ```
   node tools/build.js --expose
   python -m http.server 8000      # y abre http://localhost:8000
   ```
3. Sube los cambios a `main`. Vercel ejecuta `npm run build` y publica la raíz
   del proyecto (`vercel.json`: `"outputDirectory": "."`).

Los jugadores reciben la versión nueva solos (`js/core/updater.js` mira
`version.json`).

## Si el despliegue falla
- *No Output Directory named "public"*: comprueba que `vercel.json` tiene
  `"outputDirectory": "."` y que en Vercel > Settings > Build and Deployment el
  Output Directory no tenga otro valor puesto a mano.
