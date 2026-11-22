# 🛍️ Digital Store - Frontend

Interface web do e-commerce **Digital Store**, desenvolvida com **React 19**, **Vite** e estilizada 100% com **Tailwind CSS**, seguindo fielmente o protótipo do Figma e os requisitos da documentação.

---

## 🚀 Tecnologias Utilizadas

- **React 19**
- **Vite 7** (Build tool rápida)
- **Tailwind CSS 3.4** (Estilização utilitária e responsiva)
- **React Router 7** (Gerenciamento de rotas SPA)

---

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior recomendada)
- **npm** (gerenciador de pacotes)

---

## ⚙️ Passo a Passo para Rodar Localmente

### 1. Acessar a pasta do frontend
No terminal, a partir da raiz do repositório:
```bash
cd frontend
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Crie o arquivo `.env` a partir do `.env.example` executando:

```bash
# No Windows (CMD ou PowerShell):
copy .env.example .env

# No Linux ou macOS:
cp .env.example .env
```

Conteúdo padrão do `.env`:
```env
VITE_API_URL=http://localhost:3000
```

> 💡 **Fallback Automático (Zero Configuração Obrigatória):**  
> A aplicação tenta se comunicar com a API local na porta `3000`. Se o backend não estiver rodando no momento do teste, o frontend ativa **automaticamente um modo offline resiliente com dados mock**, permitindo navegar pelas páginas, testar filtros e visualizar os produtos normalmente.

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Pronto! Acesse no seu navegador:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local com Hot Reload em `http://localhost:5173` |
| `npm run build` | Compila os arquivos otimizados para produção na pasta `dist/` |
| `npm run preview` | Executa uma prévia local da versão de produção compilada |

---

## 🧭 Principais Rotas da Aplicação

- **`/` (Home):** Hero banner carrossel, coleções em destaque, ícones de categorias com rolagem touch no mobile, produtos em alta e oferta especial Air Jordan.
- **`/produtos` (Catálogo):** Listagem com barra lateral de filtros (marca, categoria, gênero, estado), contador dinâmico e ordenação por relevância/preço.
- **`/product/:id` (Detalhes):** Galeria de fotos com miniaturas, seleção de tamanhos/cores e bloco de compra.
