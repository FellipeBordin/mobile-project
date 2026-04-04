/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { apiFetch } from "../../src/lib/api";

type Expense = {
  id: string;
  amount: number;
  note?: string | null;
  createdAt: string;
};

type Vehicle = {
  id: string;
  name: string;
  plate: string;
  status: "IN_STOCK" | "SOLD";
  purchasePrice: number;
  purchaseDate?: string | null;
  soldPrice?: number | null;
  soldDate?: string | null;
  totalExpenses: number;
  totalInvested: number;
  profit?: number | null;
  createdAt: string;
  expenses: Expense[];
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("pt-BR");
}

export default function VehicleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    if (!id) return;

    try {
      setLoading(true);

      const res = await apiFetch(`/api/vehicles/${id}`);
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        router.replace("/login");
        return;
      }

      if (!res.ok) {
        Alert.alert("Erro", data?.error ?? `Falha (${res.status})`);
        return;
      }

      setVehicle(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o veículo.");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [id]),
  );

  function handleDelete() {
    if (!vehicle) return;

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Tem certeza que deseja excluir "${vehicle.name}"?`,
      );

      if (confirmed) {
        deleteVehicle();
      }

      return;
    }

    Alert.alert(
      "Excluir veículo",
      `Tem certeza que deseja excluir "${vehicle.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: deleteVehicle,
        },
      ],
    );
  }

  async function deleteVehicle() {
    if (!vehicle) return;

    try {
      setDeleting(true);

      const res = await apiFetch(`/api/vehicles/${vehicle.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        router.replace("/login");
        return;
      }

      if (!res.ok) {
        Alert.alert("Erro", data?.error ?? `Falha (${res.status})`);
        return;
      }

      Alert.alert("Sucesso", "Veículo excluído com sucesso.");
      router.replace("/");
    } catch {
      Alert.alert("Erro", "Não foi possível excluir o veículo.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700" }}>
          Veículo não encontrado.
        </Text>

        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 16,
            backgroundColor: "#111",
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const isSold = vehicle.status === "SOLD";

  const profitColor =
    vehicle.profit == null
      ? "#111"
      : vehicle.profit > 0
        ? "#0f766e"
        : vehicle.profit < 0
          ? "#b91c1c"
          : "#111";

  const profitBg =
    vehicle.profit == null
      ? "#f3f4f6"
      : vehicle.profit > 0
        ? "#ccfbf1"
        : vehicle.profit < 0
          ? "#fee2e2"
          : "#f3f4f6";

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 48,
        gap: 14,
        backgroundColor: "#f5f5f5",
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: "#e5e5e5",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
          gap: 14,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12, flex: 1 }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: isSold ? "#dcfce7" : "#eff6ff",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons
                name="directions-car"
                size={28}
                color={isSold ? "#15803d" : "#2563eb"}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: "800" }}>
                {vehicle.name}
              </Text>
              <Text style={{ color: "#666", marginTop: 4 }}>
                Placa: {vehicle.plate}
              </Text>
            </View>
          </View>

          <View
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 999,
              backgroundColor: isSold ? "#dcfce7" : "#f3f4f6",
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

        <View style={{ flexDirection: "row", gap: 12 }}>
          <MiniInfoCard
            icon="calendar-month"
            label="Data da compra"
            value={formatDate(vehicle.purchaseDate)}
            bg="#f9fafb"
            iconColor="#374151"
          />
          <MiniInfoCard
            icon="sell"
            label="Data da venda"
            value={formatDate(vehicle.soldDate)}
            bg={isSold ? "#dcfce7" : "#f9fafb"}
            iconColor={isSold ? "#15803d" : "#374151"}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <MiniInfoCard
            icon="receipt-long"
            label="Qtd. despesas"
            value={String(vehicle.expenses.length)}
            bg="#eff6ff"
            iconColor="#2563eb"
          />
          <MiniInfoCard
            icon="account-balance-wallet"
            label="Investido"
            value={formatBRL(vehicle.totalInvested)}
            bg="#f9fafb"
            iconColor="#374151"
          />
        </View>

        <View style={{ gap: 8 }}>
          <DetailRow
            label="Preço de compra"
            value={formatBRL(vehicle.purchasePrice)}
          />
          <DetailRow
            label="Total de despesas"
            value={formatBRL(vehicle.totalExpenses)}
          />
          <DetailRow
            label="Total investido"
            value={formatBRL(vehicle.totalInvested)}
            bold
          />
          <DetailRow
            label="Valor de venda"
            value={
              vehicle.soldPrice != null ? formatBRL(vehicle.soldPrice) : "-"
            }
            bold
          />
        </View>

        <View
          style={{
            backgroundColor: profitBg,
            borderRadius: 16,
            padding: 14,
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 13, color: "#555" }}>Lucro / Prejuízo</Text>
          <Text style={{ fontSize: 22, fontWeight: "800", color: profitColor }}>
            {vehicle.profit != null ? formatBRL(vehicle.profit) : "-"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
          <Pressable
            onPress={() => router.push(`/vehicles/${vehicle.id}/expense`)}
            style={{
              flex: 1,
              backgroundColor: "#111",
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>
              Adicionar despesa
            </Text>
          </Pressable>

          {!isSold && (
            <Pressable
              onPress={() => router.push(`/vehicles/${vehicle.id}/sell`)}
              style={{
                flex: 1,
                backgroundColor: "#16a34a",
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>
                Marcar vendido
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={handleDelete}
          disabled={deleting}
          style={{
            backgroundColor: "#dc2626",
            paddingVertical: 12,
            borderRadius: 14,
            alignItems: "center",
            opacity: deleting ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            {deleting ? "Excluindo..." : "Excluir veículo"}
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 16,
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
        <Text style={{ fontSize: 18, fontWeight: "800" }}>Despesas</Text>

        {vehicle.expenses.length === 0 ? (
          <View
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: "#e5e5e5",
            }}
          >
            <Text style={{ color: "#666" }}>Nenhuma despesa cadastrada.</Text>
          </View>
        ) : (
          vehicle.expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              note={expense.note}
              amount={expense.amount}
              createdAt={expense.createdAt}
            />
          ))
        )}
      </View>

      <Pressable
        onPress={() => router.back()}
        style={{ paddingVertical: 12, alignItems: "center" }}
      >
        <Text style={{ color: "#111", fontWeight: "700" }}>Voltar</Text>
      </Pressable>
    </ScrollView>
  );
}

function MiniInfoCard({
  icon,
  label,
  value,
  bg,
  iconColor,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
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
      <Text style={{ fontSize: 15, fontWeight: "800", color: "#111" }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: "#555" }}>{label}</Text>
    </View>
  );
}

function DetailRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View
      style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}
    >
      <Text style={{ color: "#444" }}>{label}</Text>
      <Text style={{ fontWeight: bold ? "800" : "600", color: "#111" }}>
        {value}
      </Text>
    </View>
  );
}

function ExpenseItem({
  note,
  amount,
  createdAt,
}: {
  note?: string | null;
  amount: number;
  createdAt: string;
}) {
  const formattedDate = formatDate(createdAt);

  return (
    <View
      style={{
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e5e5",
        borderRadius: 14,
        padding: 12,
        gap: 6,
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
        <Text
          style={{ flex: 1, fontSize: 15, fontWeight: "700", color: "#111" }}
        >
          {note?.trim() ? note : "Despesa sem descrição"}
        </Text>

        <Text style={{ fontSize: 15, fontWeight: "800", color: "#b91c1c" }}>
          {formatBRL(amount)}
        </Text>
      </View>

      <Text style={{ fontSize: 12, color: "#666" }}>{formattedDate}</Text>
    </View>
  );
}
