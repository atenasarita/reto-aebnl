import axios from 'axios'
import { API_URL } from '../utils/config'

function authHeader() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export async function crearServicioCatalogo({ nombre, categoria, precio }) {
  const res = await axios.post(
    `${API_URL}/api/servicios/catalogo`,
    { nombre, categoria, precio },
    { headers: authHeader() }
  )
  return res.data  
}