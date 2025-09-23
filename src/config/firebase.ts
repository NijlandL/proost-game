import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDDxMWXrMKpuiPkuWC0Gfux0WxTqe5l1Jw",
  authDomain: "proost-game.firebaseapp.com",
  databaseURL: "https://proost-game-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "proost-game",
  storageBucket: "proost-game.firebasestorage.app",
  messagingSenderId: "250962589823",
  appId: "1:250962589823:web:2d2b1669a215a6961b274a",
  measurementId: "G-3812TC2DRB"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
