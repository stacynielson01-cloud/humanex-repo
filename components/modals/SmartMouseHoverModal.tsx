import React, { useState } from "react";
import { Text } from "react-native";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { SliderRow } from "@/components/SliderRow";
import { SwitchRow } from "@/components/SwitchRow";
import { useApp, SmartMouseHoverSettings } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SmartMouseHoverModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [s, setS] = useState<SmartMouseHoverSettings>({ ...state.hover_settings });

  const update = (partial: Partial<SmartMouseHoverSettings>) => setS((p) => ({ ...p, ...partial }));

  const handleSave = () => {
    updateState({ hover_settings: s });
    onClose();
  };

  return (
    <ModalSheet visible={visible} title="Smart Mouse Hover" onClose={onClose} onSave={handleSave}>
      <SwitchRow label="Enable Smart Mouse Hover" value={s.enabled} onValueChange={(v) => update({ enabled: v })} />
      {s.enabled && (
        <>
          <SectionCard title="Settings">
            <SliderRow label="Hover Probability" value={s.hover_probability} onValueChange={(v) => update({ hover_probability: v })} />
            <SliderRow label="Min Duration" value={s.min_duration} min={0.1} max={10} step={0.1} suffix="s" onValueChange={(v) => update({ min_duration: v })} />
            <SliderRow label="Max Duration" value={s.max_duration} min={0.1} max={10} step={0.1} suffix="s" onValueChange={(v) => update({ max_duration: v })} />
          </SectionCard>
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
            The bot intelligently hovers over page elements to simulate human interaction.
          </Text>
        </>
      )}
    </ModalSheet>
  );
}
