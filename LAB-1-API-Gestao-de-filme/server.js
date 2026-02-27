require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.SERVER_PORT || 4242;


let filmes = [
  { id: 1, title: "Inception", year: 2010 },
  { id: 2, title: "Interstellar", year: 2014 }
];

// GET /filmes - Listar todos os filmes
app.get("/filmes", (req, res) => {
  res.status(200).json({ data: filmes });
});

// GET /filmes/:id - Obter um filme por ID
app.get("/filmes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const movie = filmes.find((m) => m.id === id);

  if (!movie) {
    return res.status(404).json({ message: "Filme não encontrado" });
  }

  res.status(200).json({ data: movie });
});

// POST /filmes - Criar um novo filme
app.post("/filmes", (req, res) => {
  const { title, year } = req.body;

  if (!title || !year) {
    return res.status(400).json({ message: "Título e ano são obrigatórios" });
  }

  const newMovie = {
    id: filmes.length + 1,
    title,
    year
  };

  filmes.push(newMovie);
  res.status(201).json({ data: newMovie });
});

// PUT /filmes/:id - Atualizar um filme existente
app.put("/filmes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, year } = req.body;

  const Index = filmes.findIndex((m) => m.id === id);

  if (Index === -1) {
    return res.status(404).json({ message: "Filme não encontrado" });
  }

  if (!title || !year) {
    return res.status(400).json({ message: "Título e ano são obrigatórios" });
  }

  filmes[Index] = { id, title, year };
  res.status(200).json({ data: filmes[Index] });
});

// DELETE /filmes/:id - Excluir um filme
app.delete("/filmes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const Index = filmes.findIndex((m) => m.id === id);

  if (Index === -1) {
    return res.status(404).json({ message: "Filme não encontrado" });
  }

  filmes.splice(Index, 1);
  res.status(204).send();
});


// Rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

//Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erro interno do servidor" });
});

// Para desenvolvimento local
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`✅ Servidor a correr em http://localhost:${PORT}`);
  });
}

// Para a Vercel
module.exports = app;
