import { defineConfig } from 'vite';
import { resolve } from 'path';

const NOME_DO_SEU_REPO = 'meeting-awards'; 

export default defineConfig({
    base: `/${NOME_DO_SEU_REPO}/`, 
    
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                
                admin: resolve(__dirname, 'admin.html')
            }
        }
    }
});