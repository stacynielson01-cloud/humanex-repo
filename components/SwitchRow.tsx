import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SwitchRowProps {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  description?: string;
}

export function SwitchRow({ label, value, onValueChange, description }: SwitchRowProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textWrap}>
          <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
          {description ? (
            <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
          ) : null}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.primaryForeground}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  textWrap: { flex: 1 },
  label: { fontSize: 13, fontWeight: "500" },
  description: { fontSize: 11, marginTop: 2 },
});
