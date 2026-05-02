import React, { useCallback, useRef } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SliderRowProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (v: number) => void;
  suffix?: string;
}

export function SliderRow({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  suffix = "%",
}: SliderRowProps) {
  const colors = useColors();
  const trackWidth = useRef(0);
  const currentValue = useRef(value);
  currentValue.current = value;

  const clamp = useCallback(
    (raw: number) => {
      const stepped = Math.round((raw - min) / step) * step + min;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, step]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        if (trackWidth.current === 0) return;
        const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / trackWidth.current));
        const raw = min + pct * (max - min);
        onValueChange(clamp(raw));
      },
      onPanResponderMove: (e) => {
        if (trackWidth.current === 0) return;
        const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / trackWidth.current));
        const raw = min + pct * (max - min);
        onValueChange(clamp(raw));
      },
    })
  ).current;

  const pct = max === min ? 0 : (value - min) / (max - min);
  const displayValue = step < 1 ? value.toFixed(1) : Math.round(value);

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
          <Text style={[styles.val, { color: colors.accent }]}>
            {displayValue}
            {suffix}
          </Text>
        </View>
      ) : null}
      <View
        style={[styles.track, { backgroundColor: colors.border }]}
        onLayout={(e) => {
          trackWidth.current = e.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}
      >
        <View
          style={[styles.fill, { backgroundColor: colors.primary, width: `${pct * 100}%` as `${number}%` }]}
        />
        <View
          style={[
            styles.thumb,
            { backgroundColor: colors.primary, left: `${pct * 100}%` as `${number}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontSize: 13 },
  val: { fontSize: 13, fontWeight: "600" },
  track: {
    height: 4,
    borderRadius: 2,
    position: "relative",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  fill: { height: 4, borderRadius: 2 },
  thumb: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
    top: -7,
  },
});
