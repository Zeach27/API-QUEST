import { Link } from "expo-router";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1000",
        }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        {/* Top / Middle content */}
        <View style={styles.heroOverlay}>
          <Text style={styles.title}>TripSpot</Text>
          <Text style={styles.subtitle}>
            Discover exciting destinations and plan your next adventure.
          </Text>
        </View>

        {/* Bottom button */}
        <View style={styles.bottomButton}>
          <Link href="/explore" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Find your Destination</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f8ff" },
  hero: {
    flex: 1,
    justifyContent: "space-between", // keeps button at bottom
  },
  heroImage: {
    borderRadius: 0,
  },
  heroOverlay: {
    paddingHorizontal: 24,
    paddingTop: 100, // moves title/subtitle down
    alignItems: "flex-start", // aligns content to the left
  },
  bottomButton: {
    paddingHorizontal: 24,
    paddingBottom: 40, // space from bottom
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "left", // left aligned
  },
  subtitle: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "left", // left aligned
  },
  button: {
    backgroundColor: "#5a6be9",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 7,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
});
