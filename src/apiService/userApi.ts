import { api } from "@/lib/axios/api";
import { UserType } from "@/types/types";

export const userApi = {
  getProfile: () => api.post<GetProfileResponse>("/getProfile"),
  createUser: ({ displayName, username }: { displayName: string; username: string }) =>
    api.post<CreateUserResponse>("/createUser", { displayName, username }),
};

type GetProfileResponse = UserType & {
  error?: string;
};

interface CreateUserResponse {
  success: boolean;
  error?: string;
}
