/* eslint-disable react-hooks/exhaustive-deps */
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { apiFetch } from "../../../src/lib/api";

type ExpenseDTO = {
  id: string;
  vehicleId: string;
  amount: number;
  note?: string | null;
  createdAt: string;
};

export default function EditExpenseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExpense();
  }, [id]);

  async function loadExpense() {
    if (!id) return;

    try {
      setLoading(true);

      const res = await apiFetch(`/api/expenses/${id}`);
      const data = (await res.json().catch(() => null)) as ExpenseDTO | null;

      if (res.status === 401) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        router.replace("/login");
        return;
      }

      if (!res.ok || !data) {
        Alert.alert("Erro", (data as any)?.error ?? `Falha (${res.status})`);
        return;
      }

      setNote(data.note ?? "");
      setAmount(String(data.amount));
    } catch {
      Alert.alert("Erro", "Não foi possível carregar a despesa.");
    } finally {
      setLoading(false);
    }
  }

  async function saveExpense() {
    const payload = {
      note: note.trim(),
      amount: Number(amount),
    };

    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      Alert.alert("Atenção", "Preencha o valor da despesa corretamente.");
      return;
    }

    try {
      setSaving(true);

      const res = await apiFetch(`/api/expenses/${id}`, {
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

      Alert.alert("Sucesso", "Despesa atualizada com sucesso.");
      router.back();
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar a despesa.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f5f5f5",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Carregando...</Text>
      </View>
    );
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
            <MaterialIcons name="edit-note" size={28} color="#2563eb" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: "800" }}>
              Editar despesa
            </Text>
            <Text style={{ color: "#666", marginTop: 4 }}>
              Corrija descrição ou valor da despesa
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
          disabled={saving}
          style={{
            marginTop: 4,
            backgroundColor: "#111",
            paddingVertical: 12,
            borderRadius: 14,
            opacity: saving ? 0.6 : 1,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            {saving ? "Salvando..." : "Salvar alterações"}
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
