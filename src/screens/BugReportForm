import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Screen from "../components/Screen";
import ScreenHeader from "../components/ScreenHeader";
import TextField from "../components/TextField";
import Button from "../components/Button";
import FilterChip from "../components/FilterChip";
import ROUTES from "../navigation/routes";
import { colors, spacing, textStyles } from "../theme";

const CATEGORIES = ["Crash / freeze", "UI glitch", "Performance", "Data loss", "Other"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const SCREENSHOT_SLOTS = ["Screenshot 1", "Screenshot 2", "Screenshot 3"];

// Tokens your theme may not define yet: fall back to neutral values.
const surface = colors.surface ?? "#FFFFFF";
const border = colors.border ?? "#E5E7EB";
const soft = "#F1F2F4";

// Placeholder icon so this file has no extra dependencies.
// Swap the body for your icon library, e.g.
//   <MaterialCommunityIcons name={name} size={size} color={color} />
function Icon({ glyph, size = 16, color = colors.textMuted }) {
  return <Text style={{ fontSize: size, color }}>{glyph}</Text>;
}

export default function BugReportScreen({ navigation }) {
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    description: "",
    severity: "Medium",
    steps: "",
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Same pattern as LoginScreen: spread into TextField.
  const field = (key) => ({
    value: form[key],
    error: errors[key],
    onChangeText: (text) => set(key, text),
  });

  const browseFiles = () => {
    // TODO: open your file picker here and append the result.
    // Stub so the UI can be tested without a picker installed.
    setFiles((prev) => [...prev, { name: `attachment-${prev.length + 1}.png` }]);
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    const nextErrors = {
      description: form.description.trim() ? null : "Describe the issue to continue.",
      files: files.length ? null : "Add at least one attachment to submit this report.",
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    // TODO: send { ...form, files } to your API, then leave the screen.
    navigation.goBack();
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Bug report form" />
      <Text style={styles.subtitle}>
        Submit a reproducible issue with clear steps and supporting files. Screenshots are
        optional, but attachments are required for secure review.
      </Text>

      <Text style={styles.label}>Issue category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} label={c} selected={form.category === c} onPress={() => set("category", c)} />
        ))}
      </View>

      <TextField
        label="Description"
        placeholder="What happened?"
        multiline
        numberOfLines={4}
        {...field("description")}
      />
      {!errors.description ? <Text style={styles.helper}>Required</Text> : null}

      <Text style={styles.label}>Severity</Text>
      <View style={styles.chipRow}>
        {SEVERITIES.map((s) => (
          <FilterChip key={s} label={s} selected={form.severity === s} onPress={() => set("severity", s)} />
        ))}
      </View>

      <TextField
        label="Reproduction steps"
        placeholder="1. Open… 2. Tap…"
        multiline
        numberOfLines={4}
        {...field("steps")}
      />

      <Text style={styles.label}>Attachment upload</Text>
      <View style={[styles.dropzone, errors.files && styles.dropzoneError]}>
        <View style={styles.uploadCircle}>
          <Icon glyph="↑" size={18} color={colors.primary} />
        </View>
        <Text style={styles.dropTitle}>Upload screenshots or logs</Text>
        <Text style={styles.dropCaption}>
          PNG, JPG, or ZIP up to 10 MB. Secure attachments are required for review.
        </Text>
        <Button title="Browse files" variant="ghost" size="sm" onPress={browseFiles} />
      </View>

      {files.length > 0 ? (
        <View style={styles.fileRow}>
          {files.map((f, i) => (
            <Pressable key={`${f.name}-${i}`} style={styles.fileChip} onLongPress={() => removeFile(i)}>
              <Icon glyph="▤" />
              <Text style={styles.fileName} numberOfLines={1}>
                {f.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Text style={styles.label}>Optional screenshots</Text>
      <View style={styles.shotRow}>
        {SCREENSHOT_SLOTS.map((name) => (
          <View key={name} style={styles.shotCard}>
            <View style={styles.shotPlaceholder}>
              <Icon glyph="▣" size={18} />
            </View>
            <Text style={styles.shotLabel}>{name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.label}>Validation feedback</Text>
      <View style={styles.feedback}>
        <Icon glyph={errors.files ? "!" : "✓"} color={errors.files ? colors.warning : colors.primary} />
        <Text style={[styles.feedbackText, errors.files && { color: colors.warning }]}>
          {errors.files || "Secure attachment upload is enabled and required for this report."}
        </Text>
      </View>

      <Text style={styles.footerNote}>Required fields are validated before submission.</Text>
      <View style={styles.footerButtons}>
        <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
        <Button title="Submit report" onPress={handleSubmit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...textStyles.caption, color: colors.textMuted, marginBottom: spacing.md },
  label: { ...textStyles.body, fontWeight: "700", marginTop: spacing.md, marginBottom: spacing.sm },
  helper: { ...textStyles.caption, color: colors.textMuted, marginTop: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },

  dropzone: {
    backgroundColor: surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: border,
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  dropzoneError: { borderColor: colors.warning },
  uploadCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: soft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  dropTitle: { ...textStyles.body, fontWeight: "700" },
  dropCaption: { ...textStyles.caption, color: colors.textMuted, textAlign: "center", marginVertical: spacing.sm },

  fileRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  fileChip: {
    flexGrow: 1,
    flexBasis: "45%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: border,
    paddingHorizontal: spacing.md,
    height: 36,
  },
  fileName: { ...textStyles.caption, flex: 1 },

  shotRow: { flexDirection: "row", gap: spacing.sm },
  shotCard: { flex: 1, backgroundColor: surface, borderRadius: 12, padding: 6 },
  shotPlaceholder: {
    height: 56,
    borderRadius: 8,
    backgroundColor: soft,
    alignItems: "center",
    justifyContent: "center",
  },
  shotLabel: { ...textStyles.caption, color: colors.textMuted, marginTop: 6 },

  feedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  feedbackText: { ...textStyles.caption, flex: 1 },

  footerNote: { ...textStyles.caption, color: colors.textMuted, marginTop: spacing.lg },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});

const reference = `BR-${Math.floor(1000 + Math.random() * 9000)}`;

    navigation.replace(ROUTES.BUG_REPORT_SUBMITTED, {
      reference,
      category: form.category,
      severity: form.severity,
    });
