import './style.css';

import { firebaseService } from './firebaseService';
import type { FirebaseData, LocalVotes } from './domain';

// --- NOSSA "SEGURANÇA" ROBUSTA ---
const ADMIN_SECRET = "loipro";
function initializeAdminPanel() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pass') !== ADMIN_SECRET) {
        document.getElementById('access-denied')!.style.display = 'block';
        return;
    }

    document.getElementById('admin-panel')!.style.display = 'grid';

    const statusVotacao = document.getElementById('status-votacao')!;
    const statusAlgoritmo = document.getElementById('status-algoritmo')!;
    const btnOpen = document.getElementById('btn-open-voting')!;
    const btnClose = document.getElementById('btn-close-voting')!;
    const btnSetAlgo = document.getElementById('btn-set-algorithm')!;
    const selectAlgo = document.getElementById('select-algorithm') as HTMLSelectElement;

    btnOpen.addEventListener('click', () => {
        if (confirm('Tem certeza que quer ABRIR a votação?')) {
            firebaseService.setVotingStatus(true)
                .then(() => alert('Votação ABERTA'))
                .catch(err => alert(`Erro: ${err.message}`));
        }
    });

    btnClose.addEventListener('click', () => {
        if (confirm('Tem certeza que quer FECHAR a votação e REVELAR o ranking?')) {
            firebaseService.setVotingStatus(false)
                .then(() => alert('Votação FECHADA. Ranking revelado!'))
                .catch(err => alert(`Erro: ${err.message}`));
        }
    });

    btnSetAlgo.addEventListener('click', () => {
        const algo = selectAlgo.value;
        if (confirm(`Definir algoritmo para "${algo}"?`)) {
            firebaseService.setRankingAlgorithm(algo)
                .then(() => alert('Algoritmo atualizado!'))
                .catch(err => alert(`Erro: ${err.message}`));
        }
    });

    firebaseService.onDataChange((data: FirebaseData, _: LocalVotes) => {
        if (data && data.settings) {
            if (data.settings.isVotingOpen) {
                statusVotacao.textContent = 'ABERTA';
                statusVotacao.style.color = '#28a745';
            } else {
                statusVotacao.textContent = 'FECHADA';
                statusVotacao.style.color = '#e74c3c';
            }

            const algo = data.settings.rankingAlgorithm || 'simple';
            statusAlgoritmo.textContent = algo;
            selectAlgo.value = algo;
        }
    });
}

initializeAdminPanel();