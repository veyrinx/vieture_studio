// Admin account maintenance from the command line.
//   node src/server/cli.ts create-user <username> [admin|editor]   → prints a generated password
//   node src/server/cli.ts reset-password <username>               → prints a new password
//   node src/server/cli.ts list-users
// In Docker: docker compose exec web node src/server/cli.ts create-user admin admin
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore } from './services/store.ts';
import { ROLES, USERNAME_RE, generatePassword, hashPassword } from './services/auth.ts';
import type { Role } from '../shared/types.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const store = createStore(process.env.DATA_DIR || path.join(root, 'data'));
await store.init();

const [cmd, nameArg, roleArg = 'admin'] = process.argv.slice(2);
const username = String(nameArg ?? '').toLowerCase();
const users = await store.getUsers();

if (cmd === 'list-users') {
  for (const u of users) console.log(`${u.username}\t${u.role}\t${u.lastLoginAt ?? '-'}`);
} else if (cmd === 'create-user') {
  if (!USERNAME_RE.test(username)) fail('Username: 3–32 chars of a-z 0-9 . _ -');
  if (!ROLES.includes(roleArg as Role)) fail(`Role must be one of: ${ROLES.join(', ')}`);
  if (users.some((u) => u.username === username)) fail('User already exists');
  const password = generatePassword();
  users.push({ username, role: roleArg as Role, password: await hashPassword(password), createdAt: new Date().toISOString() });
  await store.saveUsers(users);
  console.log(`Created ${roleArg} "${username}"\nPassword: ${password}`);
} else if (cmd === 'reset-password') {
  const user = users.find((u) => u.username === username);
  if (!user) fail('No such user');
  const password = generatePassword();
  user.password = await hashPassword(password);
  await store.saveUsers(users);
  console.log(`New password for "${username}": ${password}\n(Restart the server to sign out existing sessions.)`);
} else {
  fail('Usage: node src/server/cli.ts create-user <username> [admin|editor] | reset-password <username> | list-users');
}

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}
