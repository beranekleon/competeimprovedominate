import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import api from "../../services/api";

export default function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users"); // backend endpoint
      setUsers(res.data || []);
    } catch (err) {
      console.log("User fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.email}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User List</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.email}
        renderItem={renderUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10
  },
  name: { fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" }
});