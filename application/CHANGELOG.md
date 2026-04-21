# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
