import React from "react";
import { NavigationContainer } from "@react-navigation/native";

type Props = { children: React.ReactNode };

export function AppProviders({ children }: Props) {
    return <NavigationContainer>{children}</NavigationContainer>;
}
