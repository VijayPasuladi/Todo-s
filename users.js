const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("todo.db");

const createUserTable = `
CREATE TABLE IF NOT EXISTS users (
   id INTEGER PRIMARY KEY,
   username TEXT,
   password TEXT KEY ,
   email TEXT
);
`;

db.run(createUserTable, (err) => {
  if (err) {
    console.error("Error creating users table:", err.message);
  } else {
    console.log("Users table created successfully.");
  }
});
db.close((err) => {
  if (err) {
    console.error("Error closing database:", err.message);
  } else {
    console.log("Database connection closed.");
  }
});
