import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv'; // Official Vercel KV package

export type User = {
  email: string;
  passwordHash: string; // Stores the password cleanly
};

const filePath = path.join(process.cwd(), 'users-data.json');
const isVercelKVActive = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const defaultUsers: User[] = [
  {
    email: 'admin@globalrecipehub.com',
    passwordHash: 'admin123', // Your default starting credentials
  },
];

export async function loadUsers(): Promise<User[]> {
  // If running on Vercel with KV linked, load from the cloud database
  if (isVercelKVActive) {
    try {
      let data = await kv.get<User[]>('users_data');
      
      // Auto-Seeder: If the Upstash database is completely empty on first load,
      // dynamically seed it using the local compiled JSON file data!
      if (!data || data.length === 0) {
        console.log('Upstash users are empty. Auto-seeding from users-data.json...');
        try {
          if (fs.existsSync(filePath)) {
            const localData = JSON.parse(fs.readFileSync(filePath, 'utf8')) as User[];
            if (localData && localData.length > 0) {
              await kv.set('users_data', localData);
              return localData;
            }
          }
        } catch (err: any) {
          console.error('Failed to auto-seed users to Upstash:', err.message);
        }
        await kv.set('users_data', defaultUsers);
        return defaultUsers;
      }
      return data;
    } catch (e) {
      console.error('Vercel KV user read error:', e);
      return defaultUsers;
    }
  }

  // Local fallback: read file from disk
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultUsers, null, 2), 'utf8');
      return defaultUsers;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as User[];
  } catch {
    return defaultUsers;
  }
}

export async function saveUsers(users: User[]) {
  if (isVercelKVActive) {
    try {
      await kv.set('users_data', users);
      return users;
    } catch (e) {
      console.error('Vercel KV user write error:', e);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
  return users;
}