import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import ScreenHeader from "../components/ScreenHeader";
import AsyncView from "../components/AsyncView";
import Card from "../components/Card";
import TextField from "../components/TextField";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import SideMenu from "../components/SideMenu";
import ReviewCard from "../components/ReviewCard";
import useAsync from "../hooks/useAsync";
import useSubmit from "../hooks/useSubmit";
import useRefetchOnFocus from "../hooks/useRefetchOnFocus";
import { deleteUser, getUser, updateUser } from "../api/users";
import { getUserReviews } from "../api/reviews";
import { getBuildings } from "../api/buildings";
import { useSession } from "../context/SessionContext";
import { buildingLabel } from "../utils/format";
import ROUTES from "../navigation/routes";
import { colors, sizes, fontWeights, spacing, textStyles } from "../theme";

const toForm = (user) => ({
  name: user?.name ?? "",
  phoneNumber: user?.phoneNumber ?? "",
});

export default function ProfileScreen({ navigation }) {
  const { userId, signOut } = useSession();
  const user = useAsync(() => (userId ? getUser(userId) : Promise.resolve(null)), [userId]);
  const reviews = useAsync(() => (userId ? getUserReviews(userId) : Promise.resolve([])), [userId]);
  const buildings = useAsync(() => getBuildings(), []);
  useRefetchOnFocus(reviews.refetch);

  const buildingNames = useMemo(
    () => Object.fromEntries((buildings.data ?? []).map((b) => [b.id, buildingLabel(b)])),
    [buildings.data]
  );

  const [form, setForm] = useState(toForm());
  const [nameError, setNameError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Sidebar buttons opened from the hamburger icon. Add more entries here.
  const menuItems = [
    { title: "Map", icon: "map-marker-outline", onPress: () => navigation.navigate(ROUTES.MAP) },
    { title: "Buildings", icon: "office-building-outline", onPress: () => navigation.navigate(ROUTES.BUILDINGS_TAB) },
    { title: "News & events", icon: "newspaper-variant-outline", onPress: () => navigation.navigate(ROUTES.NEWS_TAB) },
  ];

  // Editing keeps the account's username and password as they were created.
  const save = useSubmit(
    useCallback(
      async (values) => {
        const updated = { ...user.data, id: userId, ...values };
        await updateUser(updated);
        return updated;
      },
      [userId, user.data]
    )
  );
  const remove = useSubmit(deleteUser);

  useEffect(() => setForm(toForm(user.data)), [user.data]);

  const update = (key) => (value) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const name = form.name.trim();
    setNameError(name ? null : "Please enter your name.");
    if (!name) return;
    const result = await save.submit({ name, phoneNumber: form.phoneNumber.trim() });
    if (!result) return;
    setSaved(true);
    user.setData(result);
  };

  // The building screen lives in the Buildings tab; `initial: false` keeps the list underneath for Back.
  const openBuilding = (id) =>
    navigation.navigate(ROUTES.BUILDINGS_TAB, { screen: ROUTES.BUILDING_DETAIL, params: { id }, initial: false });

  const handleDelete = async () => {
    if (await remove.submit(userId)) {
      setConfirming(false);
      signOut();
      navigation.navigate(ROUTES.INTRO);
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader
        title={userId ? "Your profile" : "Profile"}
        showBack={false}
        right={<Button icon="menu" variant="ghost" accessibilityLabel="Open menu" onPress={() => setMenuOpen(true)} />}
      />
      <View style={styles.avatar}>
        <MaterialCommunityIcons name="account-circle" size={sizes.avatar} color={colors.primary} />
      </View>

      {userId ? (
        <AsyncView state={user} isEmpty={() => false} loadingMessage="Loading profile…">
          {() => (
            <>
              <Text style={styles.meta}>Username: {user.data?.username ?? "—"}</Text>
              <TextField label="Name" placeholder="Purdue Pete" value={form.name} onChangeText={update("name")} error={nameError} />
              <TextField
                label="Phone number"
                placeholder="(765) 555-0100"
                keyboardType="phone-pad"
                value={form.phoneNumber}
                onChangeText={update("phoneNumber")}
              />
              {save.error ? <Text style={styles.error}>{save.error}</Text> : null}
              {saved ? <Text style={styles.success}>Profile saved.</Text> : null}
              <Button title="Save changes" size="lg" fullWidth loading={save.submitting} onPress={handleSave} />
              <Button
                title="Delete account"
                icon="trash-can-outline"
                variant="ghost"
                style={styles.delete}
                onPress={() => {
                  remove.setError(null);
                  setConfirming(true);
                }}
              />
            </>
          )}
        </AsyncView>
      ) : null}

      {userId ? (
        <>
          <Text style={styles.sectionTitle}>Your reviews</Text>
          <AsyncView
            state={reviews}
            loadingMessage="Loading your reviews…"
            emptyMessage="You haven't reviewed any housing yet."
            emptyIcon="comment-outline"
          >
            {(list) =>
              list.map((review) => (
                <View key={review.id}>
                  <Pressable accessibilityRole="link" onPress={() => openBuilding(review.buildingId)} style={styles.buildingLink}>
                    <MaterialCommunityIcons name="office-building-outline" size={sizes.iconSm} color={colors.primary} />
                    <Text style={styles.buildingName}>{buildingNames[review.buildingId] || "Building"}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={sizes.iconSm} color={colors.textMuted} />
                  </Pressable>
                  <ReviewCard review={review} />
                </View>
              ))
            }
          </AsyncView>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Sign-in</Text>
      <Card variant="secondary">
        {userId ? (
          <>
            <Text style={styles.body}>Signed in as {user.data?.username ?? user.data?.name ?? "your account"}.</Text>
            <Button title="Sign out" icon="logout" variant="outline" size="sm" style={styles.cardButton} onPress={signOut} />
          </>
        ) : (
          <>
            <Text style={styles.body}>You're browsing as a guest. Log in to post events and manage your profile.</Text>
            <View style={styles.cardButtons}>
              <Button title="Log in" icon="login" size="sm" onPress={() => navigation.navigate(ROUTES.LOGIN)} />
              <Button
                title="Sign up"
                variant="outline"
                size="sm"
                onPress={() => navigation.navigate(ROUTES.SIGNUP)}
              />
            </View>
          </>
        )}
      </Card>

      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} items={menuItems} />

      <ConfirmDialog
        visible={confirming}
        title="Are you sure?"
        message="Your account will be gone forever!"
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
  avatar: { alignItems: "center", marginBottom: spacing.md },
  error: { ...textStyles.caption, color: colors.warning, marginBottom: spacing.sm },
  success: { ...textStyles.caption, fontWeight: fontWeights.semibold, color: colors.primary, marginBottom: spacing.sm },
  delete: { alignSelf: "center", marginTop: spacing.sm },
  sectionTitle: { ...textStyles.heading, color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
  body: { ...textStyles.body, color: colors.text },
  meta: { ...textStyles.caption, color: colors.textMuted, marginTop: spacing.xs },
  buildingLink: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs },
  buildingName: { ...textStyles.subheading, color: colors.primary, flexShrink: 1 },
  cardButton: { marginTop: spacing.md },
  cardButtons: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
});
