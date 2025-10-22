import { api } from "@/lib/axios/api";

export const messageApi = {
  sendMessage: ({ chatId, text }: { chatId: string; text: string }) =>
    api.post<SendMessageResponse>("/sendMessage", { chatId, text }),
};

interface SendMessageResponse {
  success?: boolean;
  error?: string;
  messageId?: string;
}
