// 앱 시작 시, 로딩-로그인 온보딩 완료 여부 확인하고 루트 네비로 진입
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
<<<<<<< HEAD
import { RootNavigator } from "../../navigation/RootNavigator";
import { useAuthStore } from "../../store/auth.store";
=======
import { RootNavigator } from "../navigation/RootNavigator";
import { useAuthStore } from "../stores/auth.store";
>>>>>>> 08566d6ed7608b3fc30869a43716f20a3280fc3c

export function AppBootstrap() {
    const [ready, setReady] = useState(false);
    const hydrate = useAuthStore((s) => s.hydrate);

    useEffect(() => {
        (async () => {
            await hydrate(); // 인증 상태 복원 
            setReady(true);
        })();
    }, [hydrate]);
    
    if (!ready) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }
    
    return <RootNavigator />;  
}