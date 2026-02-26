import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { API_URL } from "../../../src/config/api";

function parseMoneyBR(value: string): number {
  // aceita "800", "800.50" e "800,50"
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

export default function SellVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [soldPrice, setSoldPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function sell() {
    const price = parseMoneyBR(soldPrice.trim());

    if (!Number.isFinite(price) || price < 0) {
      Alert.alert("Atenção", "Informe um valor de venda válido (>= 0).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/vehicles/${id}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soldPrice: price }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        Alert.alert("Erro", data?.error ?? `Falha (${res.status})`);
        return;
      }

      Alert.alert("Sucesso", "Veículo marcado como vendido!");
      router.back(); // volta pro detalhe
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "900" }}>Marcar como vendido</Text>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "800" }}>Preço de venda</Text>
        <TextInput
          value={soldPrice}
          onChangeText={setSoldPrice}
          placeholder="Ex: 35000 ou 35.000,00"
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: "#e5e5e5",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: "#fff",
          }}
        />
        <Text style={{ color: "#666", fontSize: 12 }}>
          Aceita vírgula ou ponto.
        </Text>
      </View>

      <Pressable
        onPress={sell}
        disabled={loading}
        style={{
          marginTop: 8,
          backgroundColor: "#111",
          paddingVertical: 12,
          borderRadius: 12,
          opacity: loading ? 0.6 : 1,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "900" }}>
          {loading ? "Salvando..." : "Confirmar venda"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        style={{ paddingVertical: 10, alignItems: "center" }}
      >
        <Text style={{ color: "#111", fontWeight: "800" }}>Cancelar</Text>
      </Pressable>
    </View>
  );
}