import { ChatListItem } from "@/commonTypes/types";
import { api } from "@/lib/axios/api";

export const messageApi = {
  sendMessage: ({ chatId, text, image }: { chatId: string; text: string; image?: string }) =>
    api.post<SendMessageResponse>("/sendMessage", { chatId, text, image }),
  fetchChatList: () => api.post<ChatListItemResponse>("/getChats"),
};

interface SendMessageResponse {
  success?: boolean;
  error?: string;
  messageId?: string;
}

interface ChatListItemResponse {
  chatList: ChatListItem[];
  error?: string;
}
