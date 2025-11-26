import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/auth': {
				target: 'https://agronova-ml0a.onrender.com/',
				changeOrigin: true,
				secure: false
			},
		}
	}
}) 