// Onboarding stack navigation component
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "./types";

import { StoryScreen } from "../features/onboarding/screens/StoryScreen";
import { LoginScreen } from "../features/onboarding/screens/LoginScreen";
import { InitialSetupScreen } from "../features/onboarding/screens/InitialSetupScreen";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Story" component={StoryScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="InitialSetup" component={InitialSetupScreen} />
        </Stack.Navigator>
    );
}
