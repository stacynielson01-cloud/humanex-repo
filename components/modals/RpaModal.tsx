import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { SwitchRow } from "@/components/SwitchRow";
import { useApp, RpaSettings, RpaAction } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { FormField } from "@/components/FormField";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ACTION_TYPES = ["gotoUrl", "scrollPage", "click", "waitTime", "waitForSelector", "closeOtherPage"];
const ACTION_ICONS: Record<string, keyof typeof import("@expo/vector-icons").Feather.glyphMap> = {
  gotoUrl: "navigation",
  scrollPage: "chevrons-down",
  click: "mouse-pointer",
  waitTime: "clock",
  waitForSelector: "eye",
  closeOtherPage: "x-circle",
};

function getActionDescription(action: RpaAction): string {
  const c = action.config;
  switch (action.type) {
    case "gotoUrl": return `Go to: ${String(c.url || "").substring(0, 40)}`;
    case "scrollPage": return `Scroll to: ${String(c.position || "bottom")}`;
    case "click": return `Click: ${String(c.selector || "").substring(0, 30)}`;
    case "waitTime": return `Wait: ${c.timeout || 1000}ms`;
    case "waitForSelector": return `Wait for: ${String(c.selector || "").substring(0, 30)}`;
    case "closeOtherPage": return "Close other pages";
    default: return action.type;
  }
}

export function RpaModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [s, setS] = useState<RpaSettings>({ ...state.rpa_settings });
  const [showPicker, setShowPicker] = useState(false);

  const update = (partial: Partial<RpaSettings>) => setS((p) => ({ ...p, ...partial }));

  const addAction = (type: string) => {
    const defaults: Record<string, Record<string, unknown>> = {
      gotoUrl: { url: "", timeout: 30000 },
      scrollPage: { position: "bottom" },
      click: { selector: "" },
      waitTime: { timeout: 1000, timeoutType: "fixedValue" },
      waitForSelector: { selector: "", timeout: 10000 },
      closeOtherPage: {},
    };
    const newAction: RpaAction = { type, config: defaults[type] || {} };
    update({ actions: [...s.actions, newAction] });
    setShowPicker(false);
  };

  const removeAction = (idx: number) => {
    update({ actions: s.actions.filter((_, i) => i !== idx) });
  };

  const moveAction = (idx: number, dir: -1 | 1) => {
    const newActions = [...s.actions];
    const target = idx + dir;
    if (target < 0 || target >= newActions.length) return;
    [newActions[idx], newActions[target]] = [newActions[target], newActions[idx]];
    update({ actions: newActions });
  };

  const handleSave = () => {
    updateState({ rpa_settings: s });
    onClose();
  };

  return (
    <ModalSheet visible={visible} title="RPA Automation" onClose={onClose} onSave={handleSave}>
      <SwitchRow
        label="Enable RPA"
        value={s.enabled}
        onValueChange={(v) => update({ enabled: v })}
        description="Robotic Process Automation — sequence of browser actions"
      />

      {s.enabled && (
        <>
          <SectionCard title={`Actions (${s.actions.length})`}>
            {s.actions.map((action, idx) => (
              <View key={idx} style={[styles.actionRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name={ACTION_ICONS[action.type] || "zap"} size={16} color={colors.accent} style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={[styles.actionType, { color: colors.foreground }]}>{action.type}</Text>
                  <Text style={[styles.actionDesc, { color: colors.mutedForeground }]}>{getActionDescription(action)}</Text>
                </View>
                <View style={styles.actionBtns}>
                  <TouchableOpacity onPress={() => moveAction(idx, -1)} style={styles.iconBtn}>
                    <Feather name="chevron-up" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => moveAction(idx, 1)} style={styles.iconBtn}>
                    <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeAction(idx)} style={styles.iconBtn}>
                    <Feather name="trash-2" size={15} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {showPicker ? (
              <View style={[styles.picker, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.pickerTitle, { color: colors.accent }]}>SELECT ACTION TYPE</Text>
                {ACTION_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => addAction(type)}
                    style={[styles.pickerItem, { borderColor: colors.border }]}
                  >
                    <Feather name={ACTION_ICONS[type] || "zap"} size={16} color={colors.primary} />
                    <Text style={{ color: colors.foreground, fontSize: 14, marginLeft: 8 }}>{type}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.iconBtn}>
                  <Text style={{ color: colors.destructive, fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowPicker(true)}
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
              >
                <Feather name="plus" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>Add Action</Text>
              </TouchableOpacity>
            )}
          </SectionCard>

          <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
            RPA actions execute in order before main navigation. Use gotoUrl → scroll → click → wait sequences to automate browser tasks.
          </Text>
        </>
      )}
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  actionRow: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 6, borderWidth: 1, marginBottom: 6 },
  actionIcon: { marginRight: 6 },
  actionText: { flex: 1 },
  actionType: { fontSize: 13, fontWeight: "600" },
  actionDesc: { fontSize: 11, marginTop: 2 },
  actionBtns: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 4 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 8, marginTop: 4 },
  picker: { borderRadius: 8, borderWidth: 1, padding: 12, marginTop: 6 },
  pickerTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8 },
  pickerItem: { flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1 },
});
