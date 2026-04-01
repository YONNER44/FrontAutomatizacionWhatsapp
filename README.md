# FrontAutomatizacionWhatsapp

Panel de administración web para el sistema de recolección automática de precios de medicamentos vía WhatsApp.

## Tecnologías

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| React | 18.3.1 | Framework UI |
| Vite | 6.1.0 | Build tool + dev server |
| React Router | 7.1.5 | Enrutamiento SPA |
| TanStack Query | 5.65.1 | Caché y sincronización con el backend |
| Axios | 1.7.9 | Cliente HTTP |
| Tailwind CSS | 3.4.17 | Estilos utilitarios |
| Lucide React | 0.475.0 | Iconografía |
| react-qr-code | 2.0.18 | Generación del código QR de WhatsApp |
| react-hot-toast | 2.4.1 | Notificaciones |
| Nginx | — | Servidor de producción (dentro del contenedor Docker) |

## Estructura del proyecto

```
src/
├── api/
│   └── client.js          # Funciones Axios para cada endpoint del backend
├── assets/
│   └── *.png              # Imágenes y logo de la aplicación
├── components/
│   ├── Layout.jsx          # Sidebar de navegación + outlet de contenido
│   ├── Modal.jsx           # Modal reutilizable (confirmaciones, alertas)
│   └── StatCard.jsx        # Tarjeta de métrica para el Dashboard
└── pages/
    ├── Dashboard.jsx       # Métricas, proveedores y botones de inicialización
    ├── Providers.jsx       # CRUD de proveedores (distribuidoras)
    ├── Prices.jsx          # Consulta de precios con filtros y descarga Excel
    ├── WhatsAppQR.jsx      # QR para vincular WhatsApp Web
    └── Settings.jsx        # Configuración de credenciales de Google Sheets
```

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:8000`
- Servicio WhatsApp Node.js corriendo en `http://localhost:3000`

## Instalación y uso (desarrollo)

```bash
# Instalar dependencias
npm install

# Levantar dev server (con hot reload)
npm run dev
```

App disponible en: `http://localhost:5173`

```bash
# Compilar para producción
npm run build

# Vista previa del build de producción
npm run preview
```

## Despliegue con Docker (producción)

El frontend se sirve mediante nginx dentro de un contenedor Docker. El build de producción se genera en la etapa de build de la imagen y se copia a nginx:

```bash
# Desde la raíz del proyecto
docker compose up --build -d frontend
```

Disponible en: `http://localhost:80`

## Rutas de la aplicación

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | — | Redirige a `/dashboard` |
| `/dashboard` | `Dashboard.jsx` | Panel principal con métricas y botones de acción |
| `/providers` | `Providers.jsx` | CRUD de proveedores (distribuidoras farmacéuticas) |
| `/prices` | `Prices.jsx` | Consulta de precios recolectados |
| `/whatsapp` | `WhatsAppQR.jsx` | Código QR para vincular WhatsApp Web |
| `/settings` | `Settings.jsx` | Configuración de Google Sheets |

## Páginas

### Dashboard (`/dashboard`)

Muestra cuatro tarjetas de métricas:
- **Proveedores activos** — distribuidoras con estado activo
- **Medicamentos** — total de medicamentos únicos registrados
- **Registros de precios** — total de entradas acumuladas en la base de datos
- **Excel generado** — si el archivo Excel local tiene datos

Lista de todos los proveedores registrados con su estado (activo/inactivo).

**Botón "Inicializar día"** (verde) → `POST /prices/init-day`
- **Primera vez del mes** (hoja vacía): crea la estructura completa de la hoja — fila 1 con nombres de los proveedores activos (fondo azul, celdas combinadas) y fila 2 con columnas Fecha/Medicamento/Precio/Cantidad (fondo azul).
- **Días posteriores**: inserta una fila vacía de separación + bloque de encabezados azules debajo de los datos existentes.
- Si el encabezado del día ya existe, muestra advertencia y no duplica.

**Botón "Inicializar [mes]"** (azul) → `POST /prices/init-month`
- Crea la pestaña `YYYY-MM` como hoja vacía (sin formato) en Google Sheets y en el Excel local.
- Si la hoja ya existe, muestra advertencia sin modificar los datos.

Ambos botones muestran el resultado inline:
- **Verde** → creado correctamente
- **Amarillo** → ya existía, sin cambios
- **Rojo** → error con detalle del mensaje

### Proveedores (`/providers`)

Gestión completa de las distribuidoras farmacéuticas:
- Tabla con nombre, número de WhatsApp y estado
- **Agregar** proveedor con nombre y número en formato internacional (`573001234567`)
- **Editar** nombre, número y estado activo/inactivo
- **Eliminar** proveedor (con modal de confirmación)

> El número debe coincidir exactamente con el número desde el que la distribuidora envía mensajes. El sistema normaliza automáticamente entre formato completo (12 dígitos) y local (10 dígitos).

### Precios (`/prices`)

Visualización de los precios recolectados automáticamente:
- Tabla con medicamento, proveedor, precio, unidad y fecha
- Filtros por nombre de medicamento y por proveedor
- **Resaltado en verde** del precio más bajo por medicamento (solo cuando hay 2+ proveedores y los precios son distintos)
- Botón **Descargar Excel** — genera y descarga el archivo `.xlsx` desde la base de datos
- **Eliminar** registros individuales (con modal de confirmación)

> Solo aparecen medicamentos que el administrador incluyó previamente en la hoja de Google Sheets. Los medicamentos enviados por el proveedor que no existan en las filas del día actual son ignorados automáticamente por el backend.

### WhatsApp QR (`/whatsapp`)

- Muestra el código QR generado por el servicio Node.js (`whatsapp-web.js`)
- El administrador escanea el QR con el teléfono para vincular WhatsApp Web al sistema
- El QR se actualiza automáticamente cuando la sesión expira o caduca
- Una vez vinculado, la sesión persiste entre reinicios del contenedor

### Configuración (`/settings`)

Permite configurar las credenciales de Google Sheets sin editar archivos del servidor:

- **Estado de conexión**: credenciales guardadas, email de la cuenta de servicio, estado online/offline. Botón de recarga manual.
- **ID de la Google Sheet**: campo para ingresar el ID (se obtiene de la URL de Google Sheets: `https://docs.google.com/spreadsheets/d/{ID}/...`).
- **Archivo de credenciales JSON**: zona drag-and-drop para subir el JSON de cuenta de servicio de Google Cloud.
- **Guía integrada**: instrucciones paso a paso para crear las credenciales en Google Cloud Console.
- **Botón "Guardar y probar conexión"**: guarda la configuración en el backend, prueba la conexión y muestra el resultado inline.

> Las credenciales se guardan en `data/app_config.json` en el servidor (volumen persistente). Una vez configuradas, el campo de credenciales es opcional en futuras actualizaciones (solo el sheet ID si cambia).

## Cliente HTTP (`src/api/client.js`)

| Función | Método | Ruta | Descripción |
|---------|--------|------|-------------|
| `getProviders()` | GET | `/providers` | Listar proveedores |
| `createProvider(data)` | POST | `/providers` | Crear proveedor |
| `updateProvider(id, data)` | PUT | `/providers/{id}` | Actualizar proveedor |
| `deleteProvider(id)` | DELETE | `/providers/{id}` | Eliminar proveedor |
| `getPrices(params)` | GET | `/prices` | Consultar precios con filtros opcionales |
| `getPricesSummary()` | GET | `/prices/summary` | Resumen estadístico |
| `deletePrice(id)` | DELETE | `/prices/{id}` | Eliminar precio |
| `getExcelDownloadUrl()` | — | `/prices/export/excel` | URL de descarga del Excel |
| `initMonthlySheet(force)` | POST | `/prices/init-month` | Crear pestaña vacía del mes |
| `initDaySheet()` | POST | `/prices/init-day` | Inicializar estructura del día |
| `getConfigStatus()` | GET | `/config/status` | Estado de conexión con Google Sheets |
| `saveGoogleConfig(formData)` | POST | `/config/google` | Guardar sheet ID y/o credenciales JSON |

## Configuración de proxy

En desarrollo, Vite redirige automáticamente las peticiones al backend y al servicio WhatsApp (`vite.config.js`):

```js
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
  '/wa': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/wa/, ''),
  },
}
```

En producción (Docker), nginx gestiona el proxy. La configuración está en `nginx.conf`.

## Sidebar y branding

El layout incluye un sidebar con:
- Logo de la aplicación
- Navegación con íconos: Dashboard, Proveedores, Precios, WhatsApp QR, Configuración
- Pie de página con la firma de desarrollo:
  - **neuroDIT** — From\[Data\]to{Disruption}
  - Yonner Vargas Bernate — Desarrollador
