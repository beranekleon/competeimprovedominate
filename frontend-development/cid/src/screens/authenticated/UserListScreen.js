import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import userListService from "../../services/userList.service";
import TaskBar from "../../components/TaskBar";
import { UserListScreenStyles } from "../../styles";

export default function UserListScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const usersResponse = await userListService.getUsers();
      setUsers(usersResponse);
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
    <View style={UserListScreenStyles.card}>
      <Text style={UserListScreenStyles.name}>{item.email}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={UserListScreenStyles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={UserListScreenStyles.safeArea} edges={["top", "left", "right"]}>
      <View style={UserListScreenStyles.container}>
        <Text style={UserListScreenStyles.title}>User List</Text>

        <FlatList
          data={users}
          keyExtractor={(item) => item.email}
          renderItem={renderUser}
        />
      </View>

      <TaskBar
        onLeftPress={() => navigation.navigate("Users")}
        leftButtonText="Friends"
        leftButtonVisible={true}
        onCenterPress={() => navigation.navigate("Dashboard")}
        centerButtonText="Map"
        centerButtonActive={false}
        onRightPress={() => navigation.navigate("Profile")}
        rightButtonVisible={true}
        loading={loading}
      />
    </SafeAreaView>
  );
}
