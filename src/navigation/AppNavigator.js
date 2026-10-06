import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ROUTES from "./routes";
import IntroScreen from "../screens/Intro";
import LoginScreen from "../screens/Login";
import SignupScreen from "../screens/Signup";
import MapScreen from "../screens/Map";
import BuildingListScreen from "../screens/BuildingList";
import BuildingDetailScreen from "../screens/BuildingDetail";
import NewsAndEventsScreen from "../screens/NewsAndEvents";
import EventDetailScreen from "../screens/EventDetail";
import EventFormScreen from "../screens/EventForm";
import RoommateListScreen from "../screens/RoommateList";
import RoommateDetailScreen from "../screens/RoommateDetail";
import RoommateFormScreen from "../screens/RoommateForm";
import ProfileScreen from "../screens/Profile";
import NotFoundScreen from "../screens/NotFound";
import { colors, sizes } from "../theme";

const Root = createStackNavigator();
const Tabs = createBottomTabNavigator();
const NewsStack = createStackNavigator();
const BuildingsStack = createStackNavigator();
const RoommatesStack = createStackNavigator();

const stackOptions = { headerShown: false };

function NewsTab() {
  return (
    <NewsStack.Navigator screenOptions={stackOptions}>
      <NewsStack.Screen name={ROUTES.NEWS} component={NewsAndEventsScreen} options={{ title: "News & Events" }} />
      <NewsStack.Screen name={ROUTES.EVENT_FORM} component={EventFormScreen} options={{ title: "Event" }} />
      <NewsStack.Screen name={ROUTES.EVENT_DETAIL} component={EventDetailScreen} options={{ title: "Event" }} />
    </NewsStack.Navigator>
  );
}

function BuildingsTab() {
  return (
    <BuildingsStack.Navigator screenOptions={stackOptions}>
      <BuildingsStack.Screen name={ROUTES.BUILDING_LIST} component={BuildingListScreen} options={{ title: "Buildings" }} />
      <BuildingsStack.Screen name={ROUTES.BUILDING_DETAIL} component={BuildingDetailScreen} options={{ title: "Building" }} />
    </BuildingsStack.Navigator>
  );
}

function RoommatesTab() {
  return (
    <RoommatesStack.Navigator screenOptions={stackOptions}>
      <RoommatesStack.Screen name={ROUTES.ROOMMATE_LIST} component={RoommateListScreen} options={{ title: "Roommates" }} />
      <RoommatesStack.Screen name={ROUTES.ROOMMATE_FORM} component={RoommateFormScreen} options={{ title: "Roommate bio" }} />
      <RoommatesStack.Screen name={ROUTES.ROOMMATE_DETAIL} component={RoommateDetailScreen} options={{ title: "Roommate" }} />
    </RoommatesStack.Navigator>
  );
}

const TAB_ICONS = {
  [ROUTES.NEWS_TAB]: "newspaper-variant-outline",
  [ROUTES.MAP]: "map-marker-outline",
  [ROUTES.BUILDINGS_TAB]: "office-building-outline",
  [ROUTES.ROOMMATES_TAB]: "account-group-outline",
  [ROUTES.PROFILE]: "account-circle-outline",
};

function MainTabs() {
  return (
    <Tabs.Navigator
      initialRouteName={ROUTES.MAP}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name={TAB_ICONS[route.name]} size={sizes.iconMd} color={color} />
        ),
      })}
    >
      <Tabs.Screen name={ROUTES.NEWS_TAB} component={NewsTab} options={{ title: "News" }} />
      <Tabs.Screen name={ROUTES.MAP} component={MapScreen} options={{ title: "Map" }} />
      <Tabs.Screen name={ROUTES.BUILDINGS_TAB} component={BuildingsTab} options={{ title: "Buildings" }} />
      <Tabs.Screen name={ROUTES.ROOMMATES_TAB} component={RoommatesTab} options={{ title: "Roommates" }} />
      <Tabs.Screen name={ROUTES.PROFILE} component={ProfileScreen} options={{ title: "Profile" }} />
    </Tabs.Navigator>
  );
}

// The welcome screen is the app's root; `events/edit` and `roommates/edit` are listed before
// the `:id` routes so the forms aren't parsed as ids.
const linking = {
  prefixes: [],
  config: {
    screens: {
      [ROUTES.INTRO]: "",
      [ROUTES.TABS]: {
        screens: {
          [ROUTES.MAP]: "map",
          [ROUTES.NEWS_TAB]: {
            screens: {
              [ROUTES.NEWS]: "events",
              [ROUTES.EVENT_FORM]: "events/edit",
              [ROUTES.EVENT_DETAIL]: "events/:id",
            },
          },
          [ROUTES.BUILDINGS_TAB]: {
            screens: {
              [ROUTES.BUILDING_LIST]: "buildings",
              [ROUTES.BUILDING_DETAIL]: "buildings/:id",
            },
          },
          [ROUTES.ROOMMATES_TAB]: {
            screens: {
              [ROUTES.ROOMMATE_LIST]: "roommates",
              [ROUTES.ROOMMATE_FORM]: "roommates/edit",
              [ROUTES.ROOMMATE_DETAIL]: "roommates/:id",
            },
          },
          [ROUTES.PROFILE]: "profile",
        },
      },
      [ROUTES.LOGIN]: "login",
      [ROUTES.SIGNUP]: "signup",
      [ROUTES.NOT_FOUND]: "*",
    },
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer
      linking={linking}
      documentTitle={{ formatter: (options) => `Boiler Rooms · ${options?.title ?? ""}` }}
    >
      <Root.Navigator initialRouteName={ROUTES.INTRO} screenOptions={stackOptions}>
        <Root.Screen name={ROUTES.INTRO} component={IntroScreen} options={{ title: "Welcome" }} />
        <Root.Screen name={ROUTES.TABS} component={MainTabs} options={{ title: "Boiler Rooms" }} />
        <Root.Screen name={ROUTES.LOGIN} component={LoginScreen} options={{ title: "Log in" }} />
        <Root.Screen name={ROUTES.SIGNUP} component={SignupScreen} options={{ title: "Sign up" }} />
        <Root.Screen name={ROUTES.NOT_FOUND} component={NotFoundScreen} options={{ title: "Not found" }} />
      </Root.Navigator>
    </NavigationContainer>
  );
}
