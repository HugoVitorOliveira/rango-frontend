import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      tailwindcss()
    ],
    server: {
      proxy: {
        '/keycloak-api': {
          target: env.VITE_KEYCLOAK_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/keycloak-api/, ''),
        },
        '/api-rango': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8081/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-rango/, ''),
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
})
