# Lumina & Co. - Catálogo de Joyería

## Problema Original
Página web de catálogo de joyería con carrito de compras, categorías (Anillos, Collares, Pulseras, Aretes, Relojes), opción de pago por transferencia bancaria y envío de pedidos por WhatsApp.

## Arquitectura
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Diseño**: Dark luxury theme "Nocturnal Opulence"
- **Tipografía**: Playfair Display (headings) + Manrope (body)

## Personas de Usuario
1. **Cliente**: Busca joyas, añade al carrito, realiza pedidos por WhatsApp
2. **Administrador**: Gestiona productos, ve pedidos, configura datos bancarios

## Requisitos Core
- Catálogo de productos por categorías
- Carrito de compras con persistencia local
- Checkout con info bancaria y WhatsApp
- Panel de administración CRUD

## Implementado (Enero 2026)
- ✅ Homepage con hero, categorías y productos destacados
- ✅ Catálogo con filtros por categoría
- ✅ Página de detalle de producto
- ✅ Carrito de compras funcional
- ✅ Checkout con datos bancarios y botón WhatsApp
- ✅ Panel admin: productos, pedidos, configuración
- ✅ Diseño dark luxury con acentos dorados
- ✅ WhatsApp: 81171182

## Backlog
### P0 (Crítico)
- N/A - MVP completo

### P1 (Importante)
- Autenticación para panel admin
- Notificaciones de nuevos pedidos
- Búsqueda de productos

### P2 (Mejoras)
- Galería de múltiples imágenes por producto
- Filtros avanzados (precio, disponibilidad)
- Historial de pedidos para clientes
- Integración con pasarela de pago en línea

## Próximas Tareas
1. Configurar datos bancarios reales en /admin -> Configuración
2. Agregar productos reales con imágenes
3. Considerar autenticación para proteger panel admin
