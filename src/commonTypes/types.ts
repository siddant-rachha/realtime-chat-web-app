export interface UserType {
  displayName: string;
  username: string;
  uid: string;
}

export interface ChatListItem {
  chatId: string;
  friendUid: string;
  displayName: string;
  username: string;
  lastMessage: string;
}

export interface Message {
  id: string;
  senderUid: string;
  text: string;
  timestamp: number;
  status?: Record<string, "sent" | "read">;
  deleted: boolean;
  edited: boolean;
  image?: string;
}

export interface UserStatus {
  state: "online" | "offline";
  last_changed: number;
}
