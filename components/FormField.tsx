import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface FormFieldProps extends TextInputProps {
  label: string;
  hint?: string;
}

export function FormField({ label, hint, style, ...rest }: FormFieldProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border },
          style,
        ]}
        placeholderTextColor={colors.mutedForeground}
        {...rest}
      />
      {hint ? <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 12, marginBottom: 6, fontWeight: "500", letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: "monospace",
  },
  hint: { fontSize: 11, marginTop: 4 },
});
