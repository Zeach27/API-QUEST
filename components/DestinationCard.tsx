import Colors from "@/constants/colors";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DestinationCardProps {
  id: string;
  name: string;
  location: string;
  rating: number;
  image: string;
  distance?: number;
  isLarge?: boolean;
  isCompact?: boolean;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
}

const DestinationCard = ({
  id,
  name,
  location,
  rating,
  image,
  distance,
  isLarge = false,
  isCompact = false,
  isFavorite = false,
  onPress,
  onFavoriteToggle,
}: DestinationCardProps) => {
  // Create card content as a separate component to reuse in both implementations
  const CardContent = () => {
    if (isCompact) {
      return (
        <View style={styles.compactContent}>
          <View style={styles.compactTopRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={Colors.locationDot}
            />
            <Text style={styles.compactLocationText} numberOfLines={1}>
              {location}
            </Text>
          </View>
          <Text style={styles.compactName} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.compactBottomRow}>
            <MaterialCommunityIcons
              name="star"
              size={12}
              color={Colors.rating}
            />
            <Text style={styles.compactRatingText}>{rating.toFixed(1)}</Text>
            {distance != null && (
              <Text style={styles.compactDistanceText}>
                {distance.toFixed(1)} km
              </Text>
            )}
          </View>
        </View>
      );
    }

    return (
      <>
        <View
          style={[styles.imageContainer, isLarge && styles.largeImageContainer]}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <MaterialCommunityIcons
                name="map-marker"
                size={24}
                color="white"
              />
            </View>
          )}
          {onFavoriteToggle ? (
            <TouchableOpacity
              style={styles.favoriteIcon}
              onPress={onFavoriteToggle}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? Colors.primary : "white"}
              />
            </TouchableOpacity>
          ) : null}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={Colors.rating} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.locationContainer}>
            {" "}
            <Ionicons
              name="location-outline"
              size={12}
              color={Colors.locationDot}
            />
            <Text style={styles.location} numberOfLines={1}>
              {location}
            </Text>
          </View>
        </View>
        {isLarge && (
          <View style={styles.arrowContainer}>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={Colors.primary}
            />
          </View>
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, isLarge && styles.largeContainer]}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <CardContent />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    width: Dimensions.get("window").width * 0.7,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    display: "flex", // Needed for web
  },
  largeContainer: { 
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 0,
  },
  imageContainer: {
    width: "100%",
    height: 150,
    position: "relative",
    backgroundColor: Colors.backgroundAlt,
  },
  largeImageContainer: {
    height: 80,
    width: 80,
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    backgroundColor: Colors.backgroundAlt,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
  },
  ratingContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  ratingText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  infoContainer: {
    padding: 12,
    backgroundColor: Colors.card, // Thêm màu nền cho phần thông tin
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  imagePlaceholder: {
    backgroundColor: Colors.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowContainer: {
    paddingRight: 16,
  },
  compactContent: {
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    width: "100%",
    marginBottom: 12,
  },
  compactTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  compactLocationText: {
    marginLeft: 4,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  compactName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  compactBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compactRatingText: {
    marginLeft: 4,
    fontSize: 12,
    color: Colors.text,
  },
  compactDistanceText: {
    marginLeft: 12,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default DestinationCard;
