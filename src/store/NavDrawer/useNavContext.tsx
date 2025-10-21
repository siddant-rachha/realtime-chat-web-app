import { useContext } from "react";
import { NavContext } from "./NavContext";

export const useNavContext = () => {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error("useNavContext must be used within an NavProvider");
  }
  return context;
};
