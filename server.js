const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("todo.db");

const createTodoTable = `
 CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL 
    );
);
`;

  db.run(createTodoTable, (err) => {
    if (err) {
      console.error("Error creating products table:", err.message);
    } else {
      console.log("Products table created successfully.");
    }
  });

  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Database connection closed.");
    }
  });
});
