import React from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onSearch?: (text: string) => void;
  onClear?: () => void;
  onFilter?: () => void;
}

const SearchBar = ({
  placeholder = "Search here...",
  value = "",
  onSearch,
  onClear,
  onFilter,
}: SearchBarProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <Ionicons name="location" size={20} color={Colors.primary} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          value={value}
          onChangeText={onSearch}
        />
        <View style={styles.rightIcons}>
          {value.length > 0 && (
            <TouchableOpacity style={styles.iconButton} onPress={onClear}>
              <Ionicons name="close-circle" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="mic" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    width: "100%",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 30,
    paddingHorizontal: 12,
    height: 52,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: Colors.text,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
  },
});

export default SearchBar;
