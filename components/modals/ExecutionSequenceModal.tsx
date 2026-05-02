import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { SwitchRow } from "@/components/SwitchRow";
import { useApp, ExecutionSequenceSettings } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const FEATURE_NAMES: Record<string, string> = {
  url_menu: "URL Menu",
  referral_url: "Referral URL",
  rpa: "RPA Automation",
  main_navigation: "Main Navigation",
  interactive_mode: "Interactive Mode",
};

const ALL_FEATURES = Object.keys(FEATURE_NAMES);

export function ExecutionSequenceModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [s, setS] = useState<ExecutionSequenceSettings>({ ...state.execution_sequence_settings });

  const update = (partial: Partial<ExecutionSequenceSettings>) => setS((p) => ({ ...p, ...partial }));

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const newSeq = [...s.sequence];
    [newSeq[idx - 1], newSeq[idx]] = [newSeq[idx], newSeq[idx - 1]];
    update({ sequence: newSeq });
  };

  const moveDown = (idx: number) => {
    if (idx === s.sequence.length - 1) return;
    const newSeq = [...s.sequence];
    [newSeq[idx + 1], newSeq[idx]] = [newSeq[idx], newSeq[idx + 1]];
    update({ sequence: newSeq });
  };

  const removeFeature = (idx: number) => {
    const feat = s.sequence[idx];
    if (feat === "main_navigation") {
      Alert.alert("Remove Main Navigation?", "Main Navigation is typically a core feature.", [
        { text: "Cancel" },
        { text: "Remove", style: "destructive", onPress: () => update({ sequence: s.sequence.filter((_, i) => i !== idx) }) },
      ]);
      return;
    }
    update({ sequence: s.sequence.filter((_, i) => i !== idx) });
  };

  const addFeature = (feat: string) => {
    if (!s.sequence.includes(feat)) {
      update({ sequence: [...s.sequence, feat] });
    }
  };

  const resetToDefault = () => {
    Alert.alert("Reset Sequence?", "Reset to default: URL Menu → Referral URL → Main Navigation", [
      { text: "Cancel" },
      { text: "Reset", onPress: () => update({ sequence: ["url_menu", "referral_url", "main_navigation"] }) },
    ]);
  };

  const handleSave = () => {
    updateState({ execution_sequence_settings: s });
    onClose();
  };

  const available = ALL_FEATURES.filter((f) => !s.sequence.includes(f));

  return (
    <ModalSheet visible={visible} title="Execution Sequence" onClose={onClose} onSave={handleSave}>
      <SwitchRow
        label="Enable Execution Sequence"
        value={s.enabled}
        onValueChange={(v) => update({ enabled: v })}
        description="Full control over the order features execute"
      />

      {s.enabled && (
        <>
          <SectionCard title="Current Sequence (drag to reorder)">
            {s.sequence.map((feat, idx) => (
              <View key={feat} style={[styles.seqRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Text style={[styles.seqNum, { color: colors.accent }]}>{idx + 1}</Text>
                <Text style={[styles.seqName, { color: colors.foreground }]}>{FEATURE_NAMES[feat] || feat}</Text>
                <View style={styles.seqActions}>
                  <TouchableOpacity onPress={() => moveUp(idx)} disabled={idx === 0} style={styles.iconBtn}>
                    <Feather name="chevron-up" size={18} color={idx === 0 ? colors.border : colors.foreground} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => moveDown(idx)} disabled={idx === s.sequence.length - 1} style={styles.iconBtn}>
                    <Feather name="chevron-down" size={18} color={idx === s.sequence.length - 1 ? colors.border : colors.foreground} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeFeature(idx)} style={styles.iconBtn}>
                    <Feather name="trash-2" size={16} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </SectionCard>

          {available.length > 0 && (
            <SectionCard title="Add Feature">
              {available.map((feat) => (
                <TouchableOpacity
                  key={feat}
                  onPress={() => addFeature(feat)}
                  style={[styles.addRow, { borderColor: colors.border }]}
                >
                  <Feather name="plus-circle" size={16} color={colors.primary} />
                  <Text style={[styles.addText, { color: colors.foreground }]}>{FEATURE_NAMES[feat]}</Text>
                </TouchableOpacity>
              ))}
            </SectionCard>
          )}

          <TouchableOpacity onPress={resetToDefault} style={[styles.resetBtn, { borderColor: colors.warning }]}>
            <Feather name="refresh-cw" size={14} color={colors.warning} />
            <Text style={{ color: colors.warning, fontSize: 13, fontWeight: "600" }}>Reset to Default</Text>
          </TouchableOpacity>
        </>
      )}
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  seqRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
    gap: 10,
  },
  seqNum: { fontSize: 14, fontWeight: "700", width: 20 },
  seqName: { flex: 1, fontSize: 14 },
  seqActions: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 4 },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  addText: { fontSize: 13 },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 4,
  },
});
