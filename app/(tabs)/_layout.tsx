import React, { useState } from "react";
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { CustomTabBar } from "@/components/navigation/CustomTabBar";

export const DrawerContext = React.createContext({
  isDrawerOpen: false,
  setIsDrawerOpen: (value: boolean) => {},
});

export default function TabLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <DrawerContext.Provider value={{ isDrawerOpen, setIsDrawerOpen }}>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0F0F0F" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="map" />
          <Stack.Screen name="inspiration" />
          <Stack.Screen name="chat" />
        </Stack>

        {!isDrawerOpen && <CustomTabBar />}
      </View>
    </DrawerContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
});
