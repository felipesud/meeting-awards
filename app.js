const firebaseConfig = {
    apiKey: "AIzaSyB9Z6pKk3vyugh950t1faCeyMBiXxLtlKU",
    authDomain: "meeting-awards.firebaseapp.com",
    projectId: "meeting-awards",
    storageBucket: "meeting-awards.firebasestorage.app",
    messagingSenderId: "628116458985",
    appId: "1:628116458985:web:67547b7633c1b358394f78"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const meetingNameInput = document.getElementById('meeting-name-input');
const addMeetingBtn = document.getElementById('add-meeting-btn');
const meetingsList = document.getElementById('meetings-list');
const loading = document.getElementById('loading');

const VOTOS_KEY = 'meusVotosDasMeetings';
addMeetingBtn.addEventListener('click', () => {
    const meetingName = meetingNameInput.value.trim();
    if (meetingName) {
        database.ref('meetings').push({
            name: meetingName,
            total_score: 0,
            vote_count: 0
        })
            .then(() => {
                meetingNameInput.value = '';
            })
            .catch(error => {
                console.error('Erro ao adicionar meeting: ', error);
            });
    }
});
database.ref('meetings').on('value', (snapshot) => {
    loading.style.display = 'none';
    meetingsList.innerHTML = '';

    const meusVotos = JSON.parse(localStorage.getItem(VOTOS_KEY)) || {};

    const data = snapshot.val();
    const meetingsArray = [];

    for (let key in data) {
        const meeting = data[key];
        const average = (meeting.vote_count > 0)
            ? (meeting.total_score / meeting.vote_count)
            : 0;

        meetingsArray.push({
            id: key,
            name: meeting.name,
            total_score: meeting.total_score || 0,
            vote_count: meeting.vote_count || 0,
            average: average
        });
    }

    meetingsArray.sort((a, b) => b.average - a.average);

    meetingsArray.forEach(meeting => {
        const li = document.createElement('li');
        li.classList.add('meeting-item');

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('meeting-info');

        const nameSpan = document.createElement('span');
        nameSpan.textContent = meeting.name;

        const statsSpan = document.createElement('span');
        statsSpan.classList.add('stats');
        statsSpan.innerHTML = `Média: <strong>${meeting.average.toFixed(2)}</strong> (${meeting.vote_count} votos)`;
        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(statsSpan);

        const voteControlsDiv = document.createElement('div');
        voteControlsDiv.classList.add('vote-controls');

        const select = document.createElement('select');
        select.classList.add('vote-select');
        for (let i = 0; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === 10) option.selected = true;
            select.appendChild(option);
        }

        const voteButton = document.createElement('button');
        voteButton.classList.add('vote-submit-btn');
        voteButton.textContent = 'Votar';

        if (meusVotos[meeting.id]) {
            voteButton.disabled = true;
            voteButton.textContent = 'Votado';
            select.disabled = true;
        }

        voteButton.addEventListener('click', () => {
            const selectedNota = parseInt(select.value, 10);
            submitVote(meeting.id, meeting.total_score, meeting.vote_count, selectedNota);
        });

        voteControlsDiv.appendChild(select);
        voteControlsDiv.appendChild(voteButton);

        li.appendChild(infoDiv);
        li.appendChild(voteControlsDiv);
        meetingsList.appendChild(li);
    });
});

function submitVote(meetingId, currentTotalScore, currentVoteCount, nota) {
    const meusVotos = JSON.parse(localStorage.getItem(VOTOS_KEY)) || {};
    if (meusVotos[meetingId]) {
        alert('Você já votou nesta meeting!');
        return;
    }

    meusVotos[meetingId] = true;
    localStorage.setItem(VOTOS_KEY, JSON.stringify(meusVotos));

    const meetingRef = database.ref('meetings/' + meetingId);
    const newTotalScore = currentTotalScore + nota;
    const newVoteCount = currentVoteCount + 1;

    meetingRef.update({
        total_score: newTotalScore,
        vote_count: newVoteCount
    })
        .catch(error => {
            console.error("Erro ao votar: ", error);
            delete meusVotos[meetingId];
            localStorage.setItem(VOTOS_KEY, JSON.stringify(meusVotos));
        });
}