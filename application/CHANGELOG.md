# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2026-09-28

### Added
- **Menú rediseñado**: la barra lateral se reemplazó por un modal inferior
  (bottom sheet) con gradientes, secciones agrupadas (Tomadores, Productos,
  Reportes, Administración) y gesto de arrastrar para cerrar
- **Módulo de Materia Prima** (mantenimiento de insumos):
  - Catálogo con foto, unidad de medida, descripción de uso y stock actual
  - Registro de compras con costo total pagado y cálculo automático de costo
    promedio ponderado por unidad; muestra valor total de inventario
  - Cantidades típicas de compra configurables por insumo, para reabastecer
    seleccionando en vez de escribir la cantidad cada vez
  - Rectificación de stock (conteo físico real) con motivo y fecha, separado
    de las compras, para casos de producto dañado o diferencias de conteo
  - Historial de movimientos (compras, ventas y rectificaciones) filtrable
    por tipo, con usuario y fecha de cada movimiento
- **Recetas de Productos**: pantalla para configurar qué materia prima
  consume cada producto por unidad vendida (ej. "Helado 1 bola" → 1 Cono),
  con selección de producto por categoría igual que en Editar Productos
- **Descuento automático de inventario**: al completar el cobro de una
  orden, se descuenta la materia prima configurada de cada producto vendido;
  si la orden se elimina después de haber sido cobrada, el descuento se
  revierte automáticamente

### Fixed
- **Estado de órdenes**: las órdenes pagadas con tarjeta o mixto se
  guardaban con el status incorrecto y se mostraban como "Cancelado" en vez
  de "Completado" (el bug venía de `OrderService.payOrder`); se corrigió el
  código y se agregó una migración que repara las órdenes ya afectadas
- Advertencia de Redux por valor no serializable en `user.activeUser`
  (el usuario se guardaba como instancia de clase en vez de objeto plano)

## [1.5.3] - 2026-09-14

### Fixed
- **Control de Caja**: el texto que se escribe en los campos de monto y motivo
  al rectificar/configurar caja no tenía color definido y se veía en blanco
  (invisible sobre la tarjeta blanca del formulario)

## [1.5.2] - 2026-09-14

### Added
- **Gastos y Cierre**: al confirmar "Imprimir cierre del día" ahora, además de
  imprimir, se cierra la caja automáticamente — se registra un ajuste con el
  saldo físico esperado (saldo anterior + efectivo de ventas − gastos
  pagados), igual que en la app original. El saldo de caja para el día
  siguiente queda actualizado, con toast de confirmación ("Caja actualizada al
  cierre" / nuevo saldo)

## [1.5.1] - 2026-09-14

### Fixed
- **Cierre del Día**: el segmento de "Caja" (saldo físico, efectivo de ventas,
  gastos pagados, físico esperado en caja ahora, tarjeta) que ya se mostraba en
  Reporte de Gastos ahora también sale en la impresión térmica del cierre y en
  el PDF/visor de reportes — antes solo aparecía en pantalla en un reporte

## [1.5.0] - 2026-09-14

### Added
- **Mantenimiento de Usuarios**: eliminación definitiva de usuarios sin historial
  (órdenes, movimientos de caja o sesiones); si el usuario tiene historial, se
  ofrece desactivarlo en su lugar para no perder la trazabilidad
- **Visor de Reportes** (Mantenimiento → Ver Reporte): pantalla para consultar el
  cierre del día en pantalla (ventas, efectivo, tarjeta, gastos, neto) sin
  necesidad de la impresora, con filtro de rango de fechas
  - Botón "Imprimir / Guardar como PDF" que abre el diálogo nativo de impresión
    de Android, permitiendo guardar el reporte como PDF y compartirlo
    (WhatsApp, correo, etc.) cuando no se puede imprimir en la térmica

### Changed
- Impresora térmica: se incrementó el tiempo de espera entre impresiones para
  reducir errores de orden/alineación en tickets con varios bloques

## [1.4.0] - 2026-09-13

### Added
- **Módulo de Caja**: control de apertura de turno y rectificaciones de efectivo físico
  - `CajaPage` con tarjeta de saldo actual e historial de movimientos
  - `CashRegisterService` sobre la nueva tabla `cash_register`
- **Módulo de Reportes ampliado**:
  - `ReporteDias`: ventas por día de la semana, ranking y mejor/peor día
  - `ReporteComparativo`: semana/mes actual vs. período anterior
  - `ReporteOrdenes`: completadas/canceladas por hora y tasa de conversión
  - 3 tarjetas nuevas en el Hub de Reportes
- **Módulo de Usuarios**: selección de usuario sin contraseña
  - Selector obligatorio una vez al día (registra hora de llegada) al abrir la app
  - Cambio de usuario libre durante el día desde el pie del menú lateral
  - Pantalla de administración (Mantenimiento → Usuarios): crear, renombrar, (des)activar
  - Órdenes y movimientos de caja quedan etiquetados con el usuario que los hizo
- **Eliminar orden** (borrado suave): la orden deja de aparecer en el listado y en todos
  los reportes, con doble confirmación y selección de quién la elimina; se conserva
  el historial completo (quién y cuándo) para auditoría

## [1.3.0] - 2025-10-24

### Added
- **Product Creation System**: Complete system for creating products with filesystem image storage
  - Image picker integration with `react-native-image-picker`
  - Image storage service for managing product images in device filesystem
  - Support for both legacy (bundled) and filesystem images
  - Automatic image cleanup on product deletion
- **Product Image Management**: Universal `ProductImage` component supporting multiple image sources
  - Legacy images (bundled with app via `require()`)
  - Filesystem images (stored in device storage)
  - URL-based images (for future remote image support)
- **Delete Product Functionality**: Complete product deletion with confirmation modal
  - Modal confirmation dialog before deletion
  - Automatic image file cleanup for filesystem images
  - Success/error toast notifications
- **Product ID Auto-increment**: Ensures unique product IDs by calculating max ID + 1

### Changed
- **Modal UI Redesign**: Complete redesign of `GenericModal` component
  - Modern, vibrant design with gradient buttons
  - Warning icon with circular background
  - Improved typography and spacing
  - Better visual hierarchy with icons
  - Consistent with app's ice cream theme (pink/purple gradients)
- **Image Handling**: Unified image source system across all components
  - `ModernProductCard` now supports both legacy and filesystem images
  - `EditProductListItem` uses `ProductImage` component
  - `EditProduct` page displays correct images for all types
  - `ImageStorageService.getImageSource()` method for universal image handling

### Fixed
- **NumberIndicator Rendering Error**: Fixed "Text strings must be rendered within a <Text> component" error
  - Changed condition from `shoppingCart.find(item => item === id)` to `shoppingCart.find(item => item === id) !== undefined`
  - Prevents React from trying to render `0` as text when product ID is 0
- **Product ID Duplication**: Fixed auto-increment issue causing multiple products with ID 0
  - Implemented manual ID assignment using max ID + 1
  - Ensures all new products get unique IDs
- **Image Display**: Fixed black/empty images for filesystem products in EditListProducts
  - Corrected `ImageStorageService.getImageSource()` parameter handling
  - Fixed URI generation for filesystem images with proper `file://` protocol
- **Image Source Resolution**: Fixed image parameter passing to avoid conflicts between legacy and filesystem images

### Technical
- Added `ImageStorageService` class for centralized image management
- Added `ProductImage` component for universal image rendering
- Enhanced `ProductService` with `deleteProduct()` method
- Added migration support for `image_type` column
- Improved error handling and logging throughout image system
- Added validation to prevent null/undefined image sources

## [1.2.0] - 2025-01-19

### Added
- Modern home page redesign with prominent product images and vibrant colors
- ModernProductCard component with gradient overlays and category badges
- ModernActionButtons component with breadcrumb navigation integration
- CartSummary floating widget with circular design and badge counter
- CategoryBreadcrumb component for intuitive hierarchical navigation
- Order detail page with print functionality and order information display
- Print counter on order cards showing number of times printed
- Reprint functionality for existing orders
- Currency symbol configuration (Q for Guatemalan Quetzales) in AppConfig
- Centralized AppConfig.ts for application-wide constants and version management
- Daily reports feature for order tracking
- Auto-complete cash amount on payment page

### Changed
- Redesigned shopping cart with editable quantity fields
- Updated PayPage with modern gradient payment method cards
- Optimized PayPage layout for tablet landscape mode (no scrolling required)
- Redesigned drawer menu with larger icons, gradient header, and version display
- Modernized order list with vibrant gradient cards
- Updated order filter with single-row layout for tablets
- Improved order cards with responsive grid layout (2-4 columns based on screen size)
- Changed category and product cards to display 4 items per row consistently
- Simplified cart summary to icon-only circular button
- Removed duplicate "Atrás" and "Menú" buttons in favor of breadcrumb navigation

### Fixed
- Shopping cart quantity editing now maintains item position
- Card payment form modal display issue
- Cash form container layout spacing
- Order filter button alignment and touch feedback
- Product card text wrapping on action buttons
- Category card width to match product grid layout

### Performance
- Implemented lazy loading for product editing page
- Optimized card rendering with proper flexbox layouts

### Style
- Complete UI overhaul with vibrant ice cream theme colors
- Enhanced input styling across application
- Modern gradient backgrounds on cards and buttons
- Improved button visual feedback with activeOpacity
- Better shadow and elevation effects for depth
- Consistent spacing and typography throughout

## [1.1.0] - 2024-XX-XX

### Added
- Daily reports feature
- Icons update (Sarita icons)

### Fixed
- Modal auto width and height

## [1.0.1] - 2024-XX-XX

### Fixed
- Various bug fixes and improvements

## [1.0.0] - 2024-XX-XX

### Added
- Initial production release
- Database connection with TypeORM and SQLite
- Product management system
- Shopping cart functionality
- Order creation and management
- FEL (Electronic Invoice) integration
- Optional printing feature
- Modal components
- Theme support (light/dark modes)
- Category tree navigation with 3rd level support
- Lato font family integration
- USB printer support
- React Redux state management
- React Native Reanimated animations

[1.3.0]: https://github.com/yourusername/ice-cream-management/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/yourusername/ice-cream-management/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/yourusername/ice-cream-management/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/yourusername/ice-cream-management/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/yourusername/ice-cream-management/releases/tag/v1.0.0
