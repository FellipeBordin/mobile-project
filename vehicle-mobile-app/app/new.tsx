import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { API_URL } from "../src/config/api";

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

    if (!payload.name || !payload.plate || !Number.isFinite(payload.purchasePrice)) {
      Alert.alert("Atenção", "Preencha nome, placa e preço corretamente.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        Alert.alert("Erro", data?.error ?? `Falha (${res.status})`);
        return;
      }

      Alert.alert("Sucesso", "Veículo cadastrado!");
      router.replace("/"); // volta para lista
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>Novo veículo</Text>

      <Field label="Nome" value={name} onChangeText={setName} placeholder="Ex: Gol 1.6" />
      <Field
        label="Placa"
        value={plate}
        onChangeText={setPlate}
        placeholder="ABC1D23"
        autoCapitalize="characters"
      />
      <Field
        label="Preço de compra"
        value={purchasePrice}
        onChangeText={setPurchasePrice}
        placeholder="25000"
        keyboardType="numeric"
      />

      <Pressable
        onPress={save}
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
        <Text style={{ color: "#fff", fontWeight: "800" }}>
          {loading ? "Salvando..." : "Salvar"}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={{ paddingVertical: 10, alignItems: "center" }}>
        <Text style={{ color: "#111", fontWeight: "700" }}>Cancelar</Text>
      </Pressable>
    </View>
  );
}

function Field(props: any) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontWeight: "700" }}>{props.label}</Text>
      <TextInput
        {...props}
        style={{
          borderWidth: 1,
          borderColor: "#e5e5e5",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: "#fff",
        }}
      />
    </View>
  );
}