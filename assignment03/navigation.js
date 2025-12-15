
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, StyleSheet } from "react-native";

// ===== Screens =====
function SplashScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Photographer Booking App</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}> 
        <Text style={styles.button}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} />
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("HomeTabs")}> 
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}> 
        <Text style={styles.link}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

function SignupScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>
      <TextInput placeholder="Name" style={styles.input} />
      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} />
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("Login")}> 
        <Text style={styles.btnText}>Signup</Text>
      </TouchableOpacity>
    </View>
  );
}

function HomeScreen({ navigation }) {
  const photographers = [
    { id: "1", name: "Ali Studio", price: "12000", img: "https://via.placeholder.com/150" },
    { id: "2", name: "LensCraft", price: "15000", img: "https://via.placeholder.com/150" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photographers</Text>
      <FlatList
        data={photographers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Profile", item)}>
            <Image source={{ uri: item.img }} style={styles.cardImg} />
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>Starting from: Rs {item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function PhotographerProfileScreen({ route, navigation }) {
  const { name, price, img } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: img }} style={styles.profileImg} />
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.sub}>Price: Rs {price}</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("Booking")}> 
        <Text style={styles.btnText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
}

function BookingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Photographer</Text>
      <TextInput placeholder="Select Date" style={styles.input} />
      <TextInput placeholder="Select Time" style={styles.input} />
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("MyBookings")}> 
        <Text style={styles.btnText}>Confirm Booking</Text>
      </TouchableOpacity>
    </View>
  );
}

function MyBookingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <Text>No bookings yet.</Text>
    </View>
  );
}

// ==== Photographer Screens ====
function PhotographerDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photographer Dashboard</Text>
      <Text>Pending Bookings: 0</Text>
    </View>
  );
}

function PortfolioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Portfolio</Text>
      <Text>Feature coming soon...</Text>
    </View>
  );
}

function BookingRequestsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Requests</Text>
      <Text>No new requests.</Text>
    </View>
  );
}

// ===== Navigation Setup =====
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: "Bookings" }} />
      <Tab.Screen name="Dashboard" component={PhotographerDashboard} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen name="Profile" component={PhotographerProfileScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  sub: { fontSize: 16, marginBottom: 10 },
  button: { backgroundColor: "black", color: "white", padding: 12, borderRadius: 8, marginTop: 20 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 10 },
  btn: { backgroundColor: "black", padding: 15, borderRadius: 8, marginTop: 10 },
  btnText: { color: "white", textAlign: "center" },
  link: { marginTop: 10, textAlign: "center" },
  card: { padding: 15, backgroundColor: "#eee", marginBottom: 15, borderRadius: 10 },
  cardImg: { width: "100%", height: 150, borderRadius: 10 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  cardSub: { fontSize: 14, color: "gray" },
  profileImg: { width: "100%", height: 200, borderRadius: 10, marginBottom: 20 },
});
