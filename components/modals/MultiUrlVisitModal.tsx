import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { SliderRow } from "@/components/SliderRow";
import { SwitchRow } from "@/components/SwitchRow";
import { useApp, MultiUrlSettings } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { FormField } from "@/components/FormField";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function MultiUrlVisitModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [s, setS] = useState<MultiUrlSettings>({ ...state.multi_url_settings });

  const update = (partial: Partial<MultiUrlSettings>) => setS((p) => ({ ...p, ...partial }));

  const handleSave = () => {
    updateState({ multi_url_settings: s });
    onClose();
  };

  return (
    <ModalSheet visible={visible} title="Multi-URL Visit" onClose={onClose} onSave={handleSave}>
      <SwitchRow label="Enable Multi-URL Visit" value={s.enabled} onValueChange={(v) => update({ enabled: v })} />
      {s.enabled && (
        <>
          <SectionCard title="URL Visit Range">
            <SliderRow label="Min URLs" value={s.min_urls} min={1} max={20} suffix=" URLs" onValueChange={(v) => update({ min_urls: v })} />
            <SliderRow label="Max URLs" value={s.max_urls} min={1} max={20} suffix=" URLs" onValueChange={(v) => update({ max_urls: v })} />
          </SectionCard>

          <SectionCard title="Timing & Probability">
            <SliderRow label="Timeframe" value={s.timeframe} min={10} max={300} suffix="s" onValueChange={(v) => update({ timeframe: v })} />
            <SliderRow label="Probability" value={s.probability} onValueChange={(v) => update({ probability: v })} />
          </SectionCard>

          <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
            The bot will randomly visit between {s.min_urls}–{s.max_urls} URLs within {s.timeframe} seconds with {s.probability}% probability.
          </Text>
        </>
      )}
    </ModalSheet>
  );
}

const styles = StyleSheet.create({});
