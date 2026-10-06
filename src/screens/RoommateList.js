import React, { useMemo, useState } from "react";
import { FlatList, ScrollView, Text, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import ScreenHeader from "../components/ScreenHeader";
import AsyncView from "../components/AsyncView";
import EmptyView from "../components/EmptyView";
import Card from "../components/Card";
import Button from "../components/Button";
import FilterChip from "../components/FilterChip";
import SearchBar from "../components/SearchBar";
import RoommateCard from "../components/RoommateCard";
import useAsync from "../hooks/useAsync";
import useRefetchOnFocus from "../hooks/useRefetchOnFocus";
import { CLASS_YEARS, getRoommates, getUserRoommate } from "../api/roommates";
import { useSession } from "../context/SessionContext";
import { compatibility } from "../utils/roommates";
import ROUTES from "../navigation/routes";
import { colors, spacing, textStyles } from "../theme";

// The API only supports exact-match filters, so free-text search runs client-side.
const matches = (bio, query) => {
  const needle = query.trim().toLowerCase();
  return (
    !needle ||
    [bio.name, bio.major, bio.bio, ...(bio.interests ?? [])].some((v) => v?.toLowerCase().includes(needle))
  );
};

export default function RoommateListScreen({ navigation }) {
  const { userId } = useSession();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState(null);
  const [gender, setGender] = useState(null);
  const [sortBy, setSortBy] = useState("match");

  const bios = useAsync(() => getRoommates(), []);
  const myBio = useAsync(() => (userId ? getUserRoommate(userId) : Promise.resolve(null)), [userId]);
  useRefetchOnFocus(bios.refetch);
  useRefetchOnFocus(myBio.refetch);

  // Gender is free text, so the chips are whatever people have entered.
  const genders = useMemo(() => {
    const seen = new Map();
    (bios.data ?? []).forEach((b) => b.gender && seen.set(b.gender.toLowerCase(), b.gender));
    return [...seen.values()].sort();
  }, [bios.data]);

  const visible = useMemo(() => {
    const list = (bios.data ?? [])
      .filter((b) => b.userId !== userId)
      .filter((b) => year == null || b.year === year)
      .filter((b) => gender == null || b.gender?.toLowerCase() === gender.toLowerCase())
      .filter((b) => matches(b, query))
      .map((b) => ({ bio: b, match: compatibility(myBio.data, b) }));

    return sortBy === "match" && myBio.data
      ? list.sort((a, b) => b.match.score - a.match.score)
      : list.sort((a, b) => (a.bio.name ?? "").localeCompare(b.bio.name ?? ""));
  }, [bios.data, myBio.data, userId, year, gender, query, sortBy]);

  const openForm = () => navigation.navigate(userId ? ROUTES.ROOMMATE_FORM : ROUTES.LOGIN);

  return (
    <Screen>
      <ScreenHeader
        title="Find Roommates"
        showBack={false}
        right={
          <Button
            title={myBio.data ? "My bio" : "Create bio"}
            icon={myBio.data ? "account-edit-outline" : "plus"}
            size="sm"
            onPress={openForm}
          />
        }
      />

      {!myBio.loading && !myBio.data ? (
        <Card variant="secondary">
          <Text style={styles.body}>
            {userId
              ? "Create your roommate bio so others can find you and you can see how well you match."
              : "Log in to create a roommate bio and see how well you match."}
          </Text>
        </Card>
      ) : null}

      <SearchBar value={query} onChangeText={setQuery} placeholder="Search name, major, interests" style={styles.search} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chips}>
        <Text style={styles.chipLabel}>Year</Text>
        <FilterChip label="Any" selected={year == null} onPress={() => setYear(null)} />
        {CLASS_YEARS.map((label, index) => (
          <FilterChip key={label} label={label} selected={year === index} onPress={() => setYear(index)} />
        ))}
      </ScrollView>

      {genders.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chips}>
          <Text style={styles.chipLabel}>Gender</Text>
          <FilterChip label="Any" selected={gender == null} onPress={() => setGender(null)} />
          {genders.map((g) => (
            <FilterChip key={g} label={g} selected={gender === g} onPress={() => setGender(g)} />
          ))}
        </ScrollView>
      ) : null}

      {myBio.data ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chips}>
          <Text style={styles.chipLabel}>Sort by</Text>
          <FilterChip label="Best match" selected={sortBy === "match"} onPress={() => setSortBy("match")} />
          <FilterChip label="Name A–Z" selected={sortBy === "name"} onPress={() => setSortBy("name")} />
        </ScrollView>
      ) : null}

      <AsyncView state={bios} loadingMessage="Loading roommates…" emptyMessage="No roommate bios yet." emptyIcon="account-group-outline">
        {() =>
          visible.length === 0 ? (
            <EmptyView message="No one matches these filters." icon="magnify" />
          ) : (
            <FlatList
              data={visible}
              keyExtractor={(item) => item.bio.id}
              renderItem={({ item }) => (
                <RoommateCard
                  bio={item.bio}
                  match={item.match}
                  onPress={() => navigation.navigate(ROUTES.ROOMMATE_DETAIL, { id: item.bio.id })}
                />
              )}
              refreshing={bios.loading}
              onRefresh={bios.refetch}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )
        }
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { ...textStyles.body, color: colors.text },
  search: { marginBottom: spacing.sm },
  chipScroll: { flexGrow: 0, marginBottom: spacing.sm },
  chips: { alignItems: "center", gap: spacing.sm },
  chipLabel: { ...textStyles.caption, color: colors.textMuted },
  list: { paddingBottom: spacing.lg },
});
