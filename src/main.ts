// src/main.ts

// Importamos nosso CSS (Vite vai "empacotar" isso)
import './style.css';

// Importa nossas dependências "separadas"
import { firebaseService } from './firebaseService.js';
import { elements, render, renderConfigError, clearAddMeetingInput, hideAddMeetingCard } from './ui.js';
import type { FirebaseData, LocalVotes, Meeting } from './domain.ts';
import { RankingStrategyFactory } from './factories/RankingStrategyFactory';
/**
 * Ponto de entrada da aplicação (Padrão "Mediator").
 */
function initializeApp(): void {
    console.log("Iniciando o 'Enterprise Meeting Awards' v2.0 (TypeScript Edition)");
    
    elements.addMeetingBtn.addEventListener('click', onAddMeetingClick);
    firebaseService.onDataChange(onDataReceived);
}

// --- Handlers (Controladores de Eventos) ---

async function onAddMeetingClick(): Promise<void> {
    const meetingName = elements.meetingNameInput.value.trim();
    try {
        await firebaseService.addMeeting(meetingName);
        clearAddMeetingInput();
    } catch (error: any) {
        console.error('Erro ao adicionar meeting: ', error);
        alert(error.message);
    }
}

async function onVoteClick(
    meetingId: string, 
    currentTotalScore: number, 
    currentVoteCount: number, 
    nota: number
): Promise<void> {
    try {
        await firebaseService.submitVote(meetingId, currentTotalScore, currentVoteCount, nota);
    } catch (error: any) {
        console.error('Erro ao submeter voto: ', error.message);
    }
}

function onDataReceived(data: FirebaseData, meusVotos: LocalVotes): void {
    if (!data || !data.settings) {
        renderConfigError();
        return;
    }

    const { isVotingOpen } = data.settings;
    const meetingsData = data.meetings || {};
    
    const algorithmKey = data.settings.rankingAlgorithm || "simple";

    let meetingsArray: Meeting[] = Object.keys(meetingsData).map(key => {
        const meeting = meetingsData[key];
        const average = (meeting.vote_count > 0) 
            ? (meeting.total_score / meeting.vote_count) 
            : 0;
        
        return {
            id: key,
            name: meeting.name,
            total_score: meeting.total_score || 0,
            vote_count: meeting.vote_count || 0,
            average: average,
            hasVoted: !!meusVotos[key]
        };
    });

    if (isVotingOpen) {

    } else {      
        const strategy = RankingStrategyFactory.create(algorithmKey);
        meetingsArray = strategy.calculateRanking(meetingsArray);
    }
    
    render(isVotingOpen, meetingsArray, onVoteClick);
}

initializeApp();