import React, { useState } from "react";
import { Text } from "react-native";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { SliderRow } from "@/components/SliderRow";
import { SwitchRow } from "@/components/SwitchRow";
import { useApp, RandomActionsSettings, RandomActionsSubSetting } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

function SubSection({
  title,
  value,
  onChange,
}: {
  title: string;
  value: RandomActionsSubSetting & { hover_probability?: number };
  onChange: (v: Partial<RandomActionsSubSetting & { hover_probability?: number }>) => void;
}) {
  return (
    <SectionCard title={title}>
      <SwitchRow label={`Enable in random mix`} value={value.enabled} onValueChange={(v) => onChange({ enabled: v })} />
      {value.enabled && (
        <>
          <SliderRow
            label="Probability"
            value={"hover_probability" in value ? (value.hover_probability ?? value.probability) : value.probability}
            onValueChange={(v) =>
              "hover_probability" in value ? onChange({ hover_probability: v, probability: v }) : onChange({ probability: v })
            }
          />
          <SliderRow label="Min Interval" value={value.min_interval} min={1} max={120} suffix="s" onValueChange={(v) => onChange({ min_interval: v })} />
          <SliderRow label="Max Interval" value={value.max_interval} min={1} max={300} suffix="s" onValueChange={(v) => onChange({ max_interval: v })} />
        </>
      )}
    </SectionCard>
  );
}

export function RandomActionsModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [s, setS] = useState<RandomActionsSettings>({ ...state.random_actions_settings });

  const update = (partial: Partial<RandomActionsSettings>) => setS((p) => ({ ...p, ...partial }));

  const handleSave = () => {
    updateState({ random_actions_settings: s });
    onClose();
  };

  return (
    <ModalSheet visible={visible} title="Random Actions" onClose={onClose} onSave={handleSave}>
      <SwitchRow label="Enable Random Actions" value={s.enabled} onValueChange={(v) => update({ enabled: v })} />
      {s.enabled && (
        <>
          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 12 }}>
            Configure probability and timing for each action. Higher probability = more frequent.
          </Text>
          <SubSection
            title="Advanced Scrolling"
            value={s.advanced_scrolling}
            onChange={(v) => update({ advanced_scrolling: { ...s.advanced_scrolling, ...v } })}
          />
          <SubSection
            title="Article Randomization"
            value={s.article_randomization}
            onChange={(v) => update({ article_randomization: { ...s.article_randomization, ...v } })}
          />
          <SubSection
            title="Hyperlink Clicking"
            value={s.hyperlink_clicking}
            onChange={(v) => update({ hyperlink_clicking: { ...s.hyperlink_clicking, ...v } })}
          />
          <SubSection
            title="Smart Mouse Hover"
            value={s.smart_mouse_hover}
            onChange={(v) => update({ smart_mouse_hover: { ...s.smart_mouse_hover, ...v } })}
          />
        </>
      )}
    </ModalSheet>
  );
}
