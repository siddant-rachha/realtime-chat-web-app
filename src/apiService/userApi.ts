import { api } from "@/lib/axios/api";

export const userApi = {
  checkProfile: () => api.post<CheckProfileResponse>("/checkProfile"),
};

interface CheckProfileResponse {
  exists: boolean;
}
