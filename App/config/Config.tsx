// URL de l'API : définie par EXPO_PUBLIC_API_URL (voir .env.example).
// En local, créer un fichier .env.local avec l'adresse de la machine qui fait tourner le backend.
const DEFAULT_API_URL = "http://localhost:3000/api";

export const API_URL: string = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;

if (!__DEV__ && !process.env.EXPO_PUBLIC_API_URL) {
    console.warn("EXPO_PUBLIC_API_URL n'est pas définie : l'application utilise " + DEFAULT_API_URL);
}
