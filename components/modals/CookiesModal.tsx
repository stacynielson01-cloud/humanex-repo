import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CookiesModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [text, setText] = useState(state.cookies_text);

  const handleSave = () => {
    updateState({ cookies_text: text });
    onClose();
  };

  return (
    <ModalSheet visible={visible} title="Cookies" onClose={onClose} onSave={handleSave}>
      <SectionCard title="Cookie Data">
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 10 }}>
          Paste cookies in JSON format (array or {"{cookies: [...]}"}), or Netscape tab-delimited format.
        </Text>
        <TextInput
          style={[
            styles.textarea,
            { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border },
          ]}
          placeholder={'[{"name":"session","value":"abc123","domain":".example.com","path":"/"}]'}
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={14}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setText("")}
          style={[styles.clearBtn, { borderColor: colors.destructive }]}
        >
          <Feather name="trash-2" size={14} color={colors.destructive} />
          <Text style={{ color: colors.destructive, fontSize: 13 }}>Clear</Text>
        </TouchableOpacity>
      </SectionCard>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  textarea: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 11,
    minHeight: 200,
    textAlignVertical: "top",
    fontFamily: "monospace",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
});
