import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { auth } from "../config/firebaseConfig";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      auth.currentUser
        ? navigation.replace("Home")
        : navigation.replace("Login");
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photographer Booking App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" }
});
