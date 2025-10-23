import { UserType } from "@/commonTypes/types";
import { User } from "firebase/auth";

export interface AuthContextType {
  selectors: {
    user: UserType | null;
    firebaseUser: User | null;
    authLoading: boolean;
  };
  actions: {
    signOutUser: () => Promise<void>;
  };
}
