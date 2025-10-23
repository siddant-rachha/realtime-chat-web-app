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
