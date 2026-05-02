import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface FeatureButtonProps {
  label: string;
  iconName: keyof typeof Feather.glyphMap;
  statusText: string;
  statusOk: boolean;
  onPress: () => void;
  accentColor?: string;
}

export function FeatureButton({ label, iconName, statusText, statusOk, onPress, accentColor }: FeatureButtonProps) {
  const colors = useColors();
  const accent = accentColor || colors.primary;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, { backgroundColor: accent + "22" }]}>
        <Feather name={iconName} size={20} color={accent} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.status, { color: statusOk ? colors.primary : colors.mutedForeground }]}>
          {statusOk ? "✓ " : "✗ "}{statusText}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  status: {
    fontSize: 12,
  },
});
