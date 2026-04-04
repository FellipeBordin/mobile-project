---

# 📱 README — MOBILE (Expo)

```md
# 📱 Vehicle Finance App

Aplicativo mobile para controle de compra, despesas e venda de veículos.

---

## 🚀 Tecnologias

- React Native
- Expo
- Expo Router
- AsyncStorage
- API REST (Next.js)

---

## 📦 Instalação

```bash
git clone <SEU_REPO>
cd vehicle-mobile-app
npm install

Configuração

No arquivo:

src/config/api.ts

Configure:

export const API_URL = "http://SEU_IP:3000";

Exemplo:

export const API_URL = "http://192.168.0.10:3000";
▶️ Rodar o app
npx expo start

Depois:

pressione w → web
ou escaneie QR no celular
🔐 Funcionalidades
Cadastro de usuário
Login
Logout
Cadastro de veículos
Adicionar despesas
Marcar veículo como vendido
Cálculo automático de lucro
Exclusão de veículo
🧠 Arquitetura
API separada (Next.js)
Token salvo no AsyncStorage
Rotas protegidas com layout global
Comunicação via fetch + Authorization
```
