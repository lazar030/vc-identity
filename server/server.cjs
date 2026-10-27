const path = require('path');
const jsonServer = require('json-server');

const fs = require('fs');

const server = jsonServer.create();

const SEED_PATH = path.join(__dirname, 'db.seed.json');
const readSeed = () => JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));

// Passing an object (not a file path) makes json-server keep data in memory.
// The seed file is never modified; restarting the API always starts clean.
const router = jsonServer.router(readSeed());
const db = () => router.db;

server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

// Artificial latency so loading states are visible during development.
server.use((req, res, next) => setTimeout(next, 400));

// Which capability each endpoint requires. The server is the security authority.
const REQUIRED_CAPABILITY = {
  'GET /users': 'users.read',
  'POST /users': 'users.create',
  'PATCH /users': 'users.update',
  'DELETE /users': 'users.delete',
  'GET /roles': 'roles.read',
};

function capabilitiesOf(user) {
  const role = db().get('roles').find({ id: user.roleId }).value();
  return role ? role.capabilities : [];
}

// --- Public: login -------------------------------------------------------
// Practice-only auth: every user's password is "password", the token is the user id.
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db().get('users').find({ email }).value();
  if (!user || password !== 'password') {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: user.id });
});

// Test-only: restore the seed. Not registered unless E2E=true.
if (process.env.E2E === 'true') {
  server.post('/__test/reset', (req, res) => {
    router.db.setState(readSeed());
    res.sendStatus(204);
  });
  console.log('E2E mode: POST /__test/reset enabled');
}

// --- Authentication: everything below requires a valid token -------------
server.use('/api', (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const user = db().get('users').find({ id: token }).value();
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  req.user = user;
  next();
});

// Current user + their capabilities. The frontend reads this; it never decides.
server.get('/api/me', (req, res) => {
  res.json({ ...req.user, capabilities: capabilitiesOf(req.user) });
});

// --- Authorization: check the capability for the endpoint ----------------
server.use('/api', (req, res, next) => {
  const resource = '/' + req.path.split('/')[1]; // "/users/4" -> "/users"
  const required = REQUIRED_CAPABILITY[`${req.method} ${resource}`];
  if (required && !capabilitiesOf(req.user).includes(required)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
});

server.use('/api', router);

server.listen(3000, () => {
  console.log('API running on http://localhost:3000/api');
});
