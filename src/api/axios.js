import axios from 'axios';
import { API } from '../constants';

const instance = axios.create({ baseURL: API,
              withCredentials: true });

export default instance;