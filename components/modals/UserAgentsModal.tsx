import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function UserAgentsModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [text, setText] = useState(state.user_agents.join("\n"));

  const handleSave = () => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    updateState({ user_agents: lines });
    onClose();
  };

  const count = text.split("\n").filter((l) => l.trim().length > 0).length;

  return (
    <ModalSheet visible={visible} title="User-Agents" onClose={onClose} onSave={handleSave}>
      <SectionCard title={`${count} User-Agents Loaded`}>
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 10 }}>
          Enter one user-agent string per line. A random one will be chosen for each session.
        </Text>
        <TextInput
          style={[
            styles.textarea,
            { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border },
          ]}
          placeholder={"Mozilla/5.0 (Windows NT 10.0; Win64; x64)...\nMozilla/5.0 (iPhone; CPU iPhone OS 17_0...)"}
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={10}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={() => setText("")}
          style={[styles.clearBtn, { borderColor: colors.destructive }]}
        >
          <Feather name="trash-2" size={14} color={colors.destructive} />
          <Text style={{ color: colors.destructive, fontSize: 13 }}>Clear All</Text>
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
    minHeight: 180,
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
