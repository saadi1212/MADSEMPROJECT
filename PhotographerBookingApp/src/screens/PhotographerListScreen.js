import React, { useEffect, useState } from "react";
import { FlatList, Text, Button, View } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export default function PhotographerListScreen({ navigation }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    getDocs(collection(db, "photographers")).then(snap =>
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  return (
    <FlatList
      data={data}
      keyExtractor={i => i.id}
      renderItem={({ item }) => (
        <View style={{ padding: 10 }}>
          <Text>{item.name}</Text>
          <Button title="View Profile" onPress={() => navigation.navigate("Profile", item)} />
        </View>
      )}
    />
  );
}
