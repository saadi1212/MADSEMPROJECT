import React from "react";
import { View, Text, Button, Alert } from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

export default function BookingScreen({ route }) {
  const photographer = route.params;

  const book = async () => {
    await addDoc(collection(db, "bookings"), {
      photographerId: photographer.id,
      photographerName: photographer.name,
      userId: auth.currentUser.uid,
      status: "Pending",
    });
    Alert.alert("Booking Confirmed");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Booking: {photographer.name}</Text>
      <Button title="Confirm Booking" onPress={book} />
    </View>
  );
}
