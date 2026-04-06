import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import userService from "../../services/user.service";
import TaskBar from "../../components/TaskBar";
import { CommonStyles, FriendsScreenStyles } from "../../styles";

export default function FriendsScreen({ navigation }) {
  const { userEmail } = useAuth();
  const { showToast } = useToast();

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendInput, setFriendInput] = useState("");

  const inviteCode = encodeURIComponent(userEmail || "");
  const shareLink = `cid://add?code=${inviteCode}`;

  const parseFriendInput = (value) => {
    if (!value) return null;

    let trimmed = value.trim();

    // Handle URLs like ...?code=... or ...?friendEmail=...
    const match = trimmed.match(/[?&](?:code|friendEmail)=([^&]+)/i);
    if (match && match[1]) {
      trimmed = match[1];
    }

    try {
      trimmed = decodeURIComponent(trimmed);
    } catch {
      // ignore
    }

    return trimmed;
  };

  const isValidEmail = (value) => {
    return /\S+@\S+\.\S+/.test(value);
  };

  const fetchFriends = async () => {
    if (!userEmail) {
      setFriends([]);
      setLoading(false);
      showToast({
        message: 'Benutzer nicht gefunden. Bitte einloggen, um Freunde zu sehen.',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await userService.getFriends(userEmail);
      setFriends(response?.friends || []);
    } catch (error) {
      showToast({
        message: error?.message || 'Freunde konnten nicht geladen werden.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [userEmail]);

  const handleAddFriend = async () => {
    if (!userEmail) {
      showToast({ message: 'Bitte melde dich zuerst an.', type: 'error' });
      return;
    }

    const candidate = parseFriendInput(friendInput);
    if (!candidate || !isValidEmail(candidate)) {
      showToast({ message: 'Bitte gültige E-Mail oder Code eingeben.', type: 'error' });
      return;
    }

    setAddingFriend(true);
    try {
      await userService.addFriend(userEmail, candidate);
      showToast({ message: 'Freund hinzugefügt.', type: 'success' });
      setFriendInput('');
      await fetchFriends();
    } catch (error) {
      showToast({
        message: error?.message || 'Freund konnte nicht hinzugefügt werden.',
        type: 'error',
      });
    } finally {
      setAddingFriend(false);
    }
  };

  const renderFriend = ({ item }) => (
    <View style={FriendsScreenStyles.card}>
      <Text style={FriendsScreenStyles.name}>{item.displayName || item.email}</Text>
      {item.email ? <Text style={FriendsScreenStyles.subtitle}>{item.email}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <View style={FriendsScreenStyles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={FriendsScreenStyles.safeArea} edges={["top", "left", "right"]}>
      <View style={FriendsScreenStyles.container}>
        <Text style={FriendsScreenStyles.title}>Freunde</Text>

        <Text style={FriendsScreenStyles.sectionLabel}>Einladungs-Code</Text>
        <Text selectable style={FriendsScreenStyles.codeBox}>
          {inviteCode}
        </Text>
        <Text selectable style={[FriendsScreenStyles.codeBox, { marginBottom: 8 }]}> 
          {shareLink}
        </Text>
        <Text style={FriendsScreenStyles.infoText}>
          Teile den Code oder Link mit einem Freund. Er kann ihn hier einfügen (auch als Link mit „code=...“).
        </Text>

        <TextInput
          style={CommonStyles.input}
          placeholder="E-Mail oder Code eingeben"
          value={friendInput}
          onChangeText={setFriendInput}
          editable={!addingFriend}
          accessibilityLabel="E-Mail oder Einladungscode"
        />
        <TouchableOpacity
          style={CommonStyles.buttonPrimary}
          onPress={handleAddFriend}
          disabled={addingFriend}
          accessibilityRole="button"
          accessibilityLabel="Freund hinzufügen"
        >
          {addingFriend ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={CommonStyles.buttonText}>Freund hinzufügen</Text>
          )}
        </TouchableOpacity>

        <Text style={FriendsScreenStyles.sectionLabel}>Aktuelle Freunde</Text>
        {friends.length === 0 ? (
          <Text style={FriendsScreenStyles.infoText}>Du hast noch keine Freunde hinzugefügt.</Text>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id || item.email}
            renderItem={renderFriend}
          />
        )}
      </View>

      <TaskBar
        onLeftPress={() => navigation.navigate("Friends")}
        leftButtonText="Friends"
        leftButtonVisible={true}
        onCenterPress={() => navigation.navigate("Dashboard")}
        centerButtonText="Map"
        centerButtonActive={false}
        rightButtonVisible={true}
        loading={loading || addingFriend}
      />
    </SafeAreaView>
  );
}
