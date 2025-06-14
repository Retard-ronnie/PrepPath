import { useContext } from "react";
import { AuthContext } from "../context/Contexts";

export const useAuth = ()=>  useContext(AuthContext)