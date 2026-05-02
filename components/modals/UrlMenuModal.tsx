import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { SliderRow } from "@/components/SliderRow";
import { SwitchRow } from "@/components/SwitchRow";
import { useApp, UrlMenuSettings, UrlEntry } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { FormField } from "@/components/FormField";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function UrlMenuModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [s, setS] = useState<UrlMenuSettings>({ ...state.url_menu_settings });
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const update = (partial: Partial<UrlMenuSettings>) => setS((p) => ({ ...p, ...partial }));

  const addUrl = () => {
    update({ urls: [...s.urls, { url: "", wait_time: 10 }] });
  };

  const removeUrl = (idx: number) => {
    update({ urls: s.urls.filter((_, i) => i !== idx) });
  };

  const updateUrl = (idx: number, partial: Partial<UrlEntry>) => {
    const updated = s.urls.map((entry, i) => (i === idx ? { ...entry, ...partial } : entry));
    update({ urls: updated });
  };

  const pasteBulk = () => {
    const lines = bulkText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const entries = lines.map((url) => ({ url, wait_time: 10 }));
    update({ urls: [...s.urls, ...entries] });
    setBulkText("");
    setShowBulk(false);
  };

  const applyRandomDurations = () => {
    const [min, max] = s.random_duration_range;
    const updated = s.urls.map((entry) => ({
      ...entry,
      wait_time: Math.floor(Math.random() * (max - min + 1)) + min,
    }));
    update({ urls: updated });
  };

  const handleSave = () => {
    updateState({ url_menu_settings: s });
    onClose();
  };

  return (
    <ModalSheet visible={visible} title="URL Menu" onClose={onClose} onSave={handleSave}>
      <SwitchRow label="Enable URL Menu" value={s.enabled} onValueChange={(v) => update({ enabled: v })} />

      {s.enabled && (
        <>
          <SectionCard title="Random URL Count">
            <SwitchRow
              label="Enable Random URL Count"
              value={s.random_url_count_enabled}
              onValueChange={(v) => update({ random_url_count_enabled: v })}
            />
            {s.random_url_count_enabled && (
              <>
                <SliderRow
                  label="Min URLs"
                  value={s.random_url_count_range[0]}
                  min={1}
                  max={100}
                  suffix=""
                  onValueChange={(v) => update({ random_url_count_range: [v, s.random_url_count_range[1]] })}
                />
                <SliderRow
                  label="Max URLs"
                  value={s.random_url_count_range[1]}
                  min={1}
                  max={100}
                  suffix=""
                  onValueChange={(v) => update({ random_url_count_range: [s.random_url_count_range[0], v] })}
                />
              </>
            )}
          </SectionCard>

          <SectionCard title="Random Duration">
            <SwitchRow
              label="Enable Random Duration"
              value={s.random_duration_enabled}
              onValueChange={(v) => update({ random_duration_enabled: v })}
            />
            {s.random_duration_enabled && (
              <>
                <SliderRow
                  label="Min Duration"
                  value={s.random_duration_range[0]}
                  min={1}
                  max={3600}
                  suffix="s"
                  onValueChange={(v) => update({ random_duration_range: [v, s.random_duration_range[1]] })}
                />
                <SliderRow
                  label="Max Duration"
                  value={s.random_duration_range[1]}
                  min={1}
                  max={3600}
                  suffix="s"
                  onValueChange={(v) => update({ random_duration_range: [s.random_duration_range[0], v] })}
                />
                <TouchableOpacity
                  onPress={applyRandomDurations}
                  style={[styles.actionBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                >
                  <Feather name="shuffle" size={14} color={colors.accent} />
                  <Text style={{ color: colors.accent, fontSize: 13 }}>Apply Random Durations</Text>
                </TouchableOpacity>
              </>
            )}
          </SectionCard>

          <SectionCard title={`URLs (${s.urls.length})`}>
            <View style={styles.btnRow}>
              <TouchableOpacity onPress={() => setShowBulk((v) => !v)} style={[styles.actionBtn, { backgroundColor: colors.secondary, borderColor: colors.border, flex: 1 }]}>
                <Feather name="clipboard" size={14} color={colors.accent} />
                <Text style={{ color: colors.accent, fontSize: 12 }}>Paste URLs</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addUrl} style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary, flex: 1 }]}>
                <Feather name="plus" size={14} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 12 }}>Add URL</Text>
              </TouchableOpacity>
            </View>

            {showBulk && (
              <View style={styles.bulkWrap}>
                <TextInput
                  style={[styles.textarea, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
                  placeholder={"https://example.com\nhttps://another.com"}
                  placeholderTextColor={colors.mutedForeground}
                  value={bulkText}
                  onChangeText={setBulkText}
                  multiline
                  numberOfLines={5}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={pasteBulk} style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Add These URLs</Text>
                </TouchableOpacity>
              </View>
            )}

            {s.urls.map((entry, idx) => (
              <View key={idx} style={[styles.urlRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <View style={styles.urlInputRow}>
                  <TextInput
                    style={[styles.urlInput, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
                    value={entry.url}
                    onChangeText={(v) => updateUrl(idx, { url: v })}
                    placeholder="https://example.com"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  <TouchableOpacity onPress={() => removeUrl(idx)} style={styles.delBtn}>
                    <Feather name="trash-2" size={16} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
                <View style={styles.waitRow}>
                  <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>Wait: {entry.wait_time}s</Text>
                  <SliderRow
                    label=""
                    value={entry.wait_time}
                    min={1}
                    max={3600}
                    suffix="s"
                    onValueChange={(v) => updateUrl(idx, { wait_time: v })}
                  />
                </View>
              </View>
            ))}
          </SectionCard>
        </>
      )}
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  btnRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 6, borderWidth: 1 },
  bulkWrap: { marginBottom: 10, gap: 8 },
  textarea: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 12, minHeight: 100, textAlignVertical: "top" },
  urlRow: { borderRadius: 6, borderWidth: 1, padding: 10, marginBottom: 8 },
  urlInputRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  urlInput: { flex: 1, borderWidth: 1, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 6, fontSize: 12 },
  delBtn: { padding: 4 },
  waitRow: { gap: 2 },
});
