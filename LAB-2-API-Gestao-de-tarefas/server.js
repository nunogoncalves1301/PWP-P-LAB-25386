require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
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

//Listar todas as tarefas
app.get("/tasks", (req, res) => {
  res.status(200).json({data: tasks});
});

//Listar uma tarefa por ID
app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    res.status(404).json({message: "Tarefa não encontrada"});
  } 

    res.status(200).json({data: task});
});

//Listar tarefa por estado
app.get("/tasks", (req, res) => {
    const { completed } = req.query;
    const filtered = tasks.filter(t => t.completed === (completed === "true"));
    res.status(200).json({data: filtered});
});

//Criar uma nova tarefa
app.post("/tasks", (req, res) => {
    const { title, completed, priority } = req.body;

    //validação
    if (!title || !priority) {
        return res.status(400).json({message: "Título e prioridade são obrigatórios"});
    }
if (!validPriorities.includes(priority)) {
        return res.status(400).json({message: "Prioridade deve ser 'low', 'medium' ou 'high'"});
}
    const newTask = {
        id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1,
        title,
        completed: completed || false,
        priority
    };
    tasks.push(newTask);
    res.status(201).json({message: "Tarefa criada com sucesso", data: newTask});
});

//Atualizar uma tarefa existente
app.put("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, completed, priority } = req.body;

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({message: "Tarefa não encontrada"});
    }
    if (!title || !priority) {
        return res.status(400).json({message: "Título e prioridade são obrigatórios"});
    }
    tasks[taskIndex] = { id: taskId, title, completed: completed || false, priority };
    res.status(200).json({message: "Tarefa atualizada com sucesso", data: tasks[taskIndex]});
});

//Alterar o estado de uma tarefa
app.patch("/tasks/:id/toggle", (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({message: "Tarefa não encontrada"});
    }

    task.completed = !task.completed;

    res.status(200).json({
        message: "Estado da tarefa alternado com sucesso",
        data: task
    });
});

//Excluir uma tarefa
app.delete("/tasks/:id", (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
        return res.status(404).json({message: "Tarefa não encontrada"});
    }
    tasks.splice(taskIndex, 1);
    res.status(200).json({message: "Tarefa excluída com sucesso"});
});

app.use((req, res) => {
    res.status(404).json({message: "Rota não encontrada"});
});


app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json({message: "Erro interno do servidor"});
});

//app.listen(PORT, () => {
//  console.log(`Server is running on port ${PORT}`);
// });

module