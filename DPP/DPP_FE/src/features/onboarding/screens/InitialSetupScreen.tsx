// Initial setup screen component for onboarding
import React from "react";
import { View, Text, Button } from "react-native";
import { useAuthStore } from "../../../store/auth.store";

export function InitialSetupScreen() {
  const setOnboardingDone = useAuthStore((s) => s.setOnboardingDone);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Initial Setup</Text>
      <Button title="Finish Onboarding" onPress={() => setOnboardingDone(true)} />
    </View>
  );
}
