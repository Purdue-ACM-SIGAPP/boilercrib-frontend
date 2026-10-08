import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import Screen from "../components/Screen";
import ScreenHeader from "../components/ScreenHeader";
import AsyncView from "../components/AsyncView";
import BuildingCard from "../components/BuildingCard";
import SearchBar from "../components/SearchBar";
import SortDropdown from "../components/SortDropdown";
import useAsync from "../hooks/useAsync";
import useFavorites from "../hooks/useFavorites";
import { getBuildings } from "../api/buildings";
import { getAverageRating } from "../api/reviews";
import { CAMPUS_CENTER } from "../constants/campus";
import ROUTES from "../navigation/routes";
import { spacing, textStyles, colors } from "../theme";

// Several sorts can be active at once; options sharing a `group` are mutually exclusive.
const SORTS = [
  { key: "favorites", label: "Favorites" },
  { key: "name", label: "Name A-Z" },
  { key: "rating", label: "Top Rated" },
  { key: "priceAsc", label: "Price Low to High", group: "price" },
  { key: "priceDesc", label: "Price High to Low", group: "price" },
  { key: "proximity", label: "Proximity to Class" },
];

// Cheapest room cost, or null when the building has no room pricing.
function lowestPrice(building) {
  const costs = (building.rooms ?? []).map((room) => room.cost).filter((cost) => cost != null);
  return costs.length ? Math.min(...costs) : null;
}

// Straight-line distance from central campus (no class locations exist yet); null without coordinates.
function distanceFromCampus({ latitude, longitude }) {
  if (latitude == null || longitude == null) return null;
  return Math.hypot(latitude - CAMPUS_CENTER.latitude, (longitude - CAMPUS_CENTER.longitude) * Math.cos((latitude * Math.PI) / 180));
}

// Sorts by value (descending when desc), keeping buildings with no value at the end.
const byValue = (valueOf, desc = false) => (a, b) => {
  const va = valueOf(a);
  const vb = valueOf(b);
  if (va == null || vb == null) return (va == null) - (vb == null);
  return desc ? vb - va : va - vb;
};

const byName = (a, b) => (a.name ?? "").localeCompare(b.name ?? "");

export default function BuildingListScreen({ navigation }) {
  // Active sort keys in priority order (first picked wins; later ones break ties).
  const [sortBy, setSortBy] = useState(["name"]);
  const [query, setQuery] = useState("");
  const buildings = useAsync(() => getBuildings(), []);
  const { favorites, toggleFavorite } = useFavorites();

  // { [buildingId]: average (1-10) | null }; unrated or failed lookups are null.
  const ratings = useAsync(async () => {
    const entries = await Promise.all(
      (buildings.data ?? []).map((building) => getAverageRating(building.id).then((average) => [building.id, average], () => [building.id, null]))
    );
    return Object.fromEntries(entries);
  }, [buildings.data]);

  const filteredAndSorted = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    const byRating = ratings.data ?? {};
    const comparators = {
      name: byName,
      rating: byValue((building) => byRating[building.id], true),
      priceAsc: byValue(lowestPrice),
      priceDesc: byValue(lowestPrice, true),
      proximity: byValue(distanceFromCampus),
      // Favorites first; non-favorites count as missing so they follow in name order.
      favorites: byValue((building) => (favorites.has(building.id) ? 0 : null)),
    };
    // Name order first so ties and buildings missing data stay alphabetical.
    const list = (buildings.data ?? [])
      .filter((building) =>
        !searchTerm || [building.name, building.acronym, building.address].some((value) =>
          value?.toLowerCase().includes(searchTerm)
        )
      )
      .sort(byName);

    return list.sort((a, b) => {
      for (const key of sortBy) {
        const result = comparators[key](a, b);
        if (result) return result;
      }
      return 0;
    });
  }, [buildings.data, query, ratings.data, sortBy, favorites]);

  const renderItem = ({ item }) => (
    <BuildingCard
      building={item}
      rating={ratings.data ? ratings.data[item.id] ?? null : undefined}
      favorite={favorites.has(item.id)}
      onToggleFavorite={() => toggleFavorite(item.id)}
      onPress={() => navigation.navigate(ROUTES.BUILDING_DETAIL, { id: item.id })}
      onDirections={() => navigation.navigate(ROUTES.MAP, { latitude: item.latitude, longitude: item.longitude })}
    />
  );

  return (
    <Screen>
      <ScreenHeader title="Buildings" showBack={false} />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search buildings by name or acronym"
        style={styles.search}
      />
      <SortDropdown options={SORTS} values={sortBy} onChange={setSortBy} />
      <AsyncView state={buildings} loadingMessage="Loading buildings..." emptyMessage="No buildings yet." emptyIcon="office-building-outline">
        {() => (
          <FlatList
            data={filteredAndSorted}
            extraData={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.empty}>No buildings match your search.</Text>}
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
  search: { marginBottom: spacing.md },
  list: { paddingBottom: spacing.lg },
  empty: { ...textStyles.body, color: colors.textMuted, textAlign: "center", paddingTop: spacing.xl },
});
