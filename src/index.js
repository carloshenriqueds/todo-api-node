const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userFound = users.find(user => user.username === username);

  if (!userFound) {
    response.status(400).json({error: "User not found!"});
  }
  request.user = userFound;

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (!name) {
    response.status(400).json({error: "Name is required!"});
  }

  if (!username) {
    response.status(400).json({error: "Username is required!"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

/*
{ 
	id: 'uuid', // precisa ser um uuid
	title: 'Nome da tarefa',
	done: false, 
	deadline: '2021-02-27T00:00:00.000Z', 
	created_at: '2021-02-22T00:00:00.000Z'
}
*/
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  let todo = user.todos.filter((todo) => todo.id === id )[0];
  todo.title = title;
  todo.deadline = deadline;
  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  let todo = user.todos.filter((todo) => todo.id === id )[0];
  todo.done = true;
  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const arrayPosition = user.todos.findIndex((todo) => todo.id === id);
  user.todos.splice(arrayPosition, 1);

  return response.status(200).json(user.todos);
});

module.exports = app;