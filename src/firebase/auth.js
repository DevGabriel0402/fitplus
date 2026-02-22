import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { app } from "./app";

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginComGoogle = () => signInWithPopup(auth, googleProvider);
export const loginComEmail = (email, senha) => signInWithEmailAndPassword(auth, email, senha);
export const cadastroComEmail = (email, senha) => createUserWithEmailAndPassword(auth, email, senha);
export const resetarSenha = (email) => sendPasswordResetEmail(auth, email);
export const deslogar = () => signOut(auth);

