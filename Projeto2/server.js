require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.SERVER_PORT || 4242;

let users = [
  { id: 1, name: "Ana", email: "ana@email.com" },
  { id: 2, name: "João", email: "joao@email.com" }
];

// GET /users - Listar todos os usuários
app.get("/users", (req, res) => {
  res.status(200).json({ data: users });
});

//GET /users/:id - Obter um usuário por ID
app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "Utilizador não encontrado" });
  }

  res.status(200).json({ data: user });
});

// POST /users - Criar um novo usuário
app.post("/users", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Nome e email são obrigatórios" });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email
  };

  users.push(newUser);
  res.status(201).json({ data: newUser });
});


// PUT /users/:id - Atualizar um usuário existente
app.put("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;

  const Index = users.findIndex((u) => u.id === id);

  if (Index === -1) {
    return res.status(404).json({ message: "Utilizador não encontrado" });
  }

  if (!name || !email) {
    return res.status(400).json({ message: "Nome e email são obrigatórios" });
  }

  users[Index] = { id, name, email };
  res.status(200).json({ data: users[Index] });
});

// DELETE /users/:id - Excluir um usuário
app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const Index = users.findIndex((u) => u.id === id);

  if (Index === -1) {
    return res.status(404).json({ message: "Utilizador não encontrado" });
  }

  users.splice(Index, 1);
  res.status(204).send();
});

// Para desenvolvimento local
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✅ Servidor a correr em http://localhost:${PORT}`);
  });
}
// Para a Vercel
module.exports = app;