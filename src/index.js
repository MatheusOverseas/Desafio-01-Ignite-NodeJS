const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameExists = users.find((user) => user.username === username);

  if (usernameExists) {
    return response.status(404).json({ error: "Username already exists" });
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { todoId } = request.params;

  const todo = user.todos.find((todo) => todo.id === todoId);

  if (!todo) {
    return response.status(404).json({ error: "Todo Not Found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { todoId } = request.params;

  const todoIsDone = user.todos.find((todo) => todo.id === todoId);

  if (!todoIsDone) {
    return response.status(404).json({ error: "Todo ID not Found" });
  }

  todoIsDone.done = true;

  return response.json(todoIsDone);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { todoId } = request.params;

  const todoToDelete = user.todos.findIndex((todo) => todo.id === todoId);

  if (todoToDelete === -1) {
    return response.status(204).json({ error: "Not Found" });
  }

  user.todos.splice(todoToDelete, 1);

  return response.status(204).json();
});

module.exports = app;
