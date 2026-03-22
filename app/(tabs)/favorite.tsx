import DestinationCard from "@/components/DestinationCard";
import { Destination } from "@/constants/destinations";
import {
  getFavorites,
  subscribeFavorites,
  toggleFavorite,
} from "@/utils/favoriteStore";
import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function FavoriteScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Destination[]>(getFavorites());

  useEffect(() => {
    const unsubscribe = subscribeFavorites((favs) => {
      setFavorites(favs);
    });

    return () => unsubscribe();
  }, []);

  const onDestinationPress = (item: Destination) => {
    router.push({
      pathname: "/details",
      params: {
        id: item.id,
        name: item.name,
        fullName: `${item.name}, ${item.location}`,
        lat: item.lat?.toString(),
        lon: item.lon?.toString(),
        type: "static",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
      </View>
      {favorites.length === 0 ? (
        <View style={styles.content}>
          <Ionicons name="heart-outline" size={80} color={Colors.textLight} />
          <Text style={styles.emptyText}>
            You haven't added any favorites yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <DestinationCard
              id={item.id}
              name={item.name}
              location={item.location}
              rating={item.rating}
              image=""
              isFavorite
              isCompact
              onPress={() => onDestinationPress(item)}
              onFavoriteToggle={() => {
                toggleFavorite(item);
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f8ff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 24,
  },
});
