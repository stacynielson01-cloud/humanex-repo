import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FormField } from "@/components/FormField";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { SliderRow } from "@/components/SliderRow";
import { SwitchRow } from "@/components/SwitchRow";
import { useApp, InteractiveModeSettings } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function InteractiveModeModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [s, setS] = useState<InteractiveModeSettings>({ ...state.interactive_mode_settings });
  const [newKeyword, setNewKeyword] = useState("");

  const update = (partial: Partial<InteractiveModeSettings>) => setS((p) => ({ ...p, ...partial }));

  const addKeyword = () => {
    const kw = newKeyword.trim();
    if (!kw) return;
    update({ search_box_keywords: [...s.search_box_keywords, kw] });
    setNewKeyword("");
  };

  const removeKeyword = (idx: number) => {
    update({ search_box_keywords: s.search_box_keywords.filter((_, i) => i !== idx) });
  };

  const handleSave = () => {
    updateState({ interactive_mode_settings: s });
    onClose();
  };

  return (
    <ModalSheet visible={visible} title="Interactive Mode" onClose={onClose} onSave={handleSave}>
      <SwitchRow
        label="Enable Interactive Mode"
        value={s.enabled}
        onValueChange={(v) => update({ enabled: v })}
        description="Intelligently interacts with all elements on a page"
      />

      {s.enabled && (
        <>
          <SectionCard title="Target">
            <FormField
              label="TARGET URL"
              value={s.target_url}
              onChangeText={(v) => update({ target_url: v })}
              placeholder="https://example.com"
              autoCapitalize="none"
              keyboardType="url"
            />
            <SliderRow label="Duration" value={s.duration} min={30} max={3600} suffix="s" onValueChange={(v) => update({ duration: v })} />
            <SwitchRow label="Stay on Domain" value={s.stay_on_domain} onValueChange={(v) => update({ stay_on_domain: v })} />
          </SectionCard>

          <SectionCard title="Interaction Probabilities">
            <SliderRow label="Click Probability" value={s.click_probability} onValueChange={(v) => update({ click_probability: v })} />
            <SliderRow label="Hover Probability" value={s.hover_probability} onValueChange={(v) => update({ hover_probability: v })} />
            <SliderRow label="Scroll Probability" value={s.scroll_probability} onValueChange={(v) => update({ scroll_probability: v })} />
          </SectionCard>

          <SectionCard title="Interaction Interval">
            <SliderRow label="Min Interval" value={s.interaction_interval_min} min={1} max={30} suffix="s" onValueChange={(v) => update({ interaction_interval_min: v })} />
            <SliderRow label="Max Interval" value={s.interaction_interval_max} min={1} max={60} suffix="s" onValueChange={(v) => update({ interaction_interval_max: v })} />
          </SectionCard>

          <SectionCard title={`Search Keywords (${s.search_box_keywords.length})`}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.kwInput, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
                placeholder="keyword..."
                placeholderTextColor={colors.mutedForeground}
                value={newKeyword}
                onChangeText={setNewKeyword}
                onSubmitEditing={addKeyword}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={addKeyword} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                <Feather name="plus" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            {s.search_box_keywords.map((kw, idx) => (
              <View key={idx} style={[styles.kwRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground, flex: 1, fontSize: 13 }}>{kw}</Text>
                <TouchableOpacity onPress={() => removeKeyword(idx)}>
                  <Feather name="x" size={14} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            ))}
          </SectionCard>
        </>
      )}
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  kwInput: { flex: 1, borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13 },
  addBtn: { width: 40, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  kwRow: { flexDirection: "row", alignItems: "center", padding: 8, borderRadius: 6, borderWidth: 1, marginBottom: 4 },
});
