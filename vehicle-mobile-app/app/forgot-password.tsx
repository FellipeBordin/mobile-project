import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { apiFetch } from "../src/lib/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    const normalizedEmail = email.trim().toLowerCase();
    const password = newPassword.trim();
    const confirm = confirmPassword.trim();

    if (!normalizedEmail || !password || !confirm) {
      Alert.alert("Atenção", "Preencha e-mail, nova senha e confirmação.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Atenção", "A confirmação da senha não confere.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: normalizedEmail,
          newPassword: password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        Alert.alert("Erro", data?.error ?? `Falha (${res.status})`);
        return;
      }

      Alert.alert("Sucesso", "Senha alterada com sucesso.");
      router.replace("/login");
    } catch {
      Alert.alert("Erro", "Não foi possível resetar a senha.");
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
            <MaterialIcons name="lock-reset" size={28} color="#2563eb" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: "800" }}>
              Resetar senha
            </Text>
            <Text style={{ color: "#666", marginTop: 4 }}>
              Informe seu e-mail e defina uma nova senha
            </Text>
          </View>
        </View>

        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="Digite seu e-mail"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Field
          label="Nova senha"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Digite a nova senha"
          secureTextEntry
        />

        <Field
          label="Confirmar nova senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repita a nova senha"
          secureTextEntry
        />

        <Pressable
          onPress={handleResetPassword}
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
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.replace("/login")}
        style={{ paddingVertical: 14, alignItems: "center", marginTop: 14 }}
      >
        <Text style={{ color: "#111", fontWeight: "700" }}>
          Voltar para login
        </Text>
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
