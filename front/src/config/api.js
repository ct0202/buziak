// Development
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.buziak.online'
    : 'http://localhost:5002';

// Настройки axios по умолчанию
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';