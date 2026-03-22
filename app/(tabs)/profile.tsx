import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const profileItems = [
    { icon: 'person-outline', label: 'Personal Information' },
    { icon: 'settings-outline', label: 'Settings' },
    { icon: 'notifications-outline', label: 'Notifications' },
    { icon: 'help-circle-outline', label: 'Help Center' },
    { icon: 'log-out-outline', label: 'Log Out', color: '#FF3B30' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Image 
            source={require('@/assets/images/profile.jpg')} 
            style={styles.avatar} 
          />
        </View>
        <Text style={styles.name}>Olivar RRO</Text>
        <Text style={styles.email}>Olivar</Text>
      </View>

      <View style={styles.menuContainer}>
        {profileItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={22} color={item.color || '#1A1A1A'} />
              <Text style={[styles.menuLabel, item.color ? { color: item.color } : {}]}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8ff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 15,
  },
  email: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 5,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    color: '#1A1A1A',
  },
});
