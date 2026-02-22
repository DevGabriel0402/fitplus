import { Routes, Route, Navigate } from "react-router-dom";
import RotaProtegida from "./RotaProtegida";
import Login from "../pages/Login/Login";
import AppShell from "../ui/AppShell";
import Biblioteca from "../pages/biblioteca/Biblioteca";
import CadastroExercicio from "../pages/biblioteca/CadastroExercicio";

export default function Rotas() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <RotaProtegida>
            <AppShell />
          </RotaProtegida>
        }
      >
        <Route index element={<Biblioteca />} />
        <Route path="cadastro" element={<CadastroExercicio />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
