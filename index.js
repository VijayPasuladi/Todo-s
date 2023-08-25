const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dbPath = path.join(__dirname, "todo.db");
const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(-1);
  }
};
initializeDBAndServer();

const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.username = payload.username;
        next();
      }
    });
  }
};

//Get todos API

app.get("/todos/", authenticateToken, async (request, response) => {
  const getQuary = `
    SELECT * 
    FROM todos
    ORDER BY id;
    `;
  const todosArray = await db.all(getQuary);
  response.send(todosArray);
});

// GET todo API

app.get("/todos/:todoId", authenticateToken, async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `
    SELECT * 
    FROM todos
    WHERE 
    id = '${todoId}';
    `;
  const todo = await db.get(getTodo);
  response.send(todo);
});
// ADD todo API

app.post("/todos/", authenticateToken, async (request, response) => {
  const todoDetails = request.body;
  const { id, title, description } = todoDetails;

  const addTodo = `
    INSERT INTO 
      todos(id,title,description)
      VALUEs (
        '${id}',
        '${title}',
        '${description}'
      );
    `;

  const addTodos = await db.run(addTodo);
  const todoId = addTodos.lastID;
  response.send({ todoId: todoId });
});
// UPDATE todo API

app.put("/todos/:todoId/", authenticateToken, async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;

  const { id, title, description } = todoDetails;

  const updateQuary = `
    UPDATE
        todos
    SET
        id = '${id}',
        title = '${title}',
        description = '${description}'
    WHERE 
        id = '${todoId};'
    `;
  await db.run(updateQuary);
  response.send("Todo update Successfully.");
});
//DELETE todo API

app.delete("/todos/:todoId/", authenticateToken, async (request, response) => {
  const { todoId } = request.params;
  const deleteQuary = `
    DELETE FROM todos
    WHERE id = '${todoId}';
    `;

  await db.run(deleteQuary);
  response.send("Todo Deleted Successfully.");
});
//User Register API
app.post("/users/", authenticateToken, async (request, response) => {
  const { username, password, email } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        users (username,  password, email) 
      VALUES 
        (
          '${username}',
          '${hashedPassword}', 
           '${email}'
        )`;
    await db.run(createUserQuery);
    response.send(`User created successfully`);
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//User Login API
app.post("/login/", authenticateToken, async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      const payload = {
        username: username,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

// Profile Details

app.get("/profile/", authenticateToken, async (request, response) => {
  let { username } = request;
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const userDetails = await db.get(selectUserQuery);
  response.send(userDetails);
});
