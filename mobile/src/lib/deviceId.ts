import * as Crypto from "expo-crypto";
import { storageGet, storageSet } from "./appStorage";

const DEVICE_KEY = "hospitality_device_install_id";

export async function getOrCreateDeviceInstallId(): Promise<string> {
  const existing = await storageGet(DEVICE_KEY);
  if (existing) return existing;
  const id = Crypto.randomUUID();
  await storageSet(DEVICE_KEY, id);
  return id;
}
