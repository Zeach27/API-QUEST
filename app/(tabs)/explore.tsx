import CategoryChip from "@/components/CategoryChip";
import DestinationCard from "@/components/DestinationCard";
import SearchBar from "@/components/SearchBar";
import Colors from "@/constants/colors";
import {
  Destination,
  destinations
} from "@/constants/destinations";
import { getDistance } from "@/utils/location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.5; // Stop at the middle
const MAX_TRANSLATE_Y = -SHEET_MAX_HEIGHT + 140; // 140 is the initial visible height
const MIN_TRANSLATE_Y = 0;

type NominatimPlace = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
};

export default function ExploreScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveResults, setLiveResults] = useState<NominatimPlace[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [nearbyDestinations, setNearbyDestinations] = useState<Destination[]>(
    destinations.slice(0, 4),
  );
  const [apiNearbyDestinations, setApiNearbyDestinations] = useState<
    Destination[] | null
  >(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  // Bottom Sheet Animation
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      // Clamp between bottom (0) and middle (MAX_TRANSLATE_Y)
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
      translateY.value = Math.min(translateY.value, 0);
    })
    .onEnd(() => {
      if (translateY.value > MAX_TRANSLATE_Y / 2) {
        translateY.value = withSpring(0, { damping: 20 });
      } else {
        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 20 });
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const getImageForNearbyPlace = (
    tags: any,
    name: string,
    location?: string,
  ) => {
    const lowerName = name?.toLowerCase() || "";
    const lowerLocation = location?.toLowerCase() || "";

    if (
      tags?.tourism === "museum" ||
      lowerName.includes("museum") ||
      lowerLocation.includes("museum")
    ) {
      return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=500";
    }

    if (
      tags?.tourism === "beach" ||
      lowerName.includes("beach") ||
      lowerName.includes("bay") ||
      lowerLocation.includes("beach") ||
      lowerLocation.includes("bay")
    ) {
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500";
    }

    if (
      tags?.amenity === "cafe" ||
      lowerName.includes("cafe") ||
      lowerName.includes("coffee")
    ) {
      return "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?q=80&w=500";
    }

    if (tags?.amenity === "restaurant" || lowerName.includes("restaurant")) {
      return "https://images.unsplash.com/photo-1555992336-03a23c5baef7?q=80&w=500";
    }

    if (
      tags?.amenity === "hotel" ||
      lowerName.includes("resort") ||
      lowerLocation.includes("resort") ||
      lowerLocation.includes("hotel")
    ) {
      return "https://images.unsplash.com/photo-1542315193-1a6f3db8230f?q=80&w=500";
    }

    return "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=500";
  };

  const fetchNearbyPlacesFromApi = useCallback(
    async (latitude: number, longitude: number, category?: string) => {
      try {
        let tagFilter = '["tourism"]';
        if (category === "hotels")
          tagFilter = '["tourism"~"hotel|motel|guest_house|hostel|apartment"]';
        else if (category === "restaurant")
          tagFilter = '["amenity"~"restaurant|cafe|fast_food|food_court"]';
        else if (category === "resorts") tagFilter = '["tourism"="resort"]';
        else if (category === "gym") tagFilter = '["leisure"="fitness_centre"]';
        else if (category === "stores") tagFilter = '["shop"]';
        else if (category === "ALL")
          tagFilter = '["tourism"~"hotel|resort|museum|attraction"]';

        const overpassQuery = `
        [out:json][timeout:25];
        (
          node(around:5000,${latitude},${longitude})${tagFilter};
          way(around:5000,${latitude},${longitude})${tagFilter};
        );
        out center 20;
      `;

        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) return;

        const data = await response.json();
        const elements = Array.isArray(data.elements) ? data.elements : [];
        if (elements.length === 0) return;

        const mapped = elements
          .filter(
            (element: any) =>
              (element.lat && element.lon) ||
              (element.center && element.center.lat && element.center.lon),
          )
          .map((element: any, index: number) => {
            const lat = element.lat ?? element.center?.lat;
            const lon = element.lon ?? element.center?.lon;
            const distance = getDistance(latitude, longitude, lat, lon);
            return {
              id: `${element.id}-api-${index}`,
              name:
                element.tags?.name ||
                element.tags?.tourism ||
                element.tags?.amenity ||
                "Nearby place",
              location:
                element.tags?.city ||
                element.tags?.town ||
                element.tags?.village ||
                element.tags?.addr_city ||
                "Nearby",
              rating: 4.3,
              image: getImageForNearbyPlace(
                element.tags,
                element.tags?.name || "Nearby place",
              ),
              description:
                element.tags?.description ||
                element.tags?.name ||
                "Nearby point of interest",
              price: 0,
              images: [
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500",
              ],
              guide: "Nearby API",
              guideImage:
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100",
              lat,
              lon,
              distance,
              amenities: {
                hotel: !!(
                  element.tags?.tourism &&
                  /hotel|motel|guest_house|hostel|resort/.test(
                    element.tags.tourism,
                  )
                ),
                flight: false,
                transport: !!element.tags?.amenity,
                food: !!(
                  element.tags?.amenity &&
                  /restaurant|cafe|fast_food|food_court/.test(
                    element.tags.amenity,
                  )
                ),
              },
            };
          })
          .sort(
            (a: Destination, b: Destination) =>
              (a.distance ?? 0) - (b.distance ?? 0),
          )
          .slice(0, 10);

        if (mapped.length > 0) {
          setApiNearbyDestinations(mapped);
        }
      } catch {
        // API fallback is silent.
      }
    },
    [],
  );

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLocation(position);

        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        const sorted = destinations
          .map((dest) => ({
            ...dest,
            distance: getDistance(
              locationData.latitude,
              locationData.longitude,
              dest.lat ?? 0,
              dest.lon ?? 0,
            ),
          }))
          .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
          .map((d) => ({
            ...d,
            distance: d.distance,
          }));

        setNearbyDestinations(sorted.slice(0, 4));

        await fetchNearbyPlacesFromApi(
          locationData.latitude,
          locationData.longitude,
        );
      } catch {
        // location unavailable
      }
    };

    fetchLocation();
  }, [fetchNearbyPlacesFromApi]);

  useEffect(() => {
    const controller = new AbortController();

    if (!searchQuery.trim()) {
      setLiveResults([]);
      setLiveError(null);
      setLiveLoading(false);
      return;
    }

    setLiveLoading(true);
    setLiveError(null);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchQuery,
          )}&format=json&limit=8&addressdetails=1`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent":
                "API-QUEST/1.0 (https://github.com/yourname/api-quest)",
              Referer: "https://github.com/yourname/api-quest",
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Place API error ${response.status}`);
        }

        const data: NominatimPlace[] = await response.json();
        setLiveResults(data);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setLiveError(err.message || "Unable to load places.");
          setLiveResults([]);
        }
      } finally {
        setLiveLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const onResultPress = (place: NominatimPlace) => {
    router.push({
      pathname: "/details",
      params: {
        id: place.place_id.toString(),
        name: place.display_name.split(",")[0],
        fullName: place.display_name,
        lat: place.lat,
        lon: place.lon,
        type: place.type || "place",
      },
    });
  };

  const onDestinationCardPress = (item: any) => {
    if (item.lat && item.lon) {
      router.push({
        pathname: "/details",
        params: {
          id: item.id,
          name: item.name,
          fullName: `${item.name}, ${item.location}`,
          lat: item.lat.toString(),
          lon: item.lon.toString(),
          type: "static",
        },
      });
    }
  };

  const goToMyLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const [activeCategory, setActiveCategory] = useState("ALL");
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  const categoriesData = [
    { id: "ALL", name: "ALL", icon: "grid-outline" },
    { id: "hotels", name: "Hotels", icon: "bed-outline" },
    { id: "restaurant", name: "Restaurant", icon: "restaurant-outline" },
    { id: "resorts", name: "Resorts", icon: "umbrella-outline" },
    { id: "gym", name: "Gym", icon: "fitness-outline" },
    { id: "stores", name: "Stores", icon: "cart-outline" },
  ];

  const visibleCategories = categoriesData.slice(0, 3);
  const moreCategories = categoriesData.slice(3);

  const displayedNearby =
    apiNearbyDestinations && activeCategory !== "ALL"
      ? apiNearbyDestinations
      : (apiNearbyDestinations ?? nearbyDestinations).filter((dest) => {
          if (activeCategory === "ALL") return true;
          const cat = activeCategory.toLowerCase();
          return (
            dest.name.toLowerCase().includes(cat) ||
            dest.description.toLowerCase().includes(cat) ||
            (dest.amenities as any)?.[cat] === true ||
            (cat === "hotels" && (dest.amenities as any)?.hotel === true) ||
            (cat === "restaurant" && (dest.amenities as any)?.food === true)
          );
        });

  useEffect(() => {
    if (location) {
      fetchNearbyPlacesFromApi(
        location.coords.latitude,
        location.coords.longitude,
        activeCategory,
      );
    }
  }, [activeCategory, location, fetchNearbyPlacesFromApi]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location?.coords.latitude ?? 6.7498,
            longitude: location?.coords.longitude ?? 126.2165,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {displayedNearby.map((item) => (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.lat ?? 0, longitude: item.lon ?? 0 }}
              title={item.name}
              description={item.location}
            />
          ))}
        </MapView>

        {/* Top Overlay - ensure GestureHandlerRootView is parent */}
        <View style={styles.topOverlay}>
          <SearchBar
            placeholder="Search here"
            value={searchQuery}
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />

          {/* Search Results Dropdown */}
          {searchQuery.trim().length > 0 && (
            <View style={styles.searchResultsContainer}>
              {liveLoading ? (
                <View style={styles.searchStatus}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : liveError ? (
                <View style={styles.searchStatus}>
                  <Text style={styles.errorText}>{liveError}</Text>
                </View>
              ) : liveResults.length > 0 ? (
                <FlatList
                  data={liveResults}
                  keyExtractor={(item) => item.place_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.searchResultItem}
                      onPress={() => onResultPress(item)}
                    >
                      <Ionicons
                        name="location-sharp"
                        size={20}
                        color={Colors.textLight}
                      />
                      <View style={styles.searchResultText}>
                        <Text style={styles.searchResultName} numberOfLines={1}>
                          {item.display_name.split(",")[0]}
                        </Text>
                        <Text
                          style={styles.searchResultLocation}
                          numberOfLines={1}
                        >
                          {item.display_name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  style={styles.searchResultsList}
                />
              ) : (
                <View style={styles.searchStatus}>
                  <Text style={styles.hintText}>No results found</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.chipContainer}>
            <FlatList
              data={[
                ...visibleCategories,
                { id: "more", name: "More", icon: "chevron-down-outline" },
              ]}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipList}
              renderItem={({ item }) => (
                <CategoryChip
                  name={item.name}
                  icon={item.icon as any}
                  active={activeCategory === item.id}
                  onPress={() => {
                    if (item.id === "more") {
                      setShowMoreCategories(!showMoreCategories);
                    } else {
                      setActiveCategory(item.id);
                      setShowMoreCategories(false);
                    }
                  }}
                />
              )}
            />
            {showMoreCategories && (
              <View style={styles.moreCategoriesDropdown}>
                {moreCategories.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.dropdownItem,
                      activeCategory === item.id && styles.activeDropdownItem,
                    ]}
                    onPress={() => {
                      setActiveCategory(item.id);
                      setShowMoreCategories(false);
                    }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={
                        activeCategory === item.id
                          ? Colors.primary
                          : Colors.text
                      }
                    />
                    <Text
                      style={[
                        styles.dropdownText,
                        activeCategory === item.id && styles.activeDropdownText,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Floating Action Buttons */}
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={goToMyLocation}>
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={24}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet */}
        <Animated.View style={[styles.bottomSheet, rBottomSheetStyle]}>
          <GestureDetector gesture={gesture}>
            <View style={styles.handleContainer}>
              <View style={styles.line} />
            </View>
          </GestureDetector>
          <View style={styles.bottomSheetContent}>
            <Text style={styles.sheetTitle}>Local vibe</Text>
            <FlatList
              data={displayedNearby}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DestinationCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  location={item.location}
                  rating={item.rating}
                  image=""
                  distance={item.distance}
                  isCompact
                  onPress={() => onDestinationCardPress(item)}
                />
              )}
              contentContainerStyle={styles.nearbyList}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  chipContainer: {
    position: "relative",
    zIndex: 2,
  },
  chipList: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  moreCategoriesDropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 8,
    width: 160,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  activeDropdownItem: {
    backgroundColor: Colors.backgroundAlt,
  },
  dropdownText: {
    marginLeft: 10,
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  activeDropdownText: {
    color: Colors.primary,
    fontWeight: "700",
  },
  searchResultsContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    maxHeight: 400,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: "hidden",
  },
  searchResultsList: {
    width: "100%",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundAlt,
  },
  searchResultText: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  searchResultLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchStatus: {
    padding: 20,
    alignItems: "center",
  },
  hintText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 160, // Above the bottom sheet's collapsed state
    gap: 12,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bottomSheet: {
    height: SCREEN_HEIGHT,
    width: "100%",
    backgroundColor: "#fff",
    position: "absolute",
    top: SCREEN_HEIGHT - 140, // Collapsed height
    borderRadius: 25,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  handleContainer: {
    width: "100%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  nearbyList: {
    paddingBottom: 200,
  },
});
