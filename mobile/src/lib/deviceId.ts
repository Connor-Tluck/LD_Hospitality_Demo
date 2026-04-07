import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const DEVICE_KEY = "hospitality_device_install_id";

export async function getOrCreateDeviceInstallId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_KEY);
  if (existing) return existing;
  const id = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_KEY, id);
  return id;
}
