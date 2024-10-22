import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';

// Inicializar el adaptador para JSON
const db = new LowSync(new JSONFileSync('./database.json'), {})

// Leer los datos de la base de datos
db.read();

// Verificar y asignar datos por defecto si db.data está indefinido o vacío
if (!db.data || !db.data.users) {
  db.data = { users: [] };
  db.write(); // Guarda los datos por defecto en database.json
}

// Inicializar la aplicación de Express
const app = express();

// Clave secreta del JWT
const jwtSecretKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MjkyODc2MjksImV4cCI6MTcyOTM3NDAyOX0.qZQ_em9MydmcBp1XtrkEsF6vIeaPjkJxYojJVXLf0fI';

// Configurar middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.get('/', (_req, res) => {
  res.send('Auth API.\nPlease use POST /auth & POST /verify for authentication');
});

// Ruta para autenticación
app.post('/auth', (req, res) => {
  const { email, password } = req.body;
  const user = db.data.users.find(user => user.email === email);

  if (user) {
    bcrypt.compare(password, user.password, (_err, result) => {
      if (!result) {
        return res.status(401).json({ message: 'Invalid password' });
      } else {
        const loginData = { email, signInTime: Date.now() };
        const token = jwt.sign(loginData, jwtSecretKey);
        res.status(200).json({ message: 'success', token });
      }
    });
  } else {
    bcrypt.hash(password, 10, (_err, hash) => {
      db.data.users.push({ email, password: hash });
      db.write();
      const loginData = { email, signInTime: Date.now() };
      const token = jwt.sign(loginData, jwtSecretKey);
      res.status(200).json({ message: 'success', token });
    });
  }
});

// Ruta para verificar el token JWT
app.post('/verify', (req, res) => {
  const tokenHeaderKey = 'jwt-token';
  const authToken = req.headers[tokenHeaderKey];
  try {
    const verified = jwt.verify(authToken, jwtSecretKey);
    if (verified) {
      return res.status(200).json({ status: 'logged in', message: 'success' });
    } else {
      return res.status(401).json({ status: 'invalid auth', message: 'error' });
    }
  } catch (error) {
    return res.status(401).json({ status: 'invalid auth', message: 'error' });
  }
});

// Ruta para revisar si un usuario existe
app.post('/check-account', (req, res) => {
  const { email } = req.body;
  const userExists = db.data.users.some(user => user.email === email);
  res.status(200).json({ status: userExists ? 'User exists' : 'User does not exist', userExists });
});

// Escuchar en el puerto 3080
app.listen(3080, () => {
  console.log('Server running on port 3080');
});
