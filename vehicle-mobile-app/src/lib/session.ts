import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export async function setToken(token: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }

  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setUser(user: {
  id: string;
  name: string;
  email: string;
}) {
  const value = JSON.stringify(user);

  if (Platform.OS === "web") {
    localStorage.setItem(USER_KEY, value);
    return;
  }

  await AsyncStorage.setItem(USER_KEY, value);
}

export async function getUser() {
  const raw =
    Platform.OS === "web"
      ? localStorage.getItem(USER_KEY)
      : await AsyncStorage.getItem(USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as { id: string; name: string; email: string };
  } catch {
    return null;
  }
}

export async function clearSession() {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return;
  }

  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
