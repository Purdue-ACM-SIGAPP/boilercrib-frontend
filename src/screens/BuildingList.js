import { useMemo, useState } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import ScreenHeader from "../components/ScreenHeader";
import AsyncView from "../components/AsyncView";
import BuildingCard from "../components/BuildingCard";
import FilterChip from "../components/FilterChip";
import useAsync from "../hooks/useAsync";
import { getBuildings } from "../api/buildings";
import { getAverageRating } from "../api/reviews";
import ROUTES from "../navigation/routes";
import { colors, spacing, textStyles } from "../theme";

const SORTS = [
  { key: "name", label: "Name A–Z" },
  { key: "rating", label: "Top rated" },
];

export default function BuildingListScreen({ navigation }) {
  const [sortBy, setSortBy] = useState("name");
  const buildings = useAsync(() => getBuildings(), []);

  // { [buildingId]: average (1–10) | null }; unrated or failed lookups are null.
  const ratings = useAsync(async () => {
    const entries = await Promise.all(
      (buildings.data ?? []).map((b) => getAverageRating(b.id).then((avg) => [b.id, avg], () => [b.id, null]))
    );
    return Object.fromEntries(entries);
  }, [buildings.data]);

  const sorted = useMemo(() => {
    const list = [...(buildings.data ?? [])];
    const byRating = ratings.data ?? {};
    return sortBy === "rating"
      ? list.sort((a, b) => (byRating[b.id] ?? -1) - (byRating[a.id] ?? -1))
      : list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [buildings.data, ratings.data, sortBy]);

  const renderItem = ({ item }) => (
    <BuildingCard
      building={item}
      rating={ratings.data ? ratings.data[item.id] ?? null : undefined}
      onPress={() => navigation.navigate(ROUTES.BUILDING_DETAIL, { id: item.id })}
      onDirections={() => navigation.navigate(ROUTES.MAP, { latitude: item.latitude, longitude: item.longitude })}
    />
  );

  return (
    <Screen>
      <ScreenHeader title="Buildings" showBack={false} />
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by</Text>
        {SORTS.map(({ key, label }) => (
          <FilterChip key={key} label={label} selected={sortBy === key} onPress={() => setSortBy(key)} />
        ))}
      </View>
      <AsyncView state={buildings} loadingMessage="Loading buildings…" emptyMessage="No buildings yet." emptyIcon="office-building-outline">
        {() => (
          <FlatList
            data={sorted}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshing={buildings.loading}
            onRefresh={buildings.refetch}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sortRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  sortLabel: { ...textStyles.caption, color: colors.textMuted },
  list: { paddingBottom: spacing.lg },
});
