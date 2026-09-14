import react from '@vitejs/plugin-react'
import { defineConfig, type ConfigEnv } from 'vite'
import * as path from 'path'

export default defineConfig((_: ConfigEnv) => {
    return {
        plugins: [
            react()
        ],
        resolve: {
            alias: {
                '$entities': path.resolve('./src/entities'),
                '$features': path.resolve('./src/features'),
                '$widgets': path.resolve('./src/widgets'),
                '$pages': path.resolve('./src/pages'),
                '$shared': path.resolve('./src/shared'),
                '$assets': path.resolve('./src/assets')
            }
        }
    }
});