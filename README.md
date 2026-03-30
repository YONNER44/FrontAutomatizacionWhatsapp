# FrontAutomatizacionWhatsapp

Panel de administración web para el sistema de recolección automática de precios de medicamentos vía WhatsApp.

## Tecnologías

- **React 18** + **Vite 6**
- **React Router v7** – enrutamiento SPA
- **TanStack Query v5** – caché y sincronización de datos con el backend
- **Axios** – cliente HTTP
- **Tailwind CSS 3** – estilos utilitarios
- **Lucide React** – iconografía
- **react-qr-code** – generación de código QR para WhatsApp Web

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
    ├── Dashboard.jsx       # Vista principal con métricas y botones de inicialización
    ├── Providers.jsx       # CRUD de proveedores (distribuidoras farmacéuticas)
    ├── Prices.jsx          # Consulta de precios con filtros y descarga de Excel
    ├── WhatsAppQR.jsx      # Código QR para vincular WhatsApp Web
    └── Settings.jsx        # Configuración de credenciales de Google Sheets
```

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:8000`
- Servicio Node.js WhatsApp corriendo en `http://localhost:3000`

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

## Despliegue con Docker

El frontend se sirve mediante nginx dentro de un contenedor Docker. El build de producción se genera en la etapa de build y se copia a nginx:

```bash
# Desde la raíz del proyecto
docker compose up --build -d frontend
```

Queda disponible en: http://localhost:5173

## Páginas

### Dashboard (`/dashboard`)

Muestra cuatro tarjetas de métricas:
- **Proveedores activos** – cantidad de distribuidoras con estado activo
- **Medicamentos** – total de medicamentos únicos registrados en la BD
- **Registros de precios** – total de entradas acumuladas en la base de datos
- **Excel generado** – si el archivo Excel local tiene datos y cuántos proveedores incluye

Incluye también:
- Lista de todos los proveedores registrados con su estado (activo/inactivo)
- Dos botones de acción en la esquina superior derecha:

**Botón "Inicializar día"** (verde)
Llama a `POST /prices/init-day`. Inserta en Google Sheets y en el Excel local un bloque de encabezado visual para el día actual (nombres de proveedores + columnas Fecha/Medicamento/Precio/Cantidad, en azul) debajo de los datos existentes. El administrador agrega luego los medicamentos manualmente en la hoja. Si el encabezado del día ya existe, muestra advertencia y no duplica.

**Botón "Inicializar [mes]"** (azul)
Llama a `POST /prices/init-month`. Crea la hoja del mes actual en Google Sheets y en el Excel local con el formato de proveedores activos, pero sin medicamentos. Si la hoja ya existe, muestra advertencia y no modifica los datos.

Ambos botones muestran el resultado inline bajo el encabezado:
- Verde → creado correctamente
- Amarillo → ya existía, sin cambios
- Rojo → error

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
- Resaltado en verde del precio más bajo por medicamento (cuando hay 2+ proveedores)
- Botón **Descargar Excel** para obtener el archivo generado desde la base de datos
- Eliminar registros individuales (con modal de confirmación)

> Solo aparecen medicamentos que el administrador incluyó previamente en la hoja de Google Sheets. Los medicamentos que el proveedor envíe y no estén en las filas del día actual son ignorados automáticamente.

### WhatsApp QR (`/whatsapp`)

- Muestra el código QR generado por el servicio Node.js (`whatsapp-web.js`)
- El administrador escanea el QR con el teléfono para vincular WhatsApp Web al sistema
- El QR se actualiza automáticamente cuando la sesión expira

### Configuración (`/settings`)

Permite al cliente configurar sus propias credenciales de Google Sheets sin necesidad de editar archivos del servidor:

- **Estado de conexión**: muestra si hay credenciales guardadas, el email de la cuenta de servicio y si la conexión con Google Sheets está activa. Botón de recarga manual.
- **ID de la Google Sheet**: campo para ingresar el ID de la hoja (se obtiene de la URL de Google Sheets).
- **Archivo de credenciales JSON**: zona de carga (drag-and-drop visual) para subir el archivo de cuenta de servicio de Google Cloud.
- **Guía integrada**: instrucciones paso a paso para crear las credenciales en Google Cloud Console.
- **Botón "Guardar y probar conexión"**: guarda la configuración en el backend y verifica que la conexión sea exitosa. Muestra el resultado (éxito o error) inline.

> Las credenciales se guardan en el servidor de forma segura. Una vez configuradas, el campo de credenciales es opcional en futuras actualizaciones (solo el sheet ID si cambia).

## Funciones del cliente HTTP (`src/api/client.js`)

| Función | Método | Ruta | Descripción |
|---------|--------|------|-------------|
| `getProviders()` | GET | `/providers` | Listar proveedores |
| `createProvider(data)` | POST | `/providers` | Crear proveedor |
| `updateProvider(id, data)` | PUT | `/providers/{id}` | Actualizar proveedor |
| `deleteProvider(id)` | DELETE | `/providers/{id}` | Eliminar proveedor |
| `getPrices(params)` | GET | `/prices` | Consultar precios con filtros opcionales |
| `getPricesSummary()` | GET | `/prices/summary` | Obtener resumen estadístico |
| `deletePrice(id)` | DELETE | `/prices/{id}` | Eliminar registro de precio |
| `getExcelDownloadUrl()` | — | `/prices/export/excel` | URL directa de descarga del Excel |
| `initMonthlySheet(force)` | POST | `/prices/init-month` | Crear hoja mensual en Sheets/Excel |
| `initDaySheet()` | POST | `/prices/init-day` | Insertar encabezado de día actual |
| `getConfigStatus()` | GET | `/config/status` | Estado de la conexión con Google Sheets |
| `saveGoogleConfig(formData)` | POST | `/config/google` | Guardar sheet ID y/o credenciales JSON |

## Configuración del backend

El frontend usa `baseURL: '/api'` en `src/api/client.js`. Vite redirige automáticamente todas las peticiones `/api/*` al backend en `http://localhost:8000` (eliminando el prefijo `/api`). El prefijo `/wa/*` se redirige al servicio WhatsApp en `http://localhost:3000`. Esto está definido en `vite.config.js`:

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

En producción (Docker), nginx maneja el proxy en lugar de Vite. La configuración está en `nginx.conf`.
