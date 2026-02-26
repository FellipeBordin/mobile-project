import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { API_URL } from "../../../src/config/api";

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    const payload = {
      note: note.trim(),
      amount: Number(amount),
    };

    if (!payload.note || !Number.isFinite(payload.amount) || payload.amount <= 0) {
      Alert.alert("Atenção", "Preencha a descrição e um valor maior que 0.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/vehicles/${id}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        Alert.alert("Erro", data?.error ?? `Falha (${res.status})`);
        return;
      }

      Alert.alert("Sucesso", "Gasto adicionado!");
      router.back(); // volta pro detalhe
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 48, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "900" }}>Adicionar gasto</Text>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "800" }}>Nome/descrição</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ex: Pintura, Banco rasgado..."
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

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "800" }}>Valor</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Ex: 800"
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
      </View>

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
        <Text style={{ color: "#fff", fontWeight: "900" }}>
          {loading ? "Salvando..." : "Salvar gasto"}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={{ paddingVertical: 10, alignItems: "center" }}>
        <Text style={{ color: "#111", fontWeight: "800" }}>Cancelar</Text>
      </Pressable>
    </View>
  );
}
