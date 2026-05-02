import React, { useState } from "react";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { SliderRow } from "@/components/SliderRow";
import { SwitchRow } from "@/components/SwitchRow";
import { useApp, HyperlinkClickingSettings } from "@/context/AppContext";
import { Text } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function HyperlinkClickingModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [s, setS] = useState<HyperlinkClickingSettings>({ ...state.hyperlink_clicking_settings });

  const update = (partial: Partial<HyperlinkClickingSettings>) => setS((p) => ({ ...p, ...partial }));

  const handleSave = () => {
    updateState({ hyperlink_clicking_settings: s });
    onClose();
  };

  return (
    <ModalSheet visible={visible} title="Hyperlink Clicking" onClose={onClose} onSave={handleSave}>
      <SwitchRow label="Enable Hyperlink Clicking" value={s.enabled} onValueChange={(v) => update({ enabled: v })} />
      {s.enabled && (
        <SectionCard title="Settings">
          <SliderRow
            label="Click Probability"
            value={s.click_probability}
            onValueChange={(v) => update({ click_probability: v })}
          />
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
            The bot will randomly click on hyperlinks found in articles based on this probability.
          </Text>
        </SectionCard>
      )}
    </ModalSheet>
  );
}
