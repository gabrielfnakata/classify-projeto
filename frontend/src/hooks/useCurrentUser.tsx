import CurrentUserContext from "@/context/CurrentUserContext";
import { useContext } from "react";

export function useCurrentUser() {
    const context = useContext(CurrentUserContext);

    return context;
}
