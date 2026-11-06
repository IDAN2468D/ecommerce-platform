export interface SharedCartItem {
  skuCode: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  image?: string;
  addedBy?: string;
  lastUpdatedBy?: string;
}

export interface SharedCartParticipant {
  id: string;
  name: string;
  avatarColor: string;
  joinedAt: string;
  lastActiveAt: string;
  isHost?: boolean;
}

export interface SharedCartActivity {
  id: string;
  text: string;
  timestamp: string;
  userName: string;
  type: "item_added" | "item_updated" | "item_removed" | "user_joined" | "user_left" | "checkout_started";
}

export interface SharedCartRoom {
  roomId: string;
  createdAt: string;
  updatedAt: string;
  hostId: string;
  hostName: string;
  items: SharedCartItem[];
  participants: SharedCartParticipant[];
  activities: SharedCartActivity[];
  status: "ACTIVE" | "CHECKOUT" | "ORDERED";
}

type SseSubscriber = (event: { type: string; payload: any }) => void;

interface GlobalStore {
  rooms: Map<string, SharedCartRoom>;
  subscribers: Map<string, Set<SseSubscriber>>;
}

const globalRef = globalThis as unknown as { __SHARED_CART_GLOBAL_STORE__?: GlobalStore };

if (!globalRef.__SHARED_CART_GLOBAL_STORE__) {
  globalRef.__SHARED_CART_GLOBAL_STORE__ = {
    rooms: new Map(),
    subscribers: new Map(),
  };
}

const store = globalRef.__SHARED_CART_GLOBAL_STORE__;

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-cyan-500",
];

export function getOrCreateRoom(roomId: string, hostName: string = "משתמש ראשי"): SharedCartRoom {
  if (store.rooms.has(roomId)) {
    return store.rooms.get(roomId)!;
  }

  const hostId = "user_" + Math.random().toString(36).substring(2, 9);
  const newRoom: SharedCartRoom = {
    roomId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hostId,
    hostName,
    items: [],
    participants: [
      {
        id: hostId,
        name: hostName,
        avatarColor: AVATAR_COLORS[0],
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isHost: true,
      },
    ],
    activities: [
      {
        id: "act_" + Date.now(),
        text: `${hostName} פתח/ה את העגלה השיתופית`,
        timestamp: new Date().toISOString(),
        userName: hostName,
        type: "user_joined",
      },
    ],
    status: "ACTIVE",
  };

  store.rooms.set(roomId, newRoom);
  return newRoom;
}

export function getRoom(roomId: string): SharedCartRoom | null {
  return store.rooms.get(roomId) || null;
}

export function addParticipant(
  roomId: string,
  participantId: string,
  participantName: string
): SharedCartParticipant {
  const room = getOrCreateRoom(roomId, "משתמש ראשי");
  let participant = room.participants.find((p) => p.id === participantId);

  if (!participant) {
    const colorIndex = room.participants.length % AVATAR_COLORS.length;
    participant = {
      id: participantId,
      name: participantName || `שותף ${room.participants.length + 1}`,
      avatarColor: AVATAR_COLORS[colorIndex],
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isHost: false,
    };
    room.participants.push(participant);
    room.activities.unshift({
      id: "act_" + Date.now(),
      text: `${participant.name} הצטרף/ה לקניות המשותפות`,
      timestamp: new Date().toISOString(),
      userName: participant.name,
      type: "user_joined",
    });
    room.updatedAt = new Date().toISOString();
    broadcastEvent(roomId, "USER_JOINED", { participant, room });
  } else {
    participant.lastActiveAt = new Date().toISOString();
  }

  return participant;
}

export function removeParticipant(roomId: string, participantId: string): void {
  const room = store.rooms.get(roomId);
  if (!room) return;

  const found = room.participants.find((p) => p.id === participantId);
  if (found) {
    room.participants = room.participants.filter((p) => p.id !== participantId);
    room.activities.unshift({
      id: "act_" + Date.now(),
      text: `${found.name} עזב/ה את העגלה`,
      timestamp: new Date().toISOString(),
      userName: found.name,
      type: "user_left",
    });
    room.updatedAt = new Date().toISOString();
    broadcastEvent(roomId, "USER_LEFT", { participantId, room });
  }
}

export function updateRoomCart(
  roomId: string,
  items: SharedCartItem[],
  actorName: string = "שותף",
  actionDescription?: string
): SharedCartRoom {
  const room = getOrCreateRoom(roomId, actorName);
  room.items = items;
  room.updatedAt = new Date().toISOString();

  if (actionDescription) {
    room.activities.unshift({
      id: "act_" + Date.now(),
      text: `${actorName} ${actionDescription}`,
      timestamp: new Date().toISOString(),
      userName: actorName,
      type: "item_updated",
    });
  }

  if (room.activities.length > 30) {
    room.activities = room.activities.slice(0, 30);
  }

  broadcastEvent(roomId, "CART_UPDATED", {
    room,
    lastActor: actorName,
    action: actionDescription,
  });

  return room;
}

export function subscribeToRoom(roomId: string, callback: SseSubscriber): () => void {
  if (!store.subscribers.has(roomId)) {
    store.subscribers.set(roomId, new Set());
  }
  const subs = store.subscribers.get(roomId)!;
  subs.add(callback);

  return () => {
    subs.delete(callback);
    if (subs.size === 0) {
      store.subscribers.delete(roomId);
    }
  };
}

export function broadcastEvent(roomId: string, type: string, payload: any): void {
  const subs = store.subscribers.get(roomId);
  if (subs && subs.size > 0) {
    subs.forEach((cb) => {
      try {
        cb({ type, payload });
      } catch (err) {
        console.warn("Error notifying subscriber:", err);
      }
    });
  }
}
