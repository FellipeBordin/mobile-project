import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { apiFetch } from "../../../src/lib/api";

export default function NewExpenseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function saveExpense() {
    const payload = {
      vehicleId: id,
      note: note.trim(),
      amount: Number(amount),
    };

    if (
      !payload.vehicleId ||
      !Number.isFinite(payload.amount) ||
      payload.amount <= 0
    ) {
      Alert.alert("Atenção", "Preencha o valor da despesa corretamente.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/expenses", {
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

      Alert.alert("Sucesso", "Despesa cadastrada!");
      router.back();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a despesa.");
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
            <MaterialIcons name="receipt-long" size={28} color="#2563eb" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: "800" }}>
              Nova despesa
            </Text>
            <Text style={{ color: "#666", marginTop: 4 }}>
              Informe o que foi gasto e o valor
            </Text>
          </View>
        </View>

        <Field
          label="Descrição"
          value={note}
          onChangeText={setNote}
          placeholder="Ex: banco rasgado, pneu furado"
        />

        <Field
          label="Valor gasto"
          value={amount}
          onChangeText={setAmount}
          placeholder="Digite o valor gasto"
          keyboardType="numeric"
        />

        <Pressable
          onPress={saveExpense}
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
            {loading ? "Salvando..." : "Salvar despesa"}
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
