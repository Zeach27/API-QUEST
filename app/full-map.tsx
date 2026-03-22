import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function FullMapScreen() {
  const router = useRouter();
  const { lat, lon, name } = useLocalSearchParams();

  const destinationLat = Number(Array.isArray(lat) ? lat[0] : lat);
  const destinationLon = Number(Array.isArray(lon) ? lon[0] : lon);
  const destinationName = Array.isArray(name) ? name[0] : name;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: destinationLat,
          longitude: destinationLon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude: destinationLat, longitude: destinationLon }}
          title={destinationName}
        />
      </MapView>

      <SafeAreaView style={styles.overlay}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{destinationName}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  overlay: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backText: { fontSize: 24, color: '#1d2a6a', fontWeight: '800' },
  titleContainer: {
    flex: 1,
    marginLeft: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: '800', color: '#1d2a6a' },
});
