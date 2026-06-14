# mex-open-data-frontend-react

Front-end React + Vite que consume [`mex-open-data-backend-fastapi`](https://github.com/lehcimhdz/mex-open-data-backend-fastapi)
para mostrar todos los datos de [`open-data-mexico`](https://pypi.org/project/open-data-mexico/).

---

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Tablero con KPIs y barras por categoría |
| `/categories` | Grid completo de las 28 categorías |
| `/categories/:slug` | Lista de datasets + histograma de recursos |
| `/datasets/:slug` | Detalle: metadatos, etiquetas, recursos |
| `/datasets/:slug/eda` | EDA en cliente sobre el primer CSV: perfil por columna, histogramas, correlación |
| `/datasets/:slug/ml` | K-Means k=4 + PCA → scatter 2D + centroides |
| `/search` | Búsqueda full-text con filtros de categoría y formato |
| `/organizations` | Instituciones publicadoras (cuando el backend las expone) |
| `/about` | Cómo conectar el frontend |

## Stack

- Vite 7 + React 19 + TypeScript 5
- TanStack Query (cache de datos)
- React Router 7
- Recharts (barras, histogramas, scatter)
- Tailwind CSS 4
- Papa Parse, simple-statistics, ml-pca, ml-kmeans (EDA + ML cliente)

## Variables de entorno

| Variable | Default | Notas |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | URL del backend (o `/api` con proxy nginx/Vite) |
| `VITE_API_KEY` | _vacío_ | Sólo si el backend tiene `API_KEY_REQUIRED=true` |
| `VITE_API_PROXY_TARGET` | `http://localhost:18000` | Sólo para `npm run dev` |

En la imagen Docker, además puedes setear en tiempo de boot:

| Variable | Default |
|---|---|
| `BACKEND_URL` | `http://mexdata-backend:8000` |
| `PUBLIC_API_BASE_URL` | `/api` |
| `PUBLIC_API_KEY` | _vacío_ |

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:5173 (proxy /api → http://localhost:18000)
npm run build        # build de producción
npm run preview      # sirve dist/ en :4173
```

## Docker

```bash
docker build -t mex-open-data-frontend-react .
docker run -p 18080:80 \
  -e BACKEND_URL=http://host.docker.internal:18000 \
  mex-open-data-frontend-react
```

## Estructura

```
src/
├── api/              cliente fetch + tipos + hooks de TanStack Query
├── components/       Loader, ErrorBox, StatCard, PageHeader
├── lib/              format helpers + estadísticas + correlación
├── pages/            una por ruta
├── App.tsx           layout principal + router
├── main.tsx          bootstrap del árbol
└── index.css         Tailwind + tema MX
```
