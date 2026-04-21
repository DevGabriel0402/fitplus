import { initializeFirestore } from "firebase/firestore";
import { app } from "./app";

// Force long-polling to resolve ERR_QUIC_PROTOCOL_ERROR
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false
});
