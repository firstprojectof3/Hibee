// Authentication store
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthState = {
  token: string | null;
  onboardingDone: boolean;

  isAuthed: boolean;
  hydrate: () => Promise<void>;

  setToken: (token: string | null) => Promise<void>;
  setOnboardingDone: (done: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

const KEY_TOKEN = "auth.token";
const KEY_ONBOARD = "auth.onboardingDone";

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  onboardingDone: false,

  get isAuthed() {
    return !!get().token;
  },

  hydrate: async () => {
    const [token, onboard] = await Promise.all([
      AsyncStorage.getItem(KEY_TOKEN),
      AsyncStorage.getItem(KEY_ONBOARD),
    ]);

    set({
      token: token ?? null,
      onboardingDone: onboard === "1",
    });
  },

  setToken: async (token) => {
    if (token) await AsyncStorage.setItem(KEY_TOKEN, token);
    else await AsyncStorage.removeItem(KEY_TOKEN);
    set({ token });
  },

  setOnboardingDone: async (done) => {
    await AsyncStorage.setItem(KEY_ONBOARD, done ? "1" : "0");
    set({ onboardingDone: done });
  },

  logout: async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEY_TOKEN),
      AsyncStorage.setItem(KEY_ONBOARD, "0"),
    ]);
    set({ token: null, onboardingDone: false });
  },
}));
