import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function logColor(line: string, primary: string, muted: string, red: string, accent: string): string {
  if (line.includes("[✓]") || line.includes("complete") || line.includes("finished")) return primary;
  if (line.includes("[!]") || line.includes("error") || line.includes("Error")) return red;
  if (line.includes("[~]") || line.includes("Scroll") || line.includes("Waiting")) return accent;
  if (line.includes("⚡") || line.includes("started") || line.includes("starting")) return "#FF6B35";
  if (line.includes("[→]") || line.includes("Clicking")) return "#9C27B0";
  if (line.includes("[■]")) return red;
  return muted;
}

export default function LogScreen() {
  const { state, clearLogs, stopSimulation } = useApp();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (state.logs.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [state.logs.length]);

  const renderItem = ({ item }: { item: string }) => (
    <Text
      style={[
        styles.line,
        { color: logColor(item, colors.primary, colors.mutedForeground, colors.destructive, colors.accent) },
      ]}
    >
      {item}
    </Text>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Status bar */}
      <View style={[styles.bar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.statRow}>
          <View style={[styles.dot, { backgroundColor: state.is_running ? colors.primary : colors.border }]} />
          <Text style={[styles.statText, { color: state.is_running ? colors.primary : colors.mutedForeground }]}>
            {state.is_running ? "RUNNING" : "IDLE"}
          </Text>
        </View>

        {state.is_running && (
          <View style={styles.statRow}>
            <Feather name="cpu" size={12} color={colors.accent} />
            <Text style={[styles.statText, { color: colors.accent }]}>
              {state.active_sessions} active · {state.left_sessions} queued
            </Text>
          </View>
        )}

        <View style={styles.rightBtns}>
          {state.is_running && (
            <TouchableOpacity
              onPress={stopSimulation}
              style={[styles.stopBtn, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive }]}
            >
              <Feather name="square" size={12} color={colors.destructive} />
              <Text style={[styles.stopText, { color: colors.destructive }]}>Stop</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={clearLogs}
            style={[styles.iconBtn, { borderColor: colors.border }]}
          >
            <Feather name="trash-2" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Log list */}
      {state.logs.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="terminal" size={44} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No logs yet</Text>
          <Text style={[styles.emptyHint, { color: colors.border }]}>
            Configure your URLs in the Config tab and press START
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={state.logs}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { fontSize: 12, fontWeight: "600" },
  rightBtns: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 8 },
  stopBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  stopText: { fontSize: 12, fontWeight: "700" },
  iconBtn: { padding: 6, borderRadius: 6, borderWidth: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 16, fontWeight: "600" },
  emptyHint: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 14, paddingTop: 10 },
  line: { fontSize: 11, fontFamily: "monospace", lineHeight: 18, marginBottom: 2 },
});
