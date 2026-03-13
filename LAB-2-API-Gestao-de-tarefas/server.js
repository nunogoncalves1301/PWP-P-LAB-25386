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
const validPriorities = ["low", "medium", "high"];

// ---------- Rotas Prisma ----------
app.get("/tasks", async (req, res) => {
  try {
    const prismatasks = await prisma.task.findMany();
    res.status(200).json({ data: prismatasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar tarefas no banco" });
  }
});

// Listar todas as tarefas ou filtrar por completed
app.get("/tasks", async (req, res) => {
  try {
    const { completed } = req.query;

    let tasks;

    if (completed !== undefined) {
      tasks = await prisma.task.findMany({
        where: {
          completed: completed === "true"
        }
      });
    } else {
      tasks = await prisma.task.findMany();
    }

    res.status(200).json({ data: tasks });

  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
});

// Listar tarefa por ID
app.get("/tasks/:id", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await prisma.task.findUnique({
      where: {
        id: taskId
      }
    });

    if (!task) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.status(200).json({ data: task });

  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar tarefa" });
  }
});

// Criar nova tarefa
app.post("/tasks", async (req, res) => {
  try {
    const { title, completed, priority } = req.body;

    if (!title || !priority) {
      return res.status(400).json({ message: "Título e prioridade são obrigatórios" });
    }

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ message: "Prioridade deve ser 'low', 'medium' ou 'high'" });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        completed: completed ?? false,
        priority
      }
    });

    res.status(201).json({
      message: "Tarefa criada com sucesso",
      data: newTask
    });

  } catch (error) {
    res.status(500).json({ error: "Erro ao criar tarefa" });
  }
});

// Atualizar tarefa
app.put("/tasks/:id", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, completed, priority } = req.body;

    if (!title || !priority) {
      return res.status(400).json({ message: "Título e prioridade são obrigatórios" });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        title,
        completed: completed ?? false,
        priority
      }
    });

    res.status(200).json({
      message: "Tarefa atualizada com sucesso",
      data: updatedTask
    });

  } catch (error) {

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    res.status(500).json({ error: "Erro ao atualizar tarefa" });
  }
});

// Alternar estado completed
app.patch("/tasks/:id/toggle", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        completed: !task.completed
      }
    });

    res.status(200).json({
      message: "Estado da tarefa alternado com sucesso",
      data: updatedTask
    });

  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar tarefa" });
  }
});

// Apagar tarefa
app.delete("/tasks/:id", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.status(200).json({ message: "Tarefa excluída com sucesso" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }
    res.status(500).json({ error: "Erro ao excluir tarefa" });
  }
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