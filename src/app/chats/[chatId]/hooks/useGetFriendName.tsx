import { userApi } from "@/apiService/userApi";
import { useNavContext } from "@/store/NavDrawer/useNavContext";
import { useEffect } from "react";

export const useGetFriendName = (friendUid: string) => {
  const {
    actions: { setNavTitle },
  } = useNavContext();

  const getFriendName = async () => {
    try {
      const { user } = await userApi.searchUser({ userUid: friendUid });
      setNavTitle(`(${user?.displayName})`);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getFriendName();
  }, [friendUid]);
};
