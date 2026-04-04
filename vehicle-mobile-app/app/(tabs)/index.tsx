import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { apiFetch } from "../../src/lib/api";
import { clearSession, getToken, getUser } from "../../src/lib/session";

type VehicleDTO = {
  id: string;
  name: string;
  plate: string;
  status: "IN_STOCK" | "SOLD";
  purchasePrice: number;
  totalExpenses: number;
  totalInvested: number;
  soldPrice: number | null;
  profit: number | null;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function VehiclesHome() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<VehicleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  const load = useCallback(async () => {
    setError(null);

    const token = await getToken();

    if (!token) {
      router.replace("/");
      return;
    }

    const user = await getUser();
    setUserName(user?.name ?? "");

    await apiFetch("/api/auth/claim-legacy", {
      method: "POST",
    });

    const res = await apiFetch("/api/vehicles");

    if (res.status === 401) {
      await clearSession();
      router.replace("/");
      return;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET /api/vehicles ${res.status} ${text}`);
    }

    const data = (await res.json()) as VehicleDTO[];
    setVehicles(data);
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      load()
        .catch((e) => setError(String(e?.message ?? e)))
        .finally(() => setLoading(false));
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    try {
      await load();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setRefreshing(false);
    }
  }
  async function logoutNow() {
    await clearSession();
    router.replace("/login");
  }

  function handleLogout() {
    Alert.alert("Sair da conta", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          logoutNow().catch(() => {
            Alert.alert("Erro", "Não foi possível sair da conta.");
          });
        },
      },
    ]);
  }

  const summary = useMemo(() => {
    const totalVehicles = vehicles.length;
    const inStockCount = vehicles.filter((v) => v.status === "IN_STOCK").length;
    const soldCount = vehicles.filter((v) => v.status === "SOLD").length;

    const totalInvested = vehicles.reduce((acc, v) => acc + v.totalInvested, 0);
    const totalProfit = vehicles.reduce((acc, v) => acc + (v.profit ?? 0), 0);

    return {
      totalVehicles,
      inStockCount,
      soldCount,
      totalInvested,
      totalProfit,
    };
  }, [vehicles]);

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        paddingTop: 48,
        backgroundColor: "#f5f5f5",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 28, fontWeight: "800" }}>Veículos</Text>
          <Text style={{ color: "#666", marginTop: 4 }}>
            {userName
              ? `Olá, ${userName}`
              : "Controle de compra, despesas e lucro"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => router.push("/new")}
            style={{
              backgroundColor: "#111",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>+ Novo</Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={{
              backgroundColor: "#dc2626",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Sair</Text>
          </Pressable>
        </View>
      </View>

      <View
        style={{
          marginTop: 16,
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: 14,
          borderWidth: 1,
          borderColor: "#e5e5e5",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "800" }}>Resumo geral</Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <SummaryCard
            label="Veículos"
            value={String(summary.totalVehicles)}
            icon="directions-car"
            bg="#eff6ff"
            iconColor="#2563eb"
          />
          <SummaryCard
            label="Em estoque"
            value={String(summary.inStockCount)}
            icon="inventory"
            bg="#f3f4f6"
            iconColor="#374151"
          />
          <SummaryCard
            label="Vendidos"
            value={String(summary.soldCount)}
            icon="task-alt"
            bg="#dcfce7"
            iconColor="#16a34a"
          />
        </View>

        <View style={{ gap: 8 }}>
          <SummaryRow
            label="Total investido"
            value={formatBRL(summary.totalInvested)}
          />
          <SummaryRow
            label="Lucro total"
            value={formatBRL(summary.totalProfit)}
            valueColor={summary.totalProfit >= 0 ? "#0f766e" : "#b91c1c"}
          />
        </View>
      </View>

      {error && (
        <View
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#fecaca",
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ color: "#b91c1c", fontWeight: "700" }}>Erro</Text>
          <Text style={{ color: "#b91c1c", marginTop: 4 }}>{error}</Text>
        </View>
      )}

      {loading ? (
        <Text style={{ marginTop: 16 }}>Carregando...</Text>
      ) : (
        <FlatList
          style={{ marginTop: 16 }}
          data={vehicles}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            const isSold = item.status === "SOLD";
            const profit = item.profit ?? 0;

            return (
              <Pressable
                onPress={() => router.push(`/vehicles/${item.id}`)}
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e5e5",
                  borderRadius: 18,
                  padding: 14,
                  marginBottom: 12,
                  backgroundColor: "#fff",
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 3,
                  gap: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: isSold ? "#dcfce7" : "#eff6ff",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <MaterialIcons
                        name="directions-car"
                        size={24}
                        color={isSold ? "#15803d" : "#2563eb"}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: "800" }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: "#666", marginTop: 2 }}>
                        Placa: {item.plate}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 999,
                      backgroundColor: isSold ? "#dcfce7" : "#f3f4f6",
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "800",
                        color: isSold ? "#166534" : "#374151",
                      }}
                    >
                      {isSold ? "Vendido" : "Em estoque"}
                    </Text>
                  </View>
                </View>

                <View style={{ gap: 6 }}>
                  <Row label="Compra" value={formatBRL(item.purchasePrice)} />
                  <Row label="Gastos" value={formatBRL(item.totalExpenses)} />
                  <Row
                    label="Total investido"
                    value={formatBRL(item.totalInvested)}
                    bold
                  />

                  {isSold && item.soldPrice != null ? (
                    <>
                      <Row
                        label="Venda"
                        value={formatBRL(item.soldPrice)}
                        bold
                      />
                      <Row
                        label="Resultado"
                        value={formatBRL(profit)}
                        bold
                        valueColor={profit >= 0 ? "#0f766e" : "#b91c1c"}
                      />
                    </>
                  ) : (
                    <Row
                      label="Resultado"
                      value="Aguardando venda"
                      bold
                      valueColor="#6b7280"
                    />
                  )}
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View
              style={{
                marginTop: 16,
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#e5e5e5",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                Nenhum veículo cadastrado.
              </Text>
              <Text style={{ marginTop: 6, color: "#666" }}>
                Toque em “+ Novo” para cadastrar o primeiro veículo.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  bg,
  iconColor,
}: {
  label: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  bg: string;
  iconColor: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bg,
        borderRadius: 14,
        padding: 12,
        gap: 8,
      }}
    >
      <MaterialIcons name={icon} size={22} color={iconColor} />
      <Text style={{ fontSize: 18, fontWeight: "800" }}>{value}</Text>
      <Text style={{ fontSize: 12, color: "#555" }}>{label}</Text>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  valueColor = "#111",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: "#444" }}>{label}</Text>
      <Text style={{ fontWeight: "800", color: valueColor }}>{value}</Text>
    </View>
  );
}

function Row({
  label,
  value,
  bold,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: "#333" }}>{label}</Text>
      <Text
        style={{
          fontWeight: bold ? "800" : "600",
          color: valueColor ?? "#111",
        }}
      >
        {value}
      </Text>
    </View>
  );
}
