import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { colors, fontWeights, radii, spacing, textStyles } from "../theme";

// Read-only pill for short labels like interests. `highlighted` marks one you share.
export default function Tag({ label, highlighted = false }) {
  return (
    <View style={[styles.tag, highlighted && styles.highlighted]}>
      <Text style={[styles.label, highlighted && styles.labelHighlighted]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
    backgroundColor: colors.secondary,
  },
  highlighted: { backgroundColor: colors.primary },
  label: { ...textStyles.small, fontWeight: fontWeights.medium, color: colors.primaryDark },
  labelHighlighted: { color: colors.textLight },
});
