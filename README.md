# FrontAutomatizacionWhatsapp

Panel de administración web para el sistema de recolección automática de precios de medicamentos vía WhatsApp.

## Tecnologías

- **React 18** + **Vite 6**
- **React Router v7** – enrutamiento SPA
- **TanStack Query v5** – caché y sincronización de datos con el backend
- **Axios** – cliente HTTP
- **Tailwind CSS 3** – estilos utilitarios
- **Lucide React** – iconografía
- **React Hot Toast** – notificaciones

## Estructura del proyecto

```
src/
├── api/
│   └── client.js          # Funciones Axios para cada endpoint del backend
├── components/
│   ├── Layout.jsx          # Wrapper con barra lateral de navegación
│   ├── Modal.jsx           # Modal reutilizable
│   └── StatCard.jsx        # Tarjeta de estadística del dashboard
└── pages/
    ├── Dashboard.jsx       # Vista principal con métricas y lista de proveedores
    ├── Providers.jsx       # CRUD de proveedores (distribuidoras farmacéuticas)
    └── Prices.jsx          # Consulta de precios con filtros y descarga de Excel
```

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:8000`

## Instalación

```bash
npm install
```

## Correr el frontend

```bash
npm run dev
```

La app queda disponible en: http://localhost:5173

```bash
# Compilar para producción
npm run build

# Vista previa del build de producción
npm run preview
```

## Páginas

### Dashboard (`/dashboard`)
Muestra cuatro métricas principales:
- **Proveedores activos** – cantidad de distribuidoras con estado activo
- **Medicamentos** – total de medicamentos únicos registrados
- **Registros de precios** – total de entradas acumuladas en la base de datos
- **Excel generado** – estado del archivo de exportación y número de proveedores incluidos

También lista todos los proveedores registrados con su estado (activo/inactivo).

### Proveedores (`/providers`)
Gestión completa de las distribuidoras farmacéuticas:
- Ver tabla con nombre, número de WhatsApp y estado
- **Agregar** proveedor con nombre y número en formato internacional (Ej: `573001234567`)
- **Editar** nombre y número de un proveedor existente
- **Activar / desactivar** sin eliminar el historial
- **Eliminar** proveedor

> El número de WhatsApp debe coincidir exactamente con el número desde el que la distribuidora envía mensajes, para que el sistema lo identifique automáticamente.

### Precios (`/prices`)
Visualización y gestión de los precios recolectados:
- Tabla con medicamento, proveedor, precio, unidad y fecha
- Filtros por nombre de medicamento y por proveedor
- Resaltado en verde del precio más bajo por medicamento
- Botón **Descargar Excel** para obtener el archivo con la matriz de precios
- Eliminar registros individuales

## Configuración del backend

El frontend usa `baseURL: '/api'` en [src/api/client.js](src/api/client.js). Vite redirige automáticamente todas las peticiones `/api/*` al backend en `http://localhost:8000` (eliminando el prefijo `/api`). Esto está definido en [vite.config.js](vite.config.js):

```js
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

Para apuntar a otro backend cambia el `target` en `vite.config.js`.
