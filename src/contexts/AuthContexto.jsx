import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [perfilCompelto, setPerfilCompleto] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);

        // Buscar dados do perfil no Firestore
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            setPerfilCompleto(userDoc.data().setupCompleto || false);
          } else {
            setPerfilCompleto(false);
          }
        } catch (error) {
          console.error("Erro ao carregar perfil:", error);
          setPerfilCompleto(false);
        }
      } else {
        setUsuario(null);
        setPerfilCompleto(false);
      }
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    usuario,
    carregando,
    perfilCompelto,
    setPerfilCompleto
  };

  return (
    <AuthContext.Provider value={value}>
      {!carregando && children}
    </AuthContext.Provider>
  );
};
