import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { API_URL } from "../../src/config/api";

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
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function VehiclesHome() {
  const [vehicles, setVehicles] = useState<VehicleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const res = await fetch(`${API_URL}/api/vehicles`);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET /api/vehicles ${res.status} ${text}`);
    }
    const data = (await res.json()) as VehicleDTO[];
    setVehicles(data);
  }

  useEffect(() => {
    load()
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "800" }}>Veículos</Text>

        <Link href="/new" asChild>
          <Pressable style={{ backgroundColor: "#111", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>+ Novo</Text>
          </Pressable>
        </Link>
      </View>

      {error && (
        <View style={{ marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#fecaca", backgroundColor: "#fff" }}>
          <Text style={{ color: "#b91c1c", fontWeight: "700" }}>Erro</Text>
          <Text style={{ color: "#b91c1c", marginTop: 4 }}>{error}</Text>
          <Text style={{ color: "#666", marginTop: 6 }}>
            Verifique se o backend está rodando e se o celular está na mesma rede Wi-Fi.
          </Text>
        </View>
      )}

      {loading ? (
        <Text style={{ marginTop: 16 }}>Carregando...</Text>
      ) : (
        <FlatList
          style={{ marginTop: 16 }}
          data={vehicles}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const isSold = item.status === "SOLD";
            const profit = item.profit ?? 0;

            return (
              <Link href={`/vehicles/${item.id}`} asChild>
                <Pressable
                  style={{
                    borderWidth: 1,
                    borderColor: "#e5e5e5",
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 12,
                    backgroundColor: "#fff",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: "800" }}>{item.name}</Text>
                      <Text style={{ color: "#666", marginTop: 2 }}>Placa: {item.plate}</Text>
                    </View>

                    <View
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 999,
                        backgroundColor: isSold ? "#eee" : "#d1fae5",
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "800", color: isSold ? "#333" : "#065f46" }}>
                        {isSold ? "Vendido" : "Em estoque"}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginTop: 12, gap: 6 }}>
                    <Row label="Compra" value={formatBRL(item.purchasePrice)} />
                    <Row label="Gastos" value={formatBRL(item.totalExpenses)} />
                    <Row label="Total investido" value={formatBRL(item.totalInvested)} bold />
                    {isSold && item.soldPrice != null && (
                      <>
                        <Row label="Venda" value={formatBRL(item.soldPrice)} bold />
                        <Row
                          label="Resultado"
                          value={formatBRL(profit)}
                          bold
                          valueColor={profit >= 0 ? "#0f766e" : "#b91c1c"}
                        />
                      </>
                    )}
                  </View>
                </Pressable>
              </Link>
            );
          }}
          ListEmptyComponent={<Text style={{ marginTop: 16, color: "#666" }}>Nenhum veículo cadastrado.</Text>}
        />
      )}
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
      <Text style={{ fontWeight: bold ? "800" : "600", color: valueColor ?? "#111" }}>{value}</Text>
    </View>
  );
}
