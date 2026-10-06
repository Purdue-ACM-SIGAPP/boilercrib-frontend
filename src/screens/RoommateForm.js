import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import ScreenHeader from "../components/ScreenHeader";
import AsyncView from "../components/AsyncView";
import Card from "../components/Card";
import TextField from "../components/TextField";
import Button from "../components/Button";
import FilterChip from "../components/FilterChip";
import ConfirmDialog from "../components/ConfirmDialog";
import useAsync from "../hooks/useAsync";
import useSubmit from "../hooks/useSubmit";
import {
  AGE_MAX,
  AGE_MIN,
  CLASS_YEARS,
  createRoommate,
  deleteRoommate,
  getUserRoommate,
  updateRoommate,
} from "../api/roommates";
import { BUILDING_TYPES, getBuildings } from "../api/buildings";
import { useSession } from "../context/SessionContext";
import { buildingLabel } from "../utils/format";
import ROUTES from "../navigation/routes";
import { colors, fontWeights, spacing, textStyles } from "../theme";

const toForm = (bio) => ({
  name: bio?.name ?? "",
  gender: bio?.gender ?? "",
  age: bio?.age != null ? String(bio.age) : "",
  year: bio?.year ?? null,
  major: bio?.major ?? "",
  interests: (bio?.interests ?? []).join(", "),
  preferredBuildingIds: bio?.preferredBuildingIds ?? [],
  contactInfo: bio?.contactInfo ?? "",
  bio: bio?.bio ?? "",
});

// "Hiking, chess,  " -> ["Hiking", "chess"]
const parseList = (text) =>
  text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

// Creates the signed-in user's roommate bio, or edits it if they already have one.
export default function RoommateFormScreen({ navigation }) {
  const { userId } = useSession();
  const existing = useAsync(() => (userId ? getUserRoommate(userId) : Promise.resolve(null)), [userId]);
  const buildings = useAsync(() => getBuildings(), []);
  const [form, setForm] = useState(toForm());
  const [errors, setErrors] = useState({});
  const [confirming, setConfirming] = useState(false);

  const save = useSubmit(
    useCallback((payload) => (existing.data ? updateRoommate(payload) : createRoommate(payload)), [existing.data])
  );
  const remove = useSubmit(deleteRoommate);

  useEffect(() => {
    if (existing.data) setForm(toForm(existing.data));
  }, [existing.data]);

  const housing = useMemo(
    () =>
      (buildings.data ?? [])
        .filter((b) => b.buildingType === BUILDING_TYPES.HOUSING)
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    [buildings.data]
  );

  const field = (key) => ({
    value: form[key],
    error: errors[key],
    onChangeText: (text) => setForm((prev) => ({ ...prev, [key]: text })),
  });

  const toggleBuilding = (id) =>
    setForm((prev) => ({
      ...prev,
      preferredBuildingIds: prev.preferredBuildingIds.includes(id)
        ? prev.preferredBuildingIds.filter((b) => b !== id)
        : [...prev.preferredBuildingIds, id],
    }));

  const leave = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate(ROUTES.ROOMMATE_LIST));

  const handleSave = async () => {
    const age = form.age.trim() ? Number(form.age) : null;
    const nextErrors = {
      name: form.name.trim() ? null : "Please enter your name.",
      age:
        age === null || (Number.isInteger(age) && age >= AGE_MIN && age <= AGE_MAX)
          ? null
          : `Enter an age from ${AGE_MIN} to ${AGE_MAX}.`,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const saved = await save.submit({
      ...existing.data,
      userId,
      name: form.name.trim(),
      gender: form.gender.trim() || null,
      age,
      year: form.year,
      major: form.major.trim() || null,
      interests: parseList(form.interests),
      preferredBuildingIds: form.preferredBuildingIds,
      contactInfo: form.contactInfo.trim() || null,
      bio: form.bio.trim() || null,
    });
    if (saved) leave();
  };

  const handleDelete = async () => {
    if (await remove.submit(existing.data.id)) {
      setConfirming(false);
      leave();
    }
  };

  if (!userId) {
    return (
      <Screen>
        <ScreenHeader title="Roommate bio" />
        <Card variant="secondary">
          <Text style={styles.body}>Log in to create your roommate bio.</Text>
          <Button title="Log in" icon="login" size="sm" style={styles.cardButton} onPress={() => navigation.navigate(ROUTES.LOGIN)} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader title={existing.data ? "Edit roommate bio" : "Create roommate bio"} />
      <AsyncView state={existing} isEmpty={() => false} loadingMessage="Loading your bio…">
        {() => (
          <>
            <TextField label="Name" placeholder="Purdue Pete" {...field("name")} />
            <TextField label="Gender" placeholder="Optional" {...field("gender")} />
            <TextField label="Age" placeholder="19" keyboardType="number-pad" {...field("age")} />

            <Text style={styles.label}>Year</Text>
            <View style={styles.chips}>
              {CLASS_YEARS.map((label, index) => (
                <FilterChip
                  key={label}
                  label={label}
                  selected={form.year === index}
                  onPress={() => setForm((prev) => ({ ...prev, year: prev.year === index ? null : index }))}
                />
              ))}
            </View>

            <TextField label="Major" placeholder="Computer Science" {...field("major")} />
            <TextField
              label="Hobbies and interests"
              placeholder="Hiking, chess, cooking"
              hint="Separate with commas."
              {...field("interests")}
            />

            <Text style={styles.label}>Buildings you'd like to live in</Text>
            {housing.length ? (
              <View style={styles.chips}>
                {housing.map((b) => (
                  <FilterChip
                    key={b.id}
                    label={buildingLabel(b)}
                    selected={form.preferredBuildingIds.includes(b.id)}
                    onPress={() => toggleBuilding(b.id)}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.hint}>{buildings.loading ? "Loading buildings…" : "No buildings to choose from."}</Text>
            )}

            <TextField
              label="Contact info"
              placeholder="Email, phone, or social handle"
              autoCapitalize="none"
              hint="Shown when someone taps Contact on your bio."
              {...field("contactInfo")}
            />
            <TextField label="About you" placeholder="Sleep schedule, study habits, what you're looking for" multiline {...field("bio")} />

            {save.error ? <Text style={styles.error}>{save.error}</Text> : null}
            <Button
              title={existing.data ? "Save changes" : "Create bio"}
              size="lg"
              fullWidth
              loading={save.submitting}
              onPress={handleSave}
            />
            {existing.data ? (
              <Button
                title="Delete bio"
                icon="trash-can-outline"
                variant="ghost"
                style={styles.delete}
                onPress={() => {
                  remove.setError(null);
                  setConfirming(true);
                }}
              />
            ) : null}
          </>
        )}
      </AsyncView>
      <ConfirmDialog
        visible={confirming}
        title="Delete your roommate bio?"
        message="Other students won't be able to find you anymore."
        confirmLabel="Delete"
        destructive
        loading={remove.submitting}
        error={remove.error}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { ...textStyles.caption, fontWeight: fontWeights.semibold, color: colors.text, marginBottom: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  hint: { ...textStyles.small, color: colors.textMuted, marginBottom: spacing.md },
  body: { ...textStyles.body, color: colors.text },
  cardButton: { marginTop: spacing.md },
  error: { ...textStyles.caption, color: colors.warning, marginBottom: spacing.sm },
  delete: { alignSelf: "center", marginTop: spacing.sm },
});
