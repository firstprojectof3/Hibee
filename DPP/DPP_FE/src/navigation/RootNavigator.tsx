// Root navigator component
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
<<<<<<< HEAD
import { OnboardingStack } from "./OnboardingStack";
import { MainTabs } from "./MainTabs";
=======
import { Maintabs } from "./Maintabs";
>>>>>>> 08566d6ed7608b3fc30869a43716f20a3280fc3c
import { useAuthStore } from "../store/auth.store";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    const isAuthed = useAuthStore((state) => state.isAuthed);
    const onboardingDone = useAuthStore((state) => state.onboardingDone);

    const initialRouteName: keyof RootStackParamList =
        isAuthed && onboardingDone ? "Main" : "Onboarding";

        return (
            <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Onboarding" component={OnboardingStack} />
<<<<<<< HEAD
                <Stack.Screen name="Main" component={MainTabs} />
=======
                <Stack.Screen name="Main" component={Maintabs} />
>>>>>>> 08566d6ed7608b3fc30869a43716f20a3280fc3c
            </Stack.Navigator>
        );
}