import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface CategoryChipProps {
  name: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active?: boolean;
}

const CategoryChip = ({ name, icon, onPress, active }: CategoryChipProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, active && styles.activeContainer]}
      onPress={onPress}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={active ? "#fff" : Colors.text}
          style={styles.icon}
        />
      )}
      <Text style={[styles.name, active && styles.activeName]}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeContainer: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  icon: {
    marginRight: 6,
  },
  name: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  activeName: {
    color: "#fff",
  },
});

export default CategoryChip;
