import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { SliderRow } from "@/components/SliderRow";
import { SwitchRow } from "@/components/SwitchRow";
import { useApp, ArticleRandomizationSettings } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ArticleRandomizationModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [s, setS] = useState<ArticleRandomizationSettings>({ ...state.article_randomization_settings });
  const [newArticle, setNewArticle] = useState("");

  const update = (partial: Partial<ArticleRandomizationSettings>) => setS((p) => ({ ...p, ...partial }));

  const addArticle = () => {
    const text = newArticle.trim();
    if (!text) return;
    update({ articles: [...s.articles, text] });
    setNewArticle("");
  };

  const removeArticle = (idx: number) => {
    update({ articles: s.articles.filter((_, i) => i !== idx) });
  };

  const handleSave = () => {
    updateState({ article_randomization_settings: s });
    onClose();
  };

  return (
    <ModalSheet visible={visible} title="Article Randomization" onClose={onClose} onSave={handleSave}>
      <SwitchRow label="Enable Article Randomization" value={s.enabled} onValueChange={(v) => update({ enabled: v })} />

      {s.enabled && (
        <>
          <SectionCard title="Mode">
            <View style={styles.modeRow}>
              {(["sentence", "word"] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => update({ mode: m })}
                  style={[
                    styles.modeBtn,
                    {
                      backgroundColor: s.mode === m ? colors.primary : colors.secondary,
                      borderColor: s.mode === m ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: s.mode === m ? "#fff" : colors.foreground, fontWeight: "600" }}>
                    {m === "sentence" ? "Sentence" : "Word"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <SliderRow
              label="Highlight Probability"
              value={s.highlight_probability}
              onValueChange={(v) => update({ highlight_probability: v })}
            />
          </SectionCard>

          <SectionCard title={`Articles (${s.articles.length})`}>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Paste article text here..."
                placeholderTextColor={colors.mutedForeground}
                value={newArticle}
                onChangeText={setNewArticle}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                onPress={addArticle}
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
              >
                <Feather name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            {s.articles.map((article, idx) => (
              <View key={idx} style={[styles.articleRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Text style={[styles.articleText, { color: colors.foreground }]} numberOfLines={2}>
                  {article.substring(0, 80)}{article.length > 80 ? "..." : ""}
                </Text>
                <TouchableOpacity onPress={() => removeArticle(idx)}>
                  <Feather name="trash-2" size={16} color={colors.destructive} />
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
  modeRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  modeBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 13, minHeight: 60 },
  addBtn: { width: 44, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  articleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
    gap: 8,
  },
  articleText: { flex: 1, fontSize: 12 },
});
