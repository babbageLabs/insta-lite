import { config } from 'dotenv';
import * as path from 'path';

// Load test environment variables
config({
  path: path.resolve(__dirname, '../.env.test')
});
