import api from './api.js';
import dbService from './database/index.db.js';
import { PORT } from './config/env.config.js';

const server = async () => {
  api.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`);
  });
};

server().catch((e) => console.error(e));
