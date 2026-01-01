import React, { useEffect, useState } from "react";
import { FlatList, Text } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

export default function MyBookingsScreen() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "bookings"), where("userId", "==", auth.currentUser.uid));
    getDocs(q).then(snap =>
      setData(snap.docs.map(d => d.data()))
    );
  }, []);

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <Text>{item.photographerName} - {item.status}</Text>
      )}
    />
  );
}
