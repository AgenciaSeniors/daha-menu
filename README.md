# DAHA Restaurante — Menú Digital

Menú digital con panel de administración para **DAHA Restaurante**.

Inspirado visualmente en el logo del local: **azul navy + naranja coral + aqua menta**.

## Características

- Carta visual con categorías y productos destacados
- Panel gerencial con CRUD completo de productos (autenticado)
- Sistema de reseñas y valoración por producto
- Buscador en tiempo real
- 100% responsivo (móvil + desktop)
- Light theme cálido inspirado en el logo

## Stack

- HTML5 + CSS3 puro
- JavaScript vanilla
- Supabase (Auth + PostgreSQL + Storage)
- Tipografías: Archivo Black, Caveat Brush, Poppins

## Configuración

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Crea las tablas: `productos`, `opiniones` (con `restaurant_id` UUID).
3. Crea un bucket público `imagenes` en Storage.
4. Edita `config.js` con tus credenciales:
   ```js
   SUPABASE_URL: 'https://tu-proyecto.supabase.co',
   SUPABASE_KEY: 'tu_publishable_key',
   RESTAURANT_ID: 'uuid-de-tu-restaurante'
   ```
5. Crea un usuario administrador en Supabase Auth.
6. Sirve los archivos estáticos (GitHub Pages, Netlify, Vercel, etc).

## Estructura

```
daha-menu/
├── index.html       # Carta pública
├── admin.html       # Panel gerencial
├── login.html       # Login admin
├── style.css        # Diseño DAHA
├── modal.css        # Estilos modales
├── script.js        # Lógica menú público
├── admin.js         # Lógica CRUD admin
├── config.js        # Credenciales Supabase
└── img/             # Imágenes locales (logo, fondos)
```

## Personalización

La paleta vive como **variables CSS** en `style.css` (`:root`). Para retocar colores, solo edita los valores `--navy`, `--coral`, `--mint`, etc.

## Autor

Eduardo Daniel Pérez Ruiz — [Agencia Señores](https://agenciaseniors.com)
