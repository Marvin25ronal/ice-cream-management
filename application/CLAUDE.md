# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native ice cream management application that uses SQLite for local data storage. The app manages categories and products in a hierarchical tree structure, designed for point-of-sale or inventory management purposes.

## Development Commands

### Running the Application
- **Start Metro bundler**: `npm start` or `yarn start`
- **Run on Android**: `npm run android` or `yarn android`
- **Run on iOS**: `npm run ios` or `yarn ios`

### Code Quality
- **Lint**: `npm run lint` or `yarn lint`
- **Test**: `npm test` or `yarn test`

### Requirements
- Node.js >= 18
- React Native environment setup completed (see React Native docs)

## Architecture

### Database Layer
- **ORM**: TypeORM with React Native SQLite
- **Bundled Database**: Pre-seeded database file at `android/app/src/main/assets/custom/IceCreamDatabase.db`
- **Initialization**: Database is created/loaded on app start in `App.tsx` via `CreateDatabase()`
- **Connection**: TypeORM DataSource configured in `src/store/db/Database.ts`

**Important**:
- The app uses a pre-bundled SQLite database that's copied from app assets on first run
- TypeORM decorators require special Babel configuration (already set up)
- Database synchronize is set to `false` - migrations must be handled manually in the bundled DB file

### Data Model
The application uses a hierarchical category-product structure:

- **Category** (`src/entity/Category.entity.ts`):
  - Supports multi-level hierarchy via `parent_id` self-referencing
  - Has ordering (`order` field)
  - Related to products via one-to-many relationship

- **Product** (`src/entity/Product.entity.ts`):
  - Belongs to one category
  - Has image, price, order, creation/update dates
  - Images stored as file paths/references

### Tree Structure
- **Service**: `HomeServices` (`src/services/HomeServices.ts`) constructs hierarchical tree from flat category list
- **Interface**: `TreeNode` (`src/interface/TreeInterface.ts`) represents the recursive tree structure
- Categories can have unlimited nesting levels
- Products are sorted by their `order` field within each category

### State Management
- **Redux Toolkit** for global state
- **Store** at `src/store/redux/store.ts`
- Current reducers:
  - `themeReducer`: Manages app theme (currently always set to dark theme)

**Note**: The theme toggling is commented out - both light/dark modes currently resolve to dark theme

### Navigation
- **React Navigation v6** with multiple navigators:
  - **Drawer Navigator** (`src/routes/DrawerNavigator.tsx`): Top-level navigation with theme integration
  - **Stack Navigator** (`src/routes/StackNavigator.tsx`): Screen stack management

- **Screen Constants**: Defined in `src/constants/navigation/screens.ts`
- **Theme Integration**: Navigation headers use Redux theme colors

### Styling & Theming
- Custom theme system at `src/styles/Theme.ts`
- Theme interface defined in `src/interface/themeInterface.ts`
- Custom fonts (Lato family) bundled in `android/app/src/main/assets/fonts/`
- Font constants in `src/constants/Fonts.ts`

### TypeScript Configuration
- **Decorators**: Enabled for TypeORM entities (`experimentalDecorators: true`)
- **Metadata**: Emit decorator metadata enabled for TypeORM reflection
- **Strict mode**: Enabled
- **Babel plugins** required:
  - `babel-plugin-transform-typescript-metadata`
  - `@babel/plugin-proposal-decorators` with `{ legacy: true }`

## Key Patterns

### Database Access
Always access database through service layer:
```typescript
// Good - use service
const service = new HomeServices();
const categories = await service.getCategoriesMenu();

// Avoid - direct TypeORM access outside services
```

### TypeORM Entities
When modifying entities:
1. Update the entity class with decorators
2. Modify the bundled database file manually (no auto-sync)
3. Test with fresh install to ensure database migration works

### Adding New Screens
1. Define screen name in `src/constants/navigation/screens.ts`
2. Create page component in `src/pages/`
3. Add to appropriate navigator in `src/routes/`

### Image Handling
- Images referenced by path in Product/Category entities
- Stored in `assets/` directory
- Note: Recent commit mentions JPG build error - prefer PNG format

## Debugging Notes

- SQLite database tables are logged on connection (see Database.ts)
- Category/product queries log results to console
- React Native debugger or Flipper can inspect SQLite database
