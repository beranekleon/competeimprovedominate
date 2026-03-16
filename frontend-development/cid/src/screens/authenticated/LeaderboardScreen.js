import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import userService from "../../services/user.service";

export default function LeaderboardScreen({ navigation }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await userService.getLeaderboard();

        if (Array.isArray(data)) {
          const normalizedData = data.map((item, index) => ({
            id: item.id ?? index + 1,
            name: item.name ?? item.username ?? "Unbekannter Spieler",
            score: Number(item.score ?? item.points ?? 0),
            avatar:
              item.avatar ||
              item.avatarUrl ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }));

          const sortedData = normalizedData.sort((a, b) => b.score - a.score);
          setLeaderboardData(sortedData);
        } else {
          console.error("Leaderboard ist kein Array:", data);
          setLeaderboardData([]);
        }
      } catch (error) {
        console.error("Fehler beim Laden des Leaderboards:", error);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const topThree = useMemo(() => {
    if (leaderboardData.length === 0) return [];
    return [
      leaderboardData[1] || null,
      leaderboardData[0] || null,
      leaderboardData[2] || null,
    ];
  }, [leaderboardData]);

  const restPlayers = useMemo(() => {
    if (leaderboardData.length <= 3) return [];
    return leaderboardData.slice(3);
  }, [leaderboardData]);

  const ScoreBadge = ({ score }) => (
    <View style={styles.scoreBadge}>
      <Text style={styles.scoreIcon} accessible={false} importantForAccessibility="no">🔥</Text>
      <Text style={styles.scoreBadgeText}>{score}</Text>
    </View>
  );

  const PodiumCard = ({ player, place, style }) => {
    if (!player) return <View style={[styles.podiumWrapper, style]} />;

    return (
      <View style={[styles.podiumWrapper, style]}>
        <Image
          source={{ uri: player.avatar }}
          style={styles.topAvatar}
          accessibilityRole="image"
          accessibilityLabel={`Avatar von ${player.name}`}
        />
        <Text style={styles.topName} numberOfLines={1}>
          {player.name}
        </Text>

        <ScoreBadge score={player.score} />

        <View
          style={[
            styles.podiumBlock,
            place === 1 && styles.firstBlock,
            place === 2 && styles.secondBlock,
            place === 3 && styles.thirdBlock,
          ]}
        >
          <Text style={styles.placeText}>{place}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#222" />
        <Text style={styles.loadingText}>Leaderboard wird geladen...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.yellowSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Zurück zum Profil"
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Leaderboard</Text>

          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.endsText}>Aktive Spieler</Text>

        <View style={styles.podiumRow}>
          <PodiumCard
            player={topThree[0]}
            place={2}
            style={styles.secondPlace}
          />
          <PodiumCard
            player={topThree[1]}
            place={1}
            style={styles.firstPlace}
          />
          <PodiumCard
            player={topThree[2]}
            place={3}
            style={styles.thirdPlace}
          />
        </View>
      </View>

      <View style={styles.listSection}>
        <FlatList
          data={restPlayers}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Noch keine weiteren Spieler.</Text>
          }
          renderItem={({ item, index }) => (
            <View style={styles.listRow}>
              <Text style={styles.rankNumber}>{index + 4}</Text>

              <View style={styles.userInfo}>
                <Image
                  source={{ uri: item.avatar }}
                  style={styles.listAvatar}
                  accessibilityRole="image"
                  accessibilityLabel={`Avatar von ${item.name}`}
                />
                <Text style={styles.listName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>

              <ScoreBadge score={item.score} />
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#222",
  },
  yellowSection: {
    backgroundColor: "#FFD600",
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f1f1f",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f1f1f",
  },
  headerSpacer: {
    width: 40,
  },
  endsText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 20,
    textAlign: "left",
  },
  podiumRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 10,
  },
  podiumWrapper: {
    alignItems: "center",
    flex: 1,
  },
  firstPlace: {
    marginHorizontal: 8,
  },
  secondPlace: {
    marginRight: 4,
  },
  thirdPlace: {
    marginLeft: 4,
  },
  topAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: "#fff7a8",
  },
  topName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f1f1f",
    marginBottom: 8,
    maxWidth: 100,
    textAlign: "center",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5f5f5f",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginBottom: 10,
  },
  scoreIcon: {
    marginRight: 6,
    fontSize: 14,
  },
  scoreBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  podiumBlock: {
    width: 95,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#ffe95a",
  },
  firstBlock: {
    height: 170,
    backgroundColor: "#ffd000",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  secondBlock: {
    height: 130,
    backgroundColor: "#ffe348",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  thirdBlock: {
    height: 110,
    backgroundColor: "#ffde33",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  placeText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 10,
  },
  listSection: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    marginTop: 8,
    paddingHorizontal: 18,
    paddingTop: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  listContent: {
    paddingBottom: 30,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  rankNumber: {
    width: 30,
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    marginRight: 10,
  },
  listAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  listName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    flexShrink: 1,
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 30,
  },
});