import { api } from "@/lib/axios/api";

export const userApi = {
  checkProfile: () => api.post<CheckProfileResponse>("/checkProfile"),
  createUser: ({ displayName, username }: { displayName: string; username: string }) =>
    api.post<CreateUserResponse>("/createUser", { displayName, username }),
};

interface CheckProfileResponse {
  exists: boolean;
}

interface CreateUserResponse {
  success: boolean;
  error?: string;
}
