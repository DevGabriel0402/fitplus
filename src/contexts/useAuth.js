import { useContext } from "react";
import { AuthContexto } from "./AuthContext";

export function useAuth() {
  const contexto = useContext(AuthContexto);

  if (!contexto) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return contexto;
}
