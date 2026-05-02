import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FormField } from "@/components/FormField";
import { SectionCard } from "@/components/SectionCard";
import { SliderRow } from "@/components/SliderRow";
import { SwitchRow } from "@/components/SwitchRow";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const REFERRAL_SOURCES = ["Google", "Facebook", "YouTube", "Yahoo", "Bing", "Direct"];
const BROWSER_BEHAVIORS = ["Quit after process", "Stay alive after process"];

export default function ConfigScreen() {
  const { state, updateState, saveSettings, startSimulation, stopSimulation } = useApp();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isRunning = state.is_running;

  const handleStart = () => {
    const urls = state.urls.split("\n").map((u) => u.trim()).filter((u) => u.startsWith("http"));
    if (!state.enable_keyword_search && urls.length === 0) {
      Alert.alert("No URLs", "Enter at least one URL starting with http");
      return;
    }
    const a = parseInt(state.android_percent, 10) || 0;
    const d = parseInt(state.desktop_percent, 10) || 0;
    const i = parseInt(state.ios_percent, 10) || 0;
    if (a + d + i !== 100) {
      Alert.alert("Device %", "Android + Desktop + iOS must equal 100%");
      return;
    }
    startSimulation();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.appName, { color: colors.primary }]}>HUMANEX</Text>
          <Text style={[styles.subtitle, { color: colors.accent }]}>
            Human Based Traffic Simulator v4.0
          </Text>
        </View>
        <TouchableOpacity
          onPress={async () => {
            await saveSettings();
            Alert.alert("Saved", "Settings saved");
          }}
          style={[styles.saveBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="save" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* On-device badge */}
      <View style={[styles.onDeviceBadge, { backgroundColor: colors.primary + "18", borderColor: colors.primary }]}>
        <Feather name="smartphone" size={14} color={colors.primary} />
        <Text style={[styles.onDeviceText, { color: colors.primary }]}>
          Runs on-device — no server required
        </Text>
      </View>

      {/* Target URLs */}
      <SectionCard title="Target Websites">
        <TextInput
          style={[styles.multiInput, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
          placeholder={"https://example.com\nhttps://another.com"}
          placeholderTextColor={colors.mutedForeground}
          value={state.urls}
          onChangeText={(v) => updateState({ urls: v })}
          multiline
          numberOfLines={4}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </SectionCard>

      {/* Referral */}
      <SectionCard title="Referral Settings">
        <FormField
          label="REFERRAL URL (optional)"
          value={state.referral_url}
          onChangeText={(v) => updateState({ referral_url: v })}
          placeholder="https://referral-example.com"
          autoCapitalize="none"
          keyboardType="url"
        />
        <Text style={[styles.label, { color: colors.mutedForeground }]}>REFERRAL SOURCE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {REFERRAL_SOURCES.map((src) => (
            <TouchableOpacity
              key={src}
              onPress={() => updateState({ referral_source: src })}
              style={[
                styles.chip,
                {
                  backgroundColor: state.referral_source === src ? colors.primary : colors.secondary,
                  borderColor: state.referral_source === src ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={{ color: state.referral_source === src ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>
                {src}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SectionCard>

      {/* Element interaction */}
      <SectionCard title="Element Interaction">
        <FormField
          label="ELEMENT TO CLICK (CSS selector or text)"
          value={state.element_to_click}
          onChangeText={(v) => updateState({ element_to_click: v })}
          placeholder="button.subscribe, #buy-now"
        />
        <SliderRow
          label="Wait After Click"
          value={state.wait_time_after_click}
          min={0}
          max={300}
          suffix="s"
          onValueChange={(v) => updateState({ wait_time_after_click: v })}
        />
      </SectionCard>

      {/* Device Distribution */}
      <SectionCard title="Device Distribution (must total 100%)">
        <View style={styles.percentRow}>
          {[
            { label: "Android", key: "android_percent" as const },
            { label: "Desktop", key: "desktop_percent" as const },
            { label: "iOS", key: "ios_percent" as const },
          ].map(({ label, key }) => (
            <View key={key} style={styles.percentItem}>
              <Text style={[styles.percentLabel, { color: colors.mutedForeground }]}>{label}</Text>
              <TextInput
                style={[styles.percentInput, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
                value={state[key]}
                onChangeText={(v) => updateState({ [key]: v })}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={[styles.percentSign, { color: colors.mutedForeground }]}>%</Text>
            </View>
          ))}
        </View>
        {(() => {
          const total =
            (parseInt(state.android_percent, 10) || 0) +
            (parseInt(state.desktop_percent, 10) || 0) +
            (parseInt(state.ios_percent, 10) || 0);
          return (
            <Text style={{ color: total === 100 ? colors.primary : colors.destructive, fontSize: 12, textAlign: "center", marginTop: 6 }}>
              Total: {total}% {total === 100 ? "✓" : "(must be 100%)"}
            </Text>
          );
        })()}
      </SectionCard>

      {/* Stay Time */}
      <SectionCard title="Stay Time">
        <SwitchRow
          label="Random Stay Time"
          value={state.use_random_stay_time}
          onValueChange={(v) => updateState({ use_random_stay_time: v })}
        />
        {!state.use_random_stay_time ? (
          <FormField
            label="FIXED TIME (minutes)"
            value={state.stay_time_fixed}
            onChangeText={(v) => updateState({ stay_time_fixed: v })}
            placeholder="e.g. 5"
            keyboardType="numeric"
          />
        ) : (
          <>
            <SliderRow label="Min Stay" value={state.stay_time_min} min={1} max={120} suffix=" min" onValueChange={(v) => updateState({ stay_time_min: v })} />
            <SliderRow label="Max Stay" value={state.stay_time_max} min={1} max={120} suffix=" min" onValueChange={(v) => updateState({ stay_time_max: v })} />
          </>
        )}
      </SectionCard>

      {/* Threads */}
      <SectionCard title="Sessions (Threads)">
        <SwitchRow
          label="Random Thread Count"
          value={state.use_random_threads}
          onValueChange={(v) => updateState({ use_random_threads: v })}
        />
        {!state.use_random_threads ? (
          <FormField
            label="FIXED THREADS"
            value={state.threads_fixed}
            onChangeText={(v) => updateState({ threads_fixed: v })}
            placeholder="e.g. 5"
            keyboardType="numeric"
          />
        ) : (
          <>
            <SliderRow label="Min" value={state.threads_min} min={1} max={50} suffix="" onValueChange={(v) => updateState({ threads_min: v })} />
            <SliderRow label="Max" value={state.threads_max} min={1} max={50} suffix="" onValueChange={(v) => updateState({ threads_max: v })} />
          </>
        )}
        <View style={[styles.note, { backgroundColor: colors.secondary }]}>
          <Feather name="info" size={12} color={colors.mutedForeground} />
          <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
            Sessions run 2 at a time on-device to preserve memory
          </Text>
        </View>
      </SectionCard>

      {/* Keyword Search */}
      <SectionCard title="Keyword Search (Google)">
        <SwitchRow
          label="Enable Keyword Search"
          value={state.enable_keyword_search}
          onValueChange={(v) => updateState({ enable_keyword_search: v })}
          description="Navigates to Google, searches keyword, finds your domain"
        />
        {state.enable_keyword_search && (
          <>
            <FormField
              label="MAIN URL"
              value={state.keyword_main_url}
              onChangeText={(v) => updateState({ keyword_main_url: v })}
              placeholder="https://www.example.com"
              autoCapitalize="none"
              keyboardType="url"
            />
            <FormField
              label="KEYWORDS (comma-separated)"
              value={state.keyword_keywords}
              onChangeText={(v) => updateState({ keyword_keywords: v })}
              placeholder="buy shoes, best shoes 2025"
            />
            <FormField
              label="STAY TIME (ms)"
              value={state.keyword_stay_time}
              onChangeText={(v) => updateState({ keyword_stay_time: v })}
              placeholder="8000"
              keyboardType="numeric"
            />
          </>
        )}
      </SectionCard>

      {/* Browser behavior */}
      <SectionCard title="Browser Behavior">
        {BROWSER_BEHAVIORS.map((b) => (
          <TouchableOpacity
            key={b}
            onPress={() => updateState({ browser_behavior: b })}
            style={[
              styles.behaviorBtn,
              {
                backgroundColor: state.browser_behavior === b ? colors.primary + "22" : colors.secondary,
                borderColor: state.browser_behavior === b ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={[styles.radio, { borderColor: state.browser_behavior === b ? colors.primary : colors.border }]}>
              {state.browser_behavior === b && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
            </View>
            <Text style={{ color: colors.foreground, fontSize: 13 }}>{b}</Text>
          </TouchableOpacity>
        ))}
      </SectionCard>

      {/* Start / Stop */}
      <TouchableOpacity
        onPress={isRunning ? stopSimulation : handleStart}
        style={[styles.startBtn, { backgroundColor: isRunning ? colors.destructive : colors.primary }]}
        activeOpacity={0.8}
      >
        <Feather name={isRunning ? "square" : "play"} size={24} color="#fff" />
        <Text style={styles.startBtnText}>{isRunning ? "STOP SIMULATION" : "START SIMULATION"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  appName: { fontSize: 22, fontWeight: "900", letterSpacing: 2, fontFamily: "monospace" },
  subtitle: { fontSize: 11, letterSpacing: 0.5 },
  saveBtn: { padding: 10, borderRadius: 8, borderWidth: 1 },
  onDeviceBadge: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 14 },
  onDeviceText: { fontSize: 12, fontWeight: "600" },
  label: { fontSize: 12, fontWeight: "500", letterSpacing: 0.5, marginBottom: 6 },
  multiInput: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 13, minHeight: 90, textAlignVertical: "top", fontFamily: "monospace" },
  chips: { flexDirection: "row", marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  percentRow: { flexDirection: "row", gap: 10, justifyContent: "center" },
  percentItem: { flex: 1, alignItems: "center", gap: 4 },
  percentLabel: { fontSize: 11, fontWeight: "500" },
  percentInput: { width: "100%", borderWidth: 1, borderRadius: 6, padding: 8, textAlign: "center", fontSize: 16, fontWeight: "700" },
  percentSign: { fontSize: 14 },
  note: { flexDirection: "row", alignItems: "center", gap: 6, padding: 8, borderRadius: 6, marginTop: 8 },
  noteText: { fontSize: 11, flex: 1 },
  behaviorBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 9, height: 9, borderRadius: 4.5 },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, padding: 20, borderRadius: 14, marginTop: 4 },
  startBtnText: { color: "#fff", fontSize: 18, fontWeight: "800", letterSpacing: 1 },
});
