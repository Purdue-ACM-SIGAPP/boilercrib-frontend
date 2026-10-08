# Boiler Rooms Frontend

Expo (React Native) client for the Boiler Rooms API. The API is in
[boilerrooms-backend-2425](https://github.com/Purdue-ACM-SIGAPP/boilerrooms-backend-2425).

## Prerequisites

- [Node.js](https://nodejs.org/) LTS and npm
- One of the following to run the app:
  - iOS Simulator (macOS with Xcode)
  - Android emulator (Android Studio)
  - A phone with [Expo Go](https://expo.dev/go) on the same Wi-Fi as your computer
  - A web browser
- The backend running locally. See the backend README.

## Quick start

1. **Start the backend** (in the backend repo): `docker compose up -d`, then `dotnet run`.
   Check that http://localhost:5128/swagger opens.

2. **Create your `.env`** (in this folder):

   ```
   cp .env.example .env
   ```

   Set `API_BASE_URL` for the device you're using:

   | Running on        | `API_BASE_URL`                   |
   | ----------------- | -------------------------------- |
   | iOS Simulator     | `http://localhost:5128`          |
   | Web browser       | `http://localhost:5128`          |
   | Android emulator  | `http://10.0.2.2:5128`           |
   | Phone (Expo Go)   | `http://<your LAN IP>:5128`      |

   To find your LAN IP:
   - Mac: `ipconfig getifaddr en0`
   - Windows: run `ipconfig` and use the "IPv4 Address" of your Wi-Fi adapter

3. **Install and run:**

   ```
   npm install
   npm start
   ```

   Then press `i` for the iOS Simulator, `a` for Android, or `w` for web. To use a phone, scan
   the QR code with Expo Go (iOS: use the Camera app).

   You can also start a target directly with `npx expo start --ios`, `--android` or `--web`.

## Environment variables

`.env` is required. It's gitignored, so every clone needs its own copy from `.env.example`.

- `API_BASE_URL` (required): the backend URL, with no trailing slash and no `/api`.
- `GOOGLE_MAPS_API_KEY` (optional): used only for native iOS/Android builds
  (`npm run ios` / `npm run android`). You don't need it for Expo Go or web.

The app reads `.env` when it builds the bundle. After you edit `.env`, restart with a cleared
cache, or the old values stay in the bundle:

```
npx expo start -c
```

## Troubleshooting

- **Requests go to `undefined/api/...`**: `.env` is missing, or you edited it without restarting
  using `-c`.
- **Network error on a phone**: `API_BASE_URL` still says `localhost`, which on the phone means
  the phone itself. Use your computer's LAN IP, and make sure both devices are on the same
  network.
- **Network error on the Android emulator**: use `10.0.2.2` instead of `localhost`.
- **The map shows a list on web**: that's expected, because react-native-maps has no web
  version. The interactive map works only on iOS and Android.
