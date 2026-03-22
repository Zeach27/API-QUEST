import Colors from "@/constants/colors";
import { destinations } from "@/constants/destinations";
import {
  getFavorites,
  subscribeFavorites,
  toggleFavorite,
} from "@/utils/favoriteStore";
import { getDistance, formatDistance, getRoadDistance } from "@/utils/location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
const { width } = Dimensions.get("window");

export default function DestinationDetailScreen() {
  const { id, name, fullName, lat, lon, type } = useLocalSearchParams<{
    id: string;
    name?: string;
    fullName?: string;
    lat?: string;
    lon?: string;
    type?: string;
  }>();

  const destination = destinations.find((d) => d.id === id);

  // allow using search results from Nominatim in place of static preset data
  const searchDestination = {
    id: id ?? "",
    name: name ?? fullName?.split(",")[0] ?? "Unknown place",
    location: fullName ?? "Unknown location",
    rating: destination?.rating ?? 4.5,
    image:
      destination?.image ??
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500",
    description:
      destination?.description ??
      "Place information loaded from search results. Explore nearby attractions for more details.",
    price: destination?.price ?? 0,
    images: destination?.images ?? [],
    guide: destination?.guide,
    guideImage: destination?.guideImage,
    amenities: destination?.amenities ?? {
      hotel: false,
      flight: false,
      transport: false,
      food: false,
    },
    lat: Number(lat) || destination?.lat,
    lon: Number(lon) || destination?.lon,
    type: type ?? (destination ? "static" : "search"),
  };

  const [weather, setWeather] = useState<{
    temperature?: number;
    windspeed?: number;
    description?: string;
  }>({});
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "checking" | "granted" | "denied"
  >("checking");

  const currentDestination = destination ?? (searchDestination as Destination);
  const [isFavoriteState, setIsFavoriteState] = useState<boolean>(false);

  useEffect(() => {
    const updateFavorite = (favs: Destination[]) => {
      setIsFavoriteState(favs.some((f) => f.id === currentDestination.id));
    };

    updateFavorite(getFavorites());
    const unsubscribe = subscribeFavorites(updateFavorite);

    return () => unsubscribe();
  }, [currentDestination.id]);

  const handleToggleFavorite = () => {
    toggleFavorite(currentDestination);
  };

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationStatus("denied");
          return;
        }

        setLocationStatus("granted");
        // Get last known position first for faster results
        const lastKnown = await Location.getLastKnownPositionAsync({});
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const currentPos = position || lastKnown;
        if (!currentPos) return;

        const userLat = currentPos.coords.latitude;
        const userLon = currentPos.coords.longitude;

        if (currentDestination?.lat != null && currentDestination?.lon != null) {
          // First try road distance
          const roadDist = await getRoadDistance(
            userLat,
            userLon,
            currentDestination.lat,
            currentDestination.lon,
          );

          if (roadDist !== null) {
            setDistanceKm(roadDist);
          } else {
            // Fallback to straight-line distance
            setDistanceKm(
              getDistance(
                userLat,
                userLon,
                currentDestination.lat,
                currentDestination.lon,
              ),
            );
          }
        }
      } catch (err) {
        console.warn(err);
        setLocationStatus("denied");
      }
    };

    fetchUserLocation();

    const fetchWeather = async () => {
      if (!currentDestination?.lat || !currentDestination?.lon) {
        setWeatherError("Coordinates not available for weather.");
        return;
      }

      setWeatherLoading(true);
      setWeatherError(null);

      try {
        // Switching to Open-Meteo (free, no API key required, reliable)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${currentDestination.lat}&longitude=${currentDestination.lon}&current=temperature_2m,wind_speed_10m,weather_code`
        );

        if (!response.ok) {
          throw new Error(`Weather API error ${response.status}`);
        }

        const data = await response.json();

        if (!data.current) {
          throw new Error("Weather data not found");
        }

        // Mapping weather codes to descriptions (Simplified)
        const getWeatherDescription = (code: number) => {
          if (code === 0) return "Clear sky";
          if (code <= 3) return "Mainly clear / Partly cloudy";
          if (code <= 48) return "Foggy";
          if (code <= 67) return "Rainy";
          if (code <= 77) return "Snowy";
          if (code <= 82) return "Rain showers";
          return "Thunderstorm";
        };

        setWeather({
          temperature: data.current.temperature_2m,
          windspeed: data.current.wind_speed_10m,
          description: getWeatherDescription(data.current.weather_code),
        });
      } catch (e: any) {
        setWeatherError(e?.message ?? "Unable to load weather.");
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [currentDestination.lat, currentDestination.lon]);

  if (!currentDestination || !id) {
    return (
      <View style={styles.notFound}>
        <Text>Destination not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <MapView
            style={styles.mainImage}
            initialRegion={{
              latitude: currentDestination.lat ?? 0,
              longitude: currentDestination.lon ?? 0,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            pointerEvents="none"
          >
            <Marker
              coordinate={{
                latitude: currentDestination.lat ?? 0,
                longitude: currentDestination.lon ?? 0,
              }}
              title={currentDestination.name}
              description={currentDestination.location}
            />
          </MapView>
          <TouchableOpacity
            style={styles.favoriteIcon}
            onPress={handleToggleFavorite}
          >
            <MaterialCommunityIcons
              name={isFavoriteState ? "heart" : "heart-outline"}
              size={22}
              color={isFavoriteState ? Colors.primary : "white"}
            />
          </TouchableOpacity>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons
              name="star"
              size={16}
              color={Colors.rating}
            />
            <Text style={styles.ratingText}>{currentDestination.rating}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{currentDestination.name}</Text>
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color={Colors.locationDot}
              />
              <Text style={styles.location}>{currentDestination.location}</Text>
            </View>
          </View>

          {currentDestination.guide && (
            <View style={styles.guideContainer}>
              <View style={styles.guideInfo}>
                <Image
                  source={{ uri: currentDestination.guideImage }}
                  style={styles.guideImage}
                  contentFit="cover"
                />
                <View>
                  <Text style={styles.guideName}>
                    {currentDestination.guide}
                  </Text>
                  <Text style={styles.guideTitle}>Tour Guide</Text>
                </View>
              </View>
              <View style={styles.guideActions}>
                <TouchableOpacity style={styles.guideActionButton}>
                  <MaterialCommunityIcons
                    name="message-text"
                    size={20}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.guideActionButton}>
                  <MaterialCommunityIcons
                    name="phone"
                    size={20}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {currentDestination.description}
            </Text>
          </View>

          {currentDestination.images.length > 0 && (
            <View style={styles.gallerySection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {currentDestination.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.galleryImage}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Weather</Text>
            {weatherLoading ? (
              <Text style={styles.description}>Loading weather...</Text>
            ) : weatherError ? (
              <Text style={styles.description}>{weatherError}</Text>
            ) : (
              <View style={styles.weatherCard}>
                <View style={styles.weatherMainRow}>
                  <MaterialCommunityIcons
                    name="weather-partly-cloudy"
                    size={36}
                    color={Colors.primary}
                  />
                  <View style={styles.weatherMainText}>
                    <Text style={styles.weatherTitle}>
                      {weather.description ?? "No data"}
                    </Text>
                    <Text style={styles.weatherSubText}>
                      {currentDestination.location}
                    </Text>
                  </View>
                  <Text style={styles.weatherTemp}>
                    {weather.temperature?.toFixed(1) ?? "-"}°C
                  </Text>
                </View>

                <View style={styles.weatherStatsRow}>
                  <View style={styles.weatherStat}>
                    <MaterialCommunityIcons
                      name="thermometer"
                      size={18}
                      color={Colors.text}
                    />
                    <Text style={styles.weatherStatText}>
                      {weather.temperature?.toFixed(1) ?? "-"}°C
                    </Text>
                  </View>
                  <View style={styles.weatherStat}>
                    <MaterialCommunityIcons
                      name="weather-windy"
                      size={18}
                      color={Colors.text}
                    />
                    <Text style={styles.weatherStatText}>
                      {weather.windspeed?.toFixed(1) ?? "-"} km/h
                    </Text>
                  </View>
                  {distanceKm != null && (
                    <View style={styles.weatherStat}>
                      <MaterialCommunityIcons
                        name="map-marker-distance"
                        size={18}
                        color={Colors.text}
                      />
                      <Text style={styles.weatherStatText}>
                        {distanceKm.toFixed(1)} km
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distance from you</Text>
            <View style={styles.distanceCard}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={18}
                color={Colors.primary}
              />
              <Text style={styles.distanceText}>
                {distanceKm != null
                  ? `${distanceKm.toFixed(1)} km`
                  : locationStatus === "checking"
                    ? "Detecting location..."
                    : locationStatus === "denied"
                      ? "Location permission denied"
                      : "Location not available"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    transform: [{ translateX: -30 }, { translateY: -30 }],
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 18,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: Colors.background,
    marginLeft: 5,
  },
  favoriteIcon: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  ratingContainer: {
    position: "absolute",
    top: 60,
    right: 60,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  guideContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  guideInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  guideImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  guideName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  guideTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  guideActions: {
    flexDirection: "row",
  },
  guideActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  gallerySection: {
    marginBottom: 24,
  },
  galleryImage: {
    width: width / 3 - 16,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  weatherCard: {
    borderRadius: 16,
    backgroundColor: Colors.backgroundAlt,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  weatherMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  weatherMainText: {
    flex: 1,
    marginLeft: 12,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  weatherSubText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  weatherTemp: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },
  weatherStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weatherStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherStatText: {
    marginLeft: 6,
    color: Colors.text,
    fontSize: 12,
  },
  weatherText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  amenitiesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  distanceCard: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundAlt,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  distanceText: {
    marginLeft: 10,
    fontSize: 15,
    color: Colors.text,
    fontWeight: "600",
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  perPerson: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: {
    width: "100%",
    height: 160,
  },
  mapExpanded: {
    width: "100%",
    height: 360,
  },
  mapHintContainer: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  mapHintText: {
    color: "#fff",
    fontSize: 12,
  },
  bookButton: {
    width: 150,
  },
});
