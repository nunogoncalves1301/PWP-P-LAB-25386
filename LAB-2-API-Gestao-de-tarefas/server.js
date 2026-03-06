require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();


app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 3000;

let tasks = [
  { id: 1, title: "Estudar Node.js", completed: false, priority: "high" },
  { id: 2, title: "Fazer LAB-1", completed: true, priority: "medium" }
];

const validPriorities = ["low", "medium", "high"];

// ---------- Rotas Prisma ----------
app.get("/prisma/tasks", async (req, res) => {
  try {
    const prismatasks = await prisma.task.findMany();
    res.status(200).json({ data: prismatasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar tarefas no banco" });
  }
});

// ---------- Rotas Tasks In-Memory ----------

// Listar todas as tarefas ou filtrar por completed
app.get("/tasks", (req, res) => {
  const { completed } = req.query;

  if (completed !== undefined) {
    const filtered = tasks.filter(t => t.completed === (completed === "true"));
    return res.status(200).json({ data: filtered });
  }

  res.status(200).json({ data: tasks });
});

// Listar tarefa por ID
app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ message: "Tarefa não encontrada" });
  }
  res.status(200).json({ data: task });
});

// Criar nova tarefa
app.post("/tasks", (req, res) => {
  const { title, completed, priority } = req.body;

  if (!title || !priority) {
    return res.status(400).json({ message: "Título e prioridade são obrigatórios" });
  }
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ message: "Prioridade deve ser 'low', 'medium' ou 'high'" });
  }

  const newTask = {
    id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
    title,
    completed: completed || false,
    priority
  };

  tasks.push(newTask);
  res.status(201).json({ message: "Tarefa criada com sucesso", data: newTask });
});

// Atualizar tarefa
app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, completed, priority } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return res.status(404).json({ message: "Tarefa não encontrada" });

  if (!title || !priority) return res.status(400).json({ message: "Título e prioridade são obrigatórios" });

  tasks[taskIndex] = { id: taskId, title, completed: completed || false, priority };
  res.status(200).json({ message: "Tarefa atualizada com sucesso", data: tasks[taskIndex] });
});

// Alternar estado completed
app.patch("/tasks/:id/toggle", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);

  if (!task) return res.status(404).json({ message: "Tarefa não encontrada" });

  task.completed = !task.completed;
  res.status(200).json({ message: "Estado da tarefa alternado com sucesso", data: task });
});

// Apagar tarefa
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return res.status(404).json({ message: "Tarefa não encontrada" });

  tasks.splice(taskIndex, 1);
  res.status(200).json({ message: "Tarefa excluída com sucesso" });
});

// ---------- Middleware ----------
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erro interno do servidor" });
});

// ---------- Iniciar servidor ----------
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});