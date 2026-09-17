import { defaultGuests, defaultWedding } from "@/lib/data";
import { Guest, RSVPStatus, Wedding } from "@/types";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export const LOCAL_CLIENT_ID = "local-dev-client";

type LocalMedia = {
  id: string;
  fileName: string;
  mimeType: string;
  data: Buffer;
  kind: "photo" | "video";
};

type LocalState = {
  username: string;
  wedding: Wedding;
  guests: Guest[];
  media: Map<string, LocalMedia>;
  nextGuestNumber: number;
  nextMediaNumber: number;
};

type PersistedLocalState = {
  username: string;
  wedding: Wedding;
  guests: Guest[];
  media: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    data: string;
    kind: "photo" | "video";
  }>;
  nextGuestNumber: number;
  nextMediaNumber: number;
};

const globalForLocalStore = globalThis as unknown as { thieabKaLocalStore?: LocalState };
const localStorePath = path.join(process.cwd(), ".local-store.json");

function createInitialState(): LocalState {
  return {
    username: "local admin",
    wedding: defaultWedding,
    guests: [...defaultGuests],
    media: new Map(),
    nextGuestNumber: 1,
    nextMediaNumber: 1
  };
}

function persistLocalStore(store: LocalState) {
  const data: PersistedLocalState = {
    username: store.username,
    wedding: store.wedding,
    guests: store.guests,
    media: Array.from(store.media.values()).map((media) => ({
      ...media,
      data: media.data.toString("base64")
    })),
    nextGuestNumber: store.nextGuestNumber,
    nextMediaNumber: store.nextMediaNumber
  };
  writeFileSync(localStorePath, JSON.stringify(data), "utf8");
}

function loadLocalStore(): LocalState {
  if (!existsSync(localStorePath)) return createInitialState();
  try {
    const data = JSON.parse(readFileSync(localStorePath, "utf8")) as PersistedLocalState;
    return {
      username: data.username || "local admin",
      wedding: { ...defaultWedding, ...(data.wedding ?? {}) },
      guests: Array.isArray(data.guests) ? data.guests : [],
      media: new Map((data.media ?? []).map((media) => [media.id, {
        ...media,
        data: Buffer.from(media.data, "base64")
      }])),
      nextGuestNumber: data.nextGuestNumber || 1,
      nextMediaNumber: data.nextMediaNumber || 1
    };
  } catch {
    return createInitialState();
  }
}

export function isLocalClient(clientId: string) {
  return clientId === LOCAL_CLIENT_ID;
}

export function getLocalStore() {
  if (!globalForLocalStore.thieabKaLocalStore) {
    globalForLocalStore.thieabKaLocalStore = loadLocalStore();
  }
  return globalForLocalStore.thieabKaLocalStore;
}

export function setLocalUsername(username: string) {
  const store = getLocalStore();
  store.username = username || "local admin";
  persistLocalStore(store);
}

export function updateLocalWedding(wedding: Wedding) {
  const store = getLocalStore();
  store.wedding = wedding;
  persistLocalStore(store);
}

export function createLocalGuests(inputs: Array<Pick<Guest, "name" | "phone" | "table">>) {
  const store = getLocalStore();
  const created = inputs.map((guest) => {
    const number = store.nextGuestNumber++;
    const luckyId = `TK-${String(1400 + (number - 1) * 13).padStart(4, "0")}`;
    return {
      id: `local-guest-${number}`,
      name: guest.name.trim().replace(/\s+/g, " "),
      phone: guest.phone?.trim() ?? "",
      table: guest.table?.trim() ?? "",
      luckyId,
      status: "pending" as const
    };
  });
  store.guests.push(...created);
  persistLocalStore(store);
  return created;
}

export function removeLocalGuest(id: string) {
  const store = getLocalStore();
  const previousLength = store.guests.length;
  store.guests = store.guests.filter((guest) => guest.id !== id);
  persistLocalStore(store);
  return store.guests.length !== previousLength;
}

export function updateLocalRSVP(id: string, status: RSVPStatus) {
  const store = getLocalStore();
  const guest = store.guests.find((item) => item.id === id);
  if (!guest) return false;
  guest.status = status;
  persistLocalStore(store);
  return true;
}

export function getLocalInvitation(id: string) {
  const store = getLocalStore();
  const guest = store.guests.find((item) => item.id === id);
  return guest ? { wedding: store.wedding, guest } : null;
}

export function addLocalMedia(input: Omit<LocalMedia, "id">) {
  const store = getLocalStore();
  const id = `local-media-${store.nextMediaNumber++}`;
  const media = { ...input, id };
  store.media.set(id, media);
  persistLocalStore(store);
  return media;
}

export function getLocalMedia(id: string) {
  return getLocalStore().media.get(id) ?? null;
}

export function removeLocalMedia(id: string) {
  const store = getLocalStore();
  const removed = store.media.delete(id);
  if (removed) persistLocalStore(store);
  return removed;
}
