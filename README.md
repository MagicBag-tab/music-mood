# Music Mood Tracker — Frontend

Cliente web para el **Music Mood API**. Construido con HTML, CSS y JavaScript vanilla puro — sin frameworks ni librerías externas. Toda la comunicación con el servidor usa `fetch()` nativo.

🔗 **Backend repo:** https://github.com/TU_USUARIO/music-mood-api

🌐 **Live demo:** 

---

## ¿Qué hace la app?

Un tracker de canciones categorizado por **estado de ánimo** (mood). Podés:

- Ver tu biblioteca de canciones en una grilla estilo Spotify
- Buscar canciones por nombre o artista en tiempo real
- Filtrar por mood, ordenar por título / fecha / mood
- Crear, editar y eliminar canciones
- Subir una imagen de portada por canción (max 1MB)
- Ver el detalle de cada canción con ratings con estrellas
- Ver reportes: distribución de moods y top canciones por rating
- Exportar toda tu biblioteca a CSV con un clic

---

## Cómo correr el proyecto localmente

El cliente es HTML/CSS/JS estático — no necesita servidor de Node ni nada similar. Solo abrís los archivos con un servidor HTTP local.

**Opción 1 — VS Code Live Server:**
1. Instalá la extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Clic derecho en `index.html` → "Open with Live Server"

**Opción 2 — Python:**
```bash
python3 -m http.server 3000
# Abrir http://localhost:3000
```

**Opción 3 — npx:**
```bash
npx serve .
```

> **Importante:** El backend debe estar corriendo en `http://localhost:8009` antes de abrir el cliente. Ver instrucciones en el repo del backend.

---

## Estructura de archivos

```
music-mood-frontend/
├── index.html          # Grilla principal de canciones
├── song.html           # Detalle de canción + ratings
├── create.html         # Formulario crear/editar canción
├── reports.html        # Reportes: mood distribution + top rated
├── css/
│   └── styles.css      # Todos los estilos (CSS variables, dark theme)
├── js/
│   ├── api.js          # Capa de fetch() — todas las llamadas al backend
│   ├── songs.js        # Lógica de index.html
│   ├── song.js         # Lógica de song.html
│   ├── create.js       # Lógica de create.html
│   └── reports.js      # Lógica de reports.html + export CSV
└── assets/
    └── placeholder.jpg # Imagen de fallback
```

---

## Challenges implementados

| Challenge | Puntos |
|-----------|--------|
| Calidad visual (dark theme estilo Spotify, skeleton loaders, animaciones) | ✅ |
| Historial de Git con commits descriptivos | ✅ |
| Organización del código (archivos separados por responsabilidad) | ✅ |
| Paginación en GET /songs con `?page=` y `?limit=` | ✅ |
| Búsqueda por nombre con `?q=` | ✅ |
| Ordenamiento con `?sort=` y `?order=asc\|desc` | ✅ |
| Sistema de rating (UI de estrellas, POST/GET /songs/:id/rating) | ✅ |
| Upload de imágenes de portada (drag & drop + clic) | ✅ |
| Export CSV generado manualmente desde JS sin librerías | ✅ |

---

## Sobre CORS

**¿Qué es CORS?** Cross-Origin Resource Sharing es una política de seguridad del navegador que bloquea peticiones `fetch()` a un origen distinto (diferente host o puerto) a menos que el servidor lo permita explícitamente.

El backend configura los siguientes headers en todas las respuestas:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Reflexión

**¿Usaría esta tech de nuevo?**

Si, más que todo para seguir aprendiendo, sin embargo, si buscaría otras tecnologías que tengan más opciones y librerías como lo es React o Vue (que ya es un framework), para tener mayor comodidad.