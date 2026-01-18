// Login screen component for onboarding
import React from "react";
import { View, Text, Button } from "react-native";
import { useAuthStore } from "../../../store/auth.store";

export function LoginScreen() {
  const setToken = useAuthStore((s) => s.setToken);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Login</Text>
      <Button title="Mock Login" onPress={() => setToken("mock-token")} />
    </View>
  );
}
