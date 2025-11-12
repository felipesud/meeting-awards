import type { Meeting } from './domain.ts';

interface ViewElements {
    meetingNameInput: HTMLInputElement;
    addMeetingBtn: HTMLButtonElement;
    meetingsList: HTMLUListElement;
    loading: HTMLDivElement;
    rankingTitle: HTMLHeadingElement;
    addMeetingCard: HTMLElement;
}

export const elements: ViewElements = {
    meetingNameInput: document.getElementById('meeting-name-input') as HTMLInputElement,
    addMeetingBtn: document.getElementById('add-meeting-btn') as HTMLButtonElement,
    meetingsList: document.getElementById('meetings-list') as HTMLUListElement,
    loading: document.getElementById('loading') as HTMLDivElement,
    rankingTitle: document.getElementById('ranking-title') as HTMLHeadingElement,
    addMeetingCard: document.getElementById('add-meeting') as HTMLElement,
};

export type VoteHandler = (
    id: string,
    score: number,
    count: number,
    nota: number
) => void;

export function render(
    isVotingOpen: boolean,
    meetingsArray: Meeting[],
    voteHandler: VoteHandler
): void {
    elements.loading.style.display = 'none';
    elements.meetingsList.innerHTML = '';

    if (isVotingOpen) {
        renderVotingView(meetingsArray, voteHandler);
    } else {
        renderRankingView(meetingsArray);
    }
}

export function renderConfigError(): void {
    elements.loading.textContent = 'Aguardando configuração do Admin... (crie o nó "settings")';
    elements.rankingTitle.textContent = 'App Não Configurado';
}

export function clearAddMeetingInput(): void {
    elements.meetingNameInput.value = '';
}

export function hideAddMeetingCard(): void {
    elements.addMeetingCard.style.display = 'none';
}

function renderVotingView(meetingsArray: Meeting[], voteHandler: VoteHandler): void {
    elements.rankingTitle.textContent = 'Vote nas Meetings';

    meetingsArray.forEach(meeting => {
        const li = createMeetingItem(meeting, false);
        const controls = createVotingControls(meeting, voteHandler);
        li.appendChild(controls);
        elements.meetingsList.appendChild(li);
    });
}

function renderRankingView(meetingsArray: Meeting[]): void {
    elements.rankingTitle.textContent = 'Ranking Final 🏆';
    elements.addMeetingCard.style.display = 'none';


    meetingsArray.forEach((meeting, index) => {
        const position = index + 1;
        let medalIcon = ''; 

        if (position === 1) {
            medalIcon = '🥇';
        } else if (position === 2) {
            medalIcon = '🥈';
        } else if (position === 3) {
            medalIcon = '🥉';
        }

        
        const li = document.createElement('li');
        li.classList.add('meeting-item');

        const positionSpan = document.createElement('span');
        positionSpan.classList.add('ranking-position'); 
        positionSpan.innerHTML = `${position}. ${medalIcon}`;

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('meeting-info');
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = meeting.name;
        
        const statsSpan = document.createElement('span');
        statsSpan.classList.add('stats');
        statsSpan.innerHTML = `Média: <strong>${meeting.average.toFixed(2)}</strong> (${meeting.vote_count} votos)`;
        
        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(statsSpan);

        li.appendChild(positionSpan);
        li.appendChild(infoDiv);
        
        elements.meetingsList.appendChild(li);
    });
}

function createMeetingItem(meeting: Meeting, isRankingView: boolean): HTMLLIElement {
    const li = document.createElement('li');
    li.classList.add('meeting-item');

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('meeting-info');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = meeting.name;
    infoDiv.appendChild(nameSpan);

    if (isRankingView) {
        const statsSpan = document.createElement('span');
        statsSpan.classList.add('stats');
        statsSpan.innerHTML = `Média: <strong>${meeting.average.toFixed(2)}</strong> (${meeting.vote_count} votos)`;
        infoDiv.appendChild(statsSpan);
    }

    li.appendChild(infoDiv);
    return li;
}

function createVotingControls(meeting: Meeting, voteHandler: VoteHandler): HTMLDivElement {
    const voteControlsDiv = document.createElement('div');
    voteControlsDiv.classList.add('vote-controls');

    const select = document.createElement('select');
    select.classList.add('vote-select');
    for (let i = 0; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = i.toString();
        option.textContent = i.toString();
        if (i === 10) option.selected = true;
        select.appendChild(option);
    }

    const voteButton = document.createElement('button');
    voteButton.classList.add('vote-submit-btn');
    voteButton.textContent = 'Votar';

    if (meeting.hasVoted) {
        voteButton.disabled = true;
        voteButton.textContent = 'Votado';
        select.disabled = true;
    }

    voteButton.addEventListener('click', () => {
        const selectedNota = parseInt(select.value, 10);
        voteHandler(meeting.id, meeting.total_score, meeting.vote_count, selectedNota);
    });

    voteControlsDiv.appendChild(select);
    voteControlsDiv.appendChild(voteButton);
    return voteControlsDiv;
}