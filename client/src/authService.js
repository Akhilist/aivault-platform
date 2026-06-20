import axios from "axios"
import { API } from "./config/api"

const API_URL = `${API}/auth`

export const loginUser = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData)
  return response.data
}

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData)
  return response.data
}

export const getToken = () => localStorage.getItem("token")

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"))
  } catch {
    return null
  }
}

export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}