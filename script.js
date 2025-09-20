let isPlaying = false;
let bpm = 60;
let step = 0;
let interval;
let redSoundEnabled = true;
let mainSoundEnabled = true;

const rhythm1Btn = document.getElementById('rhythm1-btn');
const rhythm2Btn = document.getElementById('rhythm2-btn');

// 리듬 배열 정의
const redRhythms = {
    rhythm1: [0, 3, 6, 9, 12, 14],
    rhythm2: [2, 5, 8, 11]
};

// 현재 빨간 박자
let currentRedRhythm = 'rhythm1';
let redBeatPositions = redRhythms[currentRedRhythm];

// 리듬 버튼 클릭 이벤트
function selectRhythm(rhythm) {
    currentRedRhythm = rhythm;
    redBeatPositions = redRhythms[rhythm];
    rhythm1Btn.classList.toggle('active', rhythm === 'rhythm1');
    rhythm2Btn.classList.toggle('active', rhythm === 'rhythm2');
}

// 이벤트 연결
rhythm1Btn.addEventListener('click', () => selectRhythm('rhythm1'));
rhythm2Btn.addEventListener('click', () => selectRhythm('rhythm2'));

// 주박자 위치 (0,4,8,12)
const mainBeatPositions = [0, 4, 8, 12];

// Tone.js 신디사이저 설정
const highSynth = new Tone.Synth({
    oscillator: {
        type: "triangle"
    },
    envelope: {
        attack: 0.001,
        decay: 0.03,
        sustain: 0,
        release: 0.01
    }
}).toDestination();

const lowSynth = new Tone.Synth({
    oscillator: {
        type: "triangle"
    },
    envelope: {
        attack: 0.001,
        decay: 0.03,
        sustain: 0,
        release: 0.01
    }
}).toDestination();

const redSynth = new Tone.Synth({
    oscillator: {
        type: "sine"
    },
    envelope: {
        attack: 0.001,
        decay: 0.02,
        sustain: 0,
        release: 0.01
    }
}).toDestination();

// DOM 요소 가져오기
const toggleButton = document.querySelector('.toggle-button');
const redToggleButton = document.getElementById('red-toggle');
const mainToggleButton = document.getElementById('main-toggle');
const bpmInput = document.querySelector('.bpm-value');
const bpmSlider = document.querySelector('.bpm-slider');
const bpmDecreaseBtn = document.querySelector('.bpm-button:first-child');
const bpmIncreaseBtn = document.querySelector('.bpm-button:last-child');

// BPM 업데이트 함수
function updateBPM(newBPM) {
    bpm = Math.min(Math.max(newBPM, 30), 200);
    bpmInput.value = bpm;
    bpmSlider.value = bpm;
    if (isPlaying) {
        restartMetronome();
    }
}

// 빨간음 토글 함수
function toggleRedSound() {
    redSoundEnabled = !redSoundEnabled;
    redToggleButton.textContent = redSoundEnabled ? "빨간음 ON" : "빨간음 OFF";
    redToggleButton.classList.toggle('disabled', !redSoundEnabled);
}

function toggleMainSound() {
    mainSoundEnabled = !mainSoundEnabled;
    mainToggleButton.textContent = mainSoundEnabled ? "메인음 ON" : "메인음 OFF";
    mainToggleButton.classList.toggle('disabled', !mainSoundEnabled);
}


// LED 업데이트
function updateLEDs(currentStep) {
    // 모든 LED 끄기
    document.querySelectorAll('.red-led, .green-led').forEach(led => {
        led.classList.remove('active');
    });

    // 현재 스텝에 해당하는 초록 LED 켜기
    if (mainBeatPositions.includes(currentStep)) {
        const greenLed = document.getElementById(`green-${currentStep}`);
        if (greenLed) {
            greenLed.classList.add('active');
        }
    }

    // 빨간 LED 켜기
    if (redBeatPositions.includes(currentStep)) {
        const redLed = document.getElementById(`red-${currentStep}`);
        if (redLed) {
            redLed.classList.add('active');
        }
    }

    document.querySelectorAll('.yellow-led').forEach(led => {
        led.classList.remove('active');
    });
    document.getElementById(`yellow-${currentStep}`).classList.add('active');
}

// 메트로놈 틱 함수
function tick() {
    const isMainBeat = mainBeatPositions.includes(step);
    const isRedBeat = redBeatPositions.includes(step);
    
    // 첫 번째 박자는 높은 음
    const isHighTick = step === 0;
    
    // 주박자 소리
    if (isMainBeat && mainSoundEnabled) {
        const synth = isHighTick ? highSynth : lowSynth;
        const note = isHighTick ? "E6" : "A5";
        synth.triggerAttackRelease(note, "32n", undefined, 0.8);
    }
    
    // 빨간점 소리 (토글 설정에 따라)
    if (isRedBeat && redSoundEnabled) {
        redSynth.triggerAttackRelease("C6", "32n", undefined, 0.6);
    }
    
    updateLEDs(step);
    step = (step + 1) % 16;
}

// 메트로놈 시작/재시작
function restartMetronome() {
    if (interval) clearInterval(interval);
    const intervalTime = (60 / bpm) * 1000 / 4; // 16분음표 간격
    interval = setInterval(tick, intervalTime);
}

// 메트로놈 토글
function toggleMetronome() {
    isPlaying = !isPlaying;
    toggleButton.textContent = isPlaying ? "정지" : "시작";
    
    step = 0;
    if (isPlaying) {
        Tone.start();
        restartMetronome();
    } else {
        clearInterval(interval);
        document.querySelectorAll('.red-led, .green-led').forEach(led => {
            led.classList.remove('active');
        });
    }
}

// 이벤트 리스너 설정
toggleButton.addEventListener('click', toggleMetronome);
mainToggleButton.addEventListener('click', toggleMainSound);
redToggleButton.addEventListener('click', toggleRedSound);

bpmInput.addEventListener('change', (e) => {
    updateBPM(parseInt(e.target.value));
});

bpmSlider.addEventListener('input', (e) => {
    updateBPM(parseInt(e.target.value));
});

bpmDecreaseBtn.addEventListener('click', () => {
    updateBPM(parseInt(bpm) - 1);
});

bpmIncreaseBtn.addEventListener('click', () => {
    updateBPM(parseInt(bpm) + 1);
});
