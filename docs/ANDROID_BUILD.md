# 📱 Guía de Empaquetado Android (APK y AAB) — Fitness Evolution

Esta guía describe el procedimiento paso a paso para generar tanto el archivo instalable directo **APK** como el paquete de publicación para Google Play Store **AAB** a partir del mismo código base web, utilizando **Capacitor**.

---

## 1. Requisitos Previos

1. **Node.js** (v18 o superior).
2. **Android Studio** instalado (con Android SDK y Build Tools actualizados).
3. **Java JDK 17** o 21 configurado en las variables de entorno (`JAVA_HOME`).

---

## 2. Preparar el Build Web

El proyecto compila los archivos estáticos a la carpeta `dist/`:

```powershell
# En la raíz del proyecto (o mediante el script sincronizador local):
npm run build
```

Esto generará el paquete optimizado en `dist/` con `index.html`, scripts y estilos minificados.

---

## 3. Inicializar y Sincronizar el Proyecto Android

Para añadir la plataforma Android a Capacitor (se realiza una única vez):

```powershell
# Instalar dependencias de Capacitor (si no están ya instaladas en package.json):
npm install @capacitor/core @capacitor/cli @capacitor/android

# Añadir plataforma Android:
npx cap add android
```

Cada vez que realices cambios en el código de la aplicación y compiles (`npm run build`), sincroniza los archivos con la carpeta nativa de Android:

```powershell
npx cap sync android
```

---

## 4. Abrir en Android Studio

Ejecuta el siguiente comando para abrir el entorno oficial de desarrollo Android:

```powershell
npx cap open android
```

Android Studio cargará la carpeta `android/` con Gradle.

---

## 5. Generar APK (Instalación Directa en Teléfono)

Para probar la aplicación inmediatamente en tu teléfono o distribuirla sin tienda:

1. En el menú superior de Android Studio, ve a:
   **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. Espera a que Gradle complete la tarea (suele tardar 1 o 2 minutos en la primera ocasión).
3. Haz clic en el enlace emergente **locate** en la esquina inferior derecha.
4. El archivo generado se encontrará en:
   `android/app/build/outputs/apk/debug/app-debug.apk`
5. Puedes enviar este archivo por cable USB, WhatsApp o Drive a cualquier teléfono Android e instalarlo directamente.

---

## 6. Generar AAB (Android App Bundle para Google Play Store)

Para publicar la aplicación en Google Play:

1. En Android Studio, ve a:
   **Build** > **Generate Signed Bundle / APK...**
2. Selecciona **Android App Bundle** y haz clic en **Next**.
3. Selecciona tu clave privada (**Key store path**) o crea una nueva con **Create new...**.
4. Define el alias y contraseñas.
5. Selecciona la variante **release**.
6. Haz clic en **Finish**.
7. El archivo firmado se encontrará en:
   `android/app/release/app-release.aab`
8. Este archivo `.aab` es el requerido directamente por Google Play Console para producción o pruebas internas (Internal Testing).

---

## 7. Pruebas Locales en Celular Vía Navegador (PWA)

Si prefieres usarla de inmediato sin compilar Android Studio:
1. Inicia el servidor de desarrollo:
   ```powershell
   npm run dev -- --host
   ```
2. Abre la IP de tu computadora desde el navegador Chrome de tu teléfono Android (ej. `http://192.168.1.50:5173`).
3. Toca los tres puntos de Chrome y selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
4. Se instalará exactamente igual que una app nativa, funcionando sin conexión a internet gracias a IndexedDB (Dexie).
