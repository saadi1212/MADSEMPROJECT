import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getAllBookings = async () => {
  const snap = await getDocs(collection(db, "bookings"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateBookingStatus = async (id, status) => {
  await updateDoc(doc(db, "bookings", id), { status });
};