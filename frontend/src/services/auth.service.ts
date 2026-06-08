import axios from "axios";
import api from "@/lib/api";

interface LoginResponse {
  access_token: string;
}

interface RegisterResponse {
  id: string;
  email: string;
  created_at: string;
}

function extractError(error: unknown): never {
  if (!axios.isAxiosError(error)) throw new Error("Erro inesperado, tente novamente");

  const status = error.response?.status;

  if (status === 401) throw new Error("Credenciais inválidas");
  if (status === 409) throw new Error("E-mail já cadastrado");
  if (status === 422) {
    const detail = error.response?.data?.detail;
    const msg = Array.isArray(detail) ? detail[0]?.msg : undefined;
    throw new Error(msg ?? "Dados inválidos");
  }

  throw new Error("Erro inesperado, tente novamente");
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const res = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return res.data;
  } catch (error) {
    extractError(error);
  }
}

export async function registerUser(
  email: string,
  password: string
): Promise<RegisterResponse> {
  try {
    const res = await api.post<RegisterResponse>("/auth/register", {
      email,
      password,
    });
    return res.data;
  } catch (error) {
    extractError(error);
  }
}
