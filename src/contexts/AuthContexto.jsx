import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [perfilCompelto, setPerfilCompleto] = useState(false);


  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);

        // Escutar dados do perfil no Firestore em tempo real
        const docRef = doc(db, 'usuarios', user.uid);
        unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setDadosUsuario(data);
            setPerfilCompleto(data.setupCompleto || false);
          } else {
            setDadosUsuario(null);
            setPerfilCompleto(false);
          }
          setCarregando(false);
        }, (error) => {
          console.error("Erro ao escutar perfil:", error);
          setCarregando(false);
        });

      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        setUsuario(null);
        setDadosUsuario(null);
        setPerfilCompleto(false);
        setCarregando(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const value = {
    usuario,
    dadosUsuario,
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
