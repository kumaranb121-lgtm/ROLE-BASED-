import { connectDB } from './src/config/db.js';
import { User } from './src/models/User.js';

async function check() {
  await connectDB();
  const user = await User.findOne({ username: 'hod' });
  if (user) {
    console.log('User found:', user.username);
    console.log('Password hash:', user.password);
  } else {
    console.log('User NOT found!');
  }
  process.exit(0);
}
check();
