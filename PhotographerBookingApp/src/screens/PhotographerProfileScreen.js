import React from "react";
import { View, Text, Button } from "react-native";

export default function PhotographerProfileScreen({ route, navigation }) {
  const photographer = route.params;

  return (
    <View style={{ padding: 20 }}>
      <Text>Name: {photographer.name}</Text>
      <Text>Experience: {photographer.experience}</Text>
      <Text>Price: {photographer.price}</Text>
      <Button title="Book Now" onPress={() => navigation.navigate("Booking", photographer)} />
    </View>
  );
}
