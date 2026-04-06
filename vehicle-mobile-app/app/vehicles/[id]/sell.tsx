import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { apiFetch } from "../../../src/lib/api";

export default function SellVehicleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [soldPrice, setSoldPrice] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function confirmSale() {
    const payload = {
      soldPrice: Number(soldPrice),
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
    };

    if (!id || !Number.isFinite(payload.soldPrice) || payload.soldPrice <= 0) {
      Alert.alert("Atenção", "Digite um valor de venda válido.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch(`/api/vehicles/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
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

      Alert.alert("Sucesso", "Veículo marcado como vendido!");
      router.replace(`/vehicles/${id}`);
    } catch {
      Alert.alert("Erro", "Não foi possível concluir a venda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 16,
        paddingTop: 48,
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: "#dcfce7",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="sell" size={28} color="#15803d" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: "800" }}>
              Marcar como vendido
            </Text>
            <Text style={{ color: "#666", marginTop: 4 }}>
              Informe o valor final e os dados do comprador
            </Text>
          </View>
        </View>

        <Field
          label="Valor de venda"
          value={soldPrice}
          onChangeText={setSoldPrice}
          placeholder="Digite o valor da venda"
          keyboardType="numeric"
        />

        <Field
          label="Nome do comprador"
          value={buyerName}
          onChangeText={setBuyerName}
          placeholder="Digite o nome do comprador"
        />

        <Field
          label="Telefone do comprador"
          value={buyerPhone}
          onChangeText={setBuyerPhone}
          placeholder="Digite o telefone"
          keyboardType="phone-pad"
        />

        <Pressable
          onPress={confirmSale}
          disabled={loading}
          style={{
            marginTop: 4,
            backgroundColor: "#16a34a",
            paddingVertical: 12,
            borderRadius: 14,
            opacity: loading ? 0.6 : 1,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            {loading ? "Salvando..." : "Confirmar venda"}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.replace(`/vehicles/${id}`)}
        style={{ paddingVertical: 14, alignItems: "center", marginTop: 14 }}
      >
        <Text style={{ color: "#111", fontWeight: "700" }}>Cancelar</Text>
      </Pressable>
    </View>
  );
}

function Field(props: any) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontWeight: "700", color: "#333" }}>{props.label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#999"
        style={{
          borderWidth: 1,
          borderColor: "#e5e5e5",
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: "#f9fafb",
        }}
      />
    </View>
  );
}
