import React from "react";
import { View, Text, Button } from "react-native";

export default function PhotographerDashboard({ navigation }) {
  return (
    <View style={{ padding: 20 }}>
      <Text>Photographer Dashboard</Text>
      <Button title="View Booking Requests" onPress={() => navigation.navigate("Requests")} />
      <Button title="My Portfolio" onPress={() => navigation.navigate("Portfolio")} />
    </View>
  );
}
