import { defaultGuests, defaultWedding } from "@/lib/data";
import { Guest, RSVPStatus, Wedding } from "@/types";

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

const globalForLocalStore = globalThis as unknown as { thieabKaLocalStore?: LocalState };

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

export function isLocalClient(clientId: string) {
  return clientId === LOCAL_CLIENT_ID;
}

export function getLocalStore() {
  if (!globalForLocalStore.thieabKaLocalStore) {
    globalForLocalStore.thieabKaLocalStore = createInitialState();
  }
  return globalForLocalStore.thieabKaLocalStore;
}

export function setLocalUsername(username: string) {
  getLocalStore().username = username || "local admin";
}

export function updateLocalWedding(wedding: Wedding) {
  getLocalStore().wedding = wedding;
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
  return created;
}

export function removeLocalGuest(id: string) {
  const store = getLocalStore();
  const previousLength = store.guests.length;
  store.guests = store.guests.filter((guest) => guest.id !== id);
  return store.guests.length !== previousLength;
}

export function updateLocalRSVP(id: string, status: RSVPStatus) {
  const store = getLocalStore();
  const guest = store.guests.find((item) => item.id === id);
  if (!guest) return false;
  guest.status = status;
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
  return media;
}

export function getLocalMedia(id: string) {
  return getLocalStore().media.get(id) ?? null;
}

export function removeLocalMedia(id: string) {
  return getLocalStore().media.delete(id);
}
