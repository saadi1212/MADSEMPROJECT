import React from "react";
import { View, Button, Text } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Home</Text>
      <Button title="View Photographers" onPress={() => navigation.navigate("Photographers")} />
      <Button title="My Bookings" onPress={() => navigation.navigate("MyBookings")} />
    </View>
  );
}
