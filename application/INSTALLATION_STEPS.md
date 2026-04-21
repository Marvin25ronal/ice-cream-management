# Pasos de Instalación para el Sistema de Imágenes con Migración Automática

## ⚠️ IMPORTANTE: Migración Automática al Inicio

Este sistema ejecuta **migraciones automáticas al iniciar la aplicación**.
- La migración se ejecuta una sola vez (usa flag en AsyncStorage)
- Si la columna ya existe, no hace nada
- Si falla, la app continúa en modo legacy (sin funcionalidad de nuevos productos)
- Es **seguro** para producción: no rompe la app si algo falla

---

## 1. Instalar Dependencias

```bash
npm install @react-native-picker/picker @react-native-async-storage/async-storage
```

**Nota**: Las siguientes dependencias ya están instaladas:
- `react-native-image-picker@5.7.0` ✅
- `react-native-fs@2.20.0` ✅

## 2. Configuración Android

Agregar permisos en `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.CAMERA" />
```

## 3. Rebuild del proyecto

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## 4. Migración de Base de Datos

Necesitas agregar solo UNA columna nueva en tu base de datos SQLite:

```sql
ALTER TABLE product ADD COLUMN image_type TEXT DEFAULT 'legacy';
```

**Nota**: Reutilizamos la columna `image` existente:
- Legacy: contiene nombre para buscar en ImagesDefinition (ej: '/products/cono.png')
- Filesystem: contiene path completo del archivo (ej: '/data/.../product_123.jpg')
- URL: contiene URL remota (ej: 'https://...')

Actualizar el archivo bundled database en:
`android/app/src/main/assets/custom/IceCreamDatabase.db`

## 5. Uso

Después de instalar, la app podrá:
- Productos existentes: Usan imágenes de assets (sistema legacy)
- Productos nuevos: Guardan imágenes en el dispositivo (filesystem)
