import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { apiFetch } from "../src/lib/api";

export default function NewVehicle() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    const payload = {
      name: name.trim(),
      plate: plate.trim().toUpperCase(),
      purchasePrice: Number(purchasePrice),
    };

    if (
      !payload.name ||
      !payload.plate ||
      !Number.isFinite(payload.purchasePrice) ||
      payload.purchasePrice <= 0
    ) {
      Alert.alert("Atenção", "Preencha nome, placa e preço corretamente.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/vehicles", {
        method: "POST",
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

      Alert.alert("Sucesso", "Veículo cadastrado!");
      router.replace("/");
    } catch {
      Alert.alert("Erro", "Não foi possível conectar com a API.");
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
              backgroundColor: "#eff6ff",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="directions-car" size={28} color="#2563eb" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: "800" }}>
              Novo veículo
            </Text>
            <Text style={{ color: "#666", marginTop: 4 }}>
              Cadastre um veículo para controlar compra, despesas e venda
            </Text>
          </View>
        </View>

        <Field
          label="Nome"
          value={name}
          onChangeText={setName}
          placeholder="Ex: Gol 1.6"
        />

        <Field
          label="Placa"
          value={plate}
          onChangeText={setPlate}
          placeholder="Digite a placa do veículo"
          autoCapitalize="characters"
        />

        <Field
          label="Preço de compra"
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          placeholder="Digite o valor pago pelo veículo"
          keyboardType="numeric"
        />

        <Pressable
          onPress={save}
          disabled={loading}
          style={{
            marginTop: 4,
            backgroundColor: "#111",
            paddingVertical: 12,
            borderRadius: 14,
            opacity: loading ? 0.6 : 1,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            {loading ? "Salvando..." : "Salvar veículo"}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.back()}
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
