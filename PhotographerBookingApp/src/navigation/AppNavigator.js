import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import PhotographerListScreen from "../screens/PhotographerListScreen";
import PhotographerProfileScreen from "../screens/PhotographerProfileScreen";
import BookingScreen from "../screens/BookingScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";
import PhotographerDashboard from "../screens/PhotographerDashboard";
import BookingRequestsScreen from "../screens/BookingRequestsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Photographers" component={PhotographerListScreen} />
        <Stack.Screen name="Profile" component={PhotographerProfileScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        <Stack.Screen name="Dashboard" component={PhotographerDashboard} />
        <Stack.Screen name="Requests" component={BookingRequestsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
