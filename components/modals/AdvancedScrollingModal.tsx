import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { SliderRow } from "@/components/SliderRow";
import { SwitchRow } from "@/components/SwitchRow";
import { useApp, AdvancedScrollingSettings } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SCROLL_OPTIONS = ["top", "middle", "bottom", "random"];

export function AdvancedScrollingModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [s, setS] = useState<AdvancedScrollingSettings>({ ...state.advanced_scrolling_settings });

  const update = (partial: Partial<AdvancedScrollingSettings>) => setS((p) => ({ ...p, ...partial }));

  const toggleSequence = (item: string) => {
    const seq = s.scroll_sequence.includes(item)
      ? s.scroll_sequence.filter((x) => x !== item)
      : [...s.scroll_sequence, item];
    update({ scroll_sequence: seq.length === 0 ? ["random"] : seq });
  };

  const handleSave = () => {
    updateState({ advanced_scrolling_settings: s });
    onClose();
  };

  return (
    <ModalSheet visible={visible} title="Advanced Scrolling" onClose={onClose} onSave={handleSave}>
      <SwitchRow label="Enable Advanced Scrolling" value={s.enabled} onValueChange={(v) => update({ enabled: v })} />

      {s.enabled && (
        <>
          <SectionCard title="Scroll Sequence">
            <View style={styles.chips}>
              {SCROLL_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => toggleSequence(opt)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: s.scroll_sequence.includes(opt) ? colors.primary : colors.secondary,
                      borderColor: s.scroll_sequence.includes(opt) ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: s.scroll_sequence.includes(opt) ? "#fff" : colors.foreground }]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <SliderRow
              label="Sequence Repetitions"
              value={s.sequence_repetitions}
              min={1}
              max={10}
              suffix="x"
              onValueChange={(v) => update({ sequence_repetitions: v })}
            />
          </SectionCard>

          <SectionCard title="Slow Scrolling">
            <SliderRow label="Slow Probability" value={s.slow_probability} onValueChange={(v) => update({ slow_probability: v })} />
            <SliderRow label="Min Speed" value={s.slow_min_speed} min={1} max={100} suffix="px" onValueChange={(v) => update({ slow_min_speed: v })} />
            <SliderRow label="Max Speed" value={s.slow_max_speed} min={1} max={200} suffix="px" onValueChange={(v) => update({ slow_max_speed: v })} />
          </SectionCard>

          <SectionCard title="Fast Scrolling">
            <SliderRow label="Fast Probability" value={s.fast_probability} onValueChange={(v) => update({ fast_probability: v })} />
            <SliderRow label="Min Speed" value={s.fast_min_speed} min={50} max={300} suffix="px" onValueChange={(v) => update({ fast_min_speed: v })} />
            <SliderRow label="Max Speed" value={s.fast_max_speed} min={50} max={500} suffix="px" onValueChange={(v) => update({ fast_max_speed: v })} />
          </SectionCard>

          <SectionCard title="Pauses">
            <SliderRow label="Pause Probability" value={s.pause_probability} onValueChange={(v) => update({ pause_probability: v })} />
            <SliderRow label="Min Pause" value={s.min_pause} min={0.1} max={5} step={0.1} suffix="s" onValueChange={(v) => update({ min_pause: v })} />
            <SliderRow label="Max Pause" value={s.max_pause} min={0.1} max={10} step={0.1} suffix="s" onValueChange={(v) => update({ max_pause: v })} />
          </SectionCard>
        </>
      )}
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "500" },
});
