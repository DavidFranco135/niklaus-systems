# Niklaus Systems — Portfólio + Admin

Sistema completo de portfólio com painel administrativo integrado ao Firebase.

## Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Estilo:** TailwindCSS v4 + Framer Motion
- **Backend:** Firebase (Auth + Firestore + Storage)
- **Deploy:** Qualquer hosting estático (Vercel, Firebase Hosting, Netlify)

---

## Setup Rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Criar usuário admin no Firebase
Acesse o [Firebase Console](https://console.firebase.google.com) → Seu projeto →
**Authentication → Users → Add user** e cadastre:
- Email: `niklausadm@gmail.com`
- Senha: `135135` (ou outra de sua preferência)

### 3. Configurar Firestore
No Firebase Console → Firestore Database → Criar banco em **modo produção**.

Copie as regras de segurança abaixo em **Regras**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /settings/company {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /gallery/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Configurar Firebase Storage
No Firebase Console → Storage → Criar bucket.

Regras sugeridas:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gallery/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /covers/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Rodar o projeto
```bash
npm run dev
```

---

## Estrutura do Projeto

```
src/
├── firebase.ts          # Configuração Firebase
├── AuthContext.tsx       # Autenticação com Firebase Auth
├── App.tsx              # Rotas da aplicação
├── LandingPage.tsx      # Portfólio público
├── Login.tsx            # Tela de login
├── AdminLayout.tsx      # Layout do painel admin
├── AdminDashboard.tsx   # Dashboard com stats
├── AdminGallery.tsx     # Galeria de projetos
├── AdminClients.tsx     # Gestão de clientes
├── AdminServices.tsx    # Gestão de serviços/projetos
├── AdminFinance.tsx     # Financeiro
├── AdminSettings.tsx    # Configurações + troca de senha
├── types.ts             # Tipos TypeScript
└── lib/
    └── utils.ts         # Helpers (uploadFile, cn, formatBRL)
```

## Coleções Firestore

| Coleção | Descrição |
|---------|-----------|
| `clients` | Clientes cadastrados |
| `services` | Projetos/serviços com valores |
| `gallery` | Projetos do portfólio (imagens/vídeos) |
| `settings/company` | Configurações gerais (foto de capa) |

---

## Deploy no Vercel

```bash
npm run build
# faça upload da pasta dist/ no Vercel ou conecte o repositório
```
