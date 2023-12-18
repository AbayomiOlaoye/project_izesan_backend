const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(
  session({
    secret: 'izesan',
    resave: false,
    saveUninitialized: true,
  })
);

const users = [];

app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (users.some((user) => user.email === email)) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, password: hashedPassword, role };

    users.push(newUser);
    req.session.userId = newUser.email;

    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.userId = user.email; // Set user session upon successful login

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  const index = users.findIndex((user) => user.id === userId);

  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser };
    res.json(users[index]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  const index = users.findIndex((user) => user.id === userId);

  if (index !== -1) {
    const deletedUser = users.splice(index, 1);
    res.json({ message: 'User deleted successfully', user: deletedUser[0] });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});


app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout successful' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
