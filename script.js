document.addEventListener("DOMContentLoaded", () => {
    // 요소 가져오기
    const startScreen = document.getElementById("start-screen");
    const playScreen = document.getElementById("play-screen");
    const startBtn = document.getElementById("start-btn");
    
    const scoreEl = document.getElementById("score");
    const comboEl = document.getElementById("combo");
    const questionEl = document.getElementById("question");
    const optionsContainer = document.getElementById("options");
    const optionBtns = document.querySelectorAll(".option-btn");
    const resultScreen = document.getElementById("result-screen");
    const restartBtn = document.getElementById("restart-btn");
    const finalScoreEl = document.getElementById("final-score");
    const finalMessageEl = document.getElementById("final-message");
    const qNumEl = document.getElementById("q-num");
    const feedbackEl = document.getElementById("feedback");

    // 상태 변수
    let score = 0;
    let combo = 0;
    let questionCount = 1;
    const maxQuestions = 10;
    let currentAnswer = 0;
    let isWaitingNext = false; // 정답 후 딜레이 시간 동안 클릭 방지

    // 게임 시작 이벤트
    startBtn.addEventListener("click", () => {
        startScreen.classList.remove("active");
        playScreen.classList.add("active");
        score = 0;
        combo = 0;
        questionCount = 1;
        updateScoreBoard();
        nextQuestion();
    });

    // 재시작 이벤트
    restartBtn.addEventListener("click", () => {
        resultScreen.classList.remove("active");
        playScreen.classList.add("active");
        score = 0;
        combo = 0;
        questionCount = 1;
        updateScoreBoard();
        nextQuestion();
    });

    // 문제 생성 함수
    function nextQuestion() {
        if (questionCount > maxQuestions) {
            showResultScreen();
            return;
        }

        isWaitingNext = false;
        feedbackEl.className = "feedback-text"; // 초기화
        feedbackEl.textContent = "";
        
        qNumEl.textContent = questionCount;

        // 2~9단 무작위 출제
        const a = Math.floor(Math.random() * 8) + 2; 
        const b = Math.floor(Math.random() * 9) + 1;
        currentAnswer = a * b;

        questionEl.textContent = `${a} x ${b} = ?`;

        // 보기 생성 (정답 1개 + 오답 3개)
        const options = generateOptions(currentAnswer, a, b);

        // 버튼에 보기 텍스트 및 이벤트 설정
        optionBtns.forEach((btn, index) => {
            btn.textContent = options[index];
            btn.onclick = () => checkAnswer(options[index], btn);
        });
    }

    // 오답 생성 (그럴싸한 오답 위주)
    function generateOptions(correct, a, b) {
        let optionsSet = new Set();
        optionsSet.add(correct);

        while(optionsSet.size < 4) {
            // 오답 1: 덧셈/뺄셈 실수
            const err1 = (a * (b + 1));
            // 오답 2: 덧셈/뺄셈 실수 2
            const err2 = (a * (b - 1));
            // 오답 3: 완전 무작위 (1~81 사이)
            const err3 = Math.floor(Math.random() * 81) + 1;

            const errs = [err1, err2, err3, correct+10, correct-10, correct+1, correct-1];
            let randomErr = errs[Math.floor(Math.random() * errs.length)];
            
            if (randomErr > 0 && randomErr <= 100) {
                optionsSet.add(randomErr);
            }
        }

        // Set을 Array로 바꾸고 섞기 (Shuffle)
        return Array.from(optionsSet).sort(() => Math.random() - 0.5);
    }

    // 정답 확인 함수
    function checkAnswer(selected, btnElement) {
        if (isWaitingNext) return;

        if (selected === currentAnswer) {
            // 정답 처리
            handleCorrect();
        } else {
            // 오답 처리
            handleWrong(btnElement);
        }
    }

    function handleCorrect() {
        isWaitingNext = true;
        score += 10;
        combo += 1;
        updateScoreBoard();

        feedbackEl.textContent = "정답이야! 짱! 🌟";
        feedbackEl.className = "feedback-text text-correct";

        // 파티클 (폭죽) 효과
        triggerConfetti();

        questionCount++;

        // 약간의 딜레이 후 다음 문제
        setTimeout(nextQuestion, 1000);
    }

    function handleWrong(btnElement) {
        combo = 0; // 콤보 초기화
        updateScoreBoard();

        feedbackEl.textContent = "앗, 다시 생각해봐! 💦";
        feedbackEl.className = "feedback-text text-wrong";

        // 화면 흔들림 효과
        const container = document.getElementById("game-container");
        container.classList.add("shake");

        // 버튼도 살짝 흔들기
        btnElement.classList.add("shake");

        setTimeout(() => {
            container.classList.remove("shake");
            btnElement.classList.remove("shake");
        }, 400);

        // 오답은 딜레이 없이 계속 풀이 가능하도록 함.
    }

    function updateScoreBoard() {
        scoreEl.textContent = score;
        comboEl.textContent = combo;

        // 콤보가 높으면 점수판이 통통 튐
        if (combo > 0 && combo % 5 === 0) {
            const comboBoard = document.getElementById("combo-display");
            comboBoard.classList.add("bounce-animation");
            setTimeout(() => comboBoard.classList.remove("bounce-animation"), 2000);
        }
    }

    function showResultScreen() {
        playScreen.classList.remove("active");
        resultScreen.classList.add("active");

        finalScoreEl.textContent = `총점: ${score}점`;

        if (score === 100) {
            finalMessageEl.textContent = "완벽해요! 구구단 마스터! 🥇";
        } else if (score >= 80) {
            finalMessageEl.textContent = "참 잘했어요! 최고! 🥈";
        } else if (score >= 50) {
            finalMessageEl.textContent = "조금만 연습하면 완벽해요! 🥉";
        } else {
            finalMessageEl.textContent = "아쉽지만 파이팅! 💪";
        }
    }

    // 파티클 터뜨리는 함수 (canvas-confetti 라이브러리 활용)
    function triggerConfetti() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#ffffff']
            });
        }
    }
});
