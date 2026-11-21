# geracaotech-fullstack
Aplicação Full Stack desenvolvida como projeto prático do programa Geração Tech 4.0.

## Executar localmente

1. Configure o MySQL e crie o banco de dados para a aplicação (ex.: `geracaotech`).
2. Copie `backend/.env.example` para `backend/.env` e preencha as credenciais do seu MySQL e o `JWT_SECRET`.
3. Copie `frontend/.env.example` para `frontend/.env` se a API não estiver em `http://localhost:3000`.
4. No terminal da pasta `backend`:
   ```bash
   npm install
   npm run db:sync   # Cria as tabelas no MySQL
   npm run db:seed   # Popula o banco com categorias e 8 produtos de teste
   npm run dev       # Inicia o servidor na porta 3000
   ```
5. Em outro terminal, na pasta `frontend`:
   ```bash
   npm install
   npm run dev       # Inicia a aplicação React (http://localhost:5173)
   ```

O backend usa a origem `http://localhost:5173` por padrão. Para outra origem do frontend, ajuste `FRONTEND_ORIGIN` em `backend/.env`.
