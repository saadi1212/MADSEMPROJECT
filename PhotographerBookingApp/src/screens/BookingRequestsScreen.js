import React, { useEffect, useState } from "react";
import { FlatList, Text, Button, View } from "react-native";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export default function BookingRequestsScreen() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getDocs(collection(db, "bookings")).then(snap =>
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const updateStatus = (id, status) => {
    updateDoc(doc(db, "bookings", id), { status });
  };

  return (
    <FlatList
      data={data}
      keyExtractor={i => i.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.photographerName}</Text>
          <Button title="Accept" onPress={() => updateStatus(item.id, "Accepted")} />
          <Button title="Reject" onPress={() => updateStatus(item.id, "Rejected")} />
        </View>
      )}
    />
  );
}
