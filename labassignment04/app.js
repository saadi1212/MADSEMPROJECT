import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import MapView, { Marker, Callout, Circle, Polyline } from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      // Ask location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied");
        return;
      }

      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      setLocation({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    })();
  }, []);

  const onMarkerDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    setLocation(newRegion);

    // Animate map to new region
    mapRef.current.animateToRegion(newRegion, 1000);
  };

  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Fetching Location...</Text>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      region={location}
    >
      {/* Marker */}
      <Marker
        coordinate={location}
        draggable
        onDragEnd={onMarkerDragEnd}
      >
        <Callout>
          <View>
            <Text>Name: saad</Text>
            <Text>Reg No: sp23-bse-048</Text>
          </View>
        </Callout>
      </Marker>

      {/* Circle with 50m radius */}
      <Circle
        center={location}
        radius={50}
        strokeColor="blue"
        fillColor="rgba(0,0,255,0.2)"
      />

      {/* Line from center */}
      <Polyline
        coordinates={[
          location,
          {
            latitude: location.latitude + 0.0003,
            longitude: location.longitude,
          },
        ]}
        strokeColor="red"
        strokeWidth={2}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
