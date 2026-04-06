import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { getToken } from "../src/lib/session";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const token = await getToken();
        const loggedIn = !!token;

        if (!mounted) return;

        const isAuthPage =
          pathname === "/login" ||
          pathname === "/register" ||
          pathname === "/forgot-password";

        if (!loggedIn && !isAuthPage) {
          router.replace("/login");
          return;
        }

        if (loggedIn && isAuthPage) {
          router.replace("/");
          return;
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          gap: 12,
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ color: "#666" }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="new" />
      <Stack.Screen name="vehicles/[id]" />
      <Stack.Screen name="vehicles/[id]/expense" />
      <Stack.Screen name="vehicles/[id]/sell" />
      <Stack.Screen name="expenses/[id]/edit" />
    </Stack>
  );
}
