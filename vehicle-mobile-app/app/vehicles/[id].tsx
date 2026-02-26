"use client";

import { Link, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { API_URL } from "../../src/config/api";
type ExpenseDTO = {
  id: string;
  note: string;
  amount: number;
  createdAt: string;
};

type VehicleDetailDTO = {
  id: string;
  name: string;
  plate: string;
  status: "IN_STOCK" | "SOLD";
  purchasePrice: number;
  totalExpenses: number;
  totalInvested: number;
  soldPrice: number | null;
  profit: number | null;
  expenses: ExpenseDTO[];
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<VehicleDetailDTO | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const res = await fetch(`${API_URL}/api/vehicles/${id}`);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET /api/vehicles/${id} ${res.status} ${text}`);
    }
    const json = (await res.json()) as VehicleDetailDTO;
    setData(json);
  }

 useFocusEffect(
  useCallback(() => {
    if (!id) return;

    load().catch((e) =>
      setError(String(e?.message ?? e))
    );
  }, [id])
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

  if (!data) {
    return (
      <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Carregando...</Text>
        {error && <Text style={{ marginTop: 12, color: "#b91c1c" }}>{error}</Text>}
      </View>
    );
  }

  const isSold = data.status === "SOLD";
  const profit = data.profit ?? 0;

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: "900" }}>{data.name}</Text>
          <Text style={{ color: "#666", marginTop: 2 }}>Placa: {data.plate}</Text>
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

      <View style={{ marginTop: 16, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 16, padding: 14, backgroundColor: "#fff" }}>
        <Row label="Compra" value={formatBRL(data.purchasePrice)} />
        <Row label="Gastos" value={formatBRL(data.totalExpenses)} />
        <Row label="Total investido" value={formatBRL(data.totalInvested)} bold />
        {isSold && data.soldPrice != null && (
          <>
            <Row label="Venda" value={formatBRL(data.soldPrice)} bold />
            <Row label="Resultado" value={formatBRL(profit)} bold valueColor={profit >= 0 ? "#0f766e" : "#b91c1c"} />
          </>
        )}
      </View>

      <View style={{ marginTop: 16, flexDirection: "row", gap: 10 }}>
        <Link href={`/vehicles/${data.id}/add-expense`} asChild>
          <Pressable style={{ flex: 1, backgroundColor: "#111", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "900" }}>+ Adicionar gasto</Text>
          </Pressable>
        </Link>

        {!isSold && (
          <Link href={`/vehicles/${data.id}/sell`} asChild>
            <Pressable style={{ flex: 1, borderWidth: 1, borderColor: "#111", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}>
              <Text style={{ color: "#111", fontWeight: "900" }}>Marcar vendido</Text>
            </Pressable>
          </Link>
        )}
      </View>

      <Text style={{ marginTop: 18, fontSize: 16, fontWeight: "900" }}>Gastos</Text>

      <FlatList
        style={{ marginTop: 10 }}
        data={data.expenses}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={{ color: "#666", marginTop: 8 }}>Nenhum gasto lançado.</Text>}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
            <Text style={{ fontWeight: "900" }}>{item.note}</Text>
            <Text style={{ color: "#111", marginTop: 2 }}>{formatBRL(item.amount)}</Text>
          </View>
        )}
      />
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
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
      <Text style={{ color: "#333" }}>{label}</Text>
      <Text style={{ fontWeight: bold ? "900" : "700", color: valueColor ?? "#111" }}>{value}</Text>
    </View>
  );
}