import { useAuth } from "../../contexts/useAuth";

export default function Home() {
  const { usuario, sair } = useAuth();

  return (
    <main style={{ padding: 16 }}>
      <h1>Home</h1>
      <p>Usuário autenticado: {usuario?.uid}</p>
      <button onClick={sair}>Sair</button>
    </main>
  );
}
