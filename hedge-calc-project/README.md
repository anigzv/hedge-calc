# ⚖ Hedge Calc — Calculadora de Cobertura para Challenges

Calculadora para cubrir el riesgo de challenges de fondeo (Funding Pips) usando una cuenta real (Exness).

## 🚀 Cómo publicar en la web (GRATIS)

### Opción 1: Vercel (Recomendada — más fácil)

1. **Sube el proyecto a GitHub:**
   - Ve a [github.com/new](https://github.com/new) y crea un repositorio nuevo llamado `hedge-calc`
   - Sube todos los archivos de esta carpeta al repositorio

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com) y regístrate con tu cuenta de GitHub
   - Click en "Add New Project"
   - Selecciona el repositorio `hedge-calc`
   - Vercel detecta Vite automáticamente — solo da click en "Deploy"
   - En 30 segundos tendrás tu URL: `https://hedge-calc.vercel.app`

### Opción 2: Netlify

1. Sube a GitHub igual que arriba
2. Ve a [netlify.com](https://netlify.com) y regístrate con GitHub
3. "New site from Git" → selecciona el repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy

### Opción 3: GitHub Pages (sin servidor)

1. Sube a GitHub
2. Instala dependencias: `npm install`
3. Construye: `npm run build`
4. Sube la carpeta `dist/` a GitHub Pages

## 💻 Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:5173 en tu navegador.

## 📱 Funciona en móvil

La calculadora está optimizada para usarse desde el celular.
Puedes añadirla a tu pantalla de inicio como una app.
