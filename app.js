const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw_4ci_Fv2dHZ2V2ZrAWOv7DFOmU39Att51MRSTK2gIdQ3SbjuOTwrsgoaW20_-aBc/exec";

document.getElementById('date-display').innerText = new Date().toLocaleDateString();

// 로컬 스토리지 키
const STORAGE_KEY = 'med_status_' + new Date().toISOString().split('T')[0];

function loadFromLocal() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { gout: 'Not Taken', calcium: 'Not Taken' };
}

function saveToLocal(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 초기 로딩: 로컬 스토리지 먼저 보여줌 (즉시 로딩)
const initialData = loadFromLocal();
updateCard('gout', initialData.gout);
updateCard('calcium', initialData.calcium);

async function checkStatus() {
    if (WEB_APP_URL.includes("YOUR_WEB_APP_URL")) {
        alert("app.js 링크 설정 필요");
        return;
    }

    try {
        // 서버에서 최신 상태 가져오기
        const res = await fetch(WEB_APP_URL);
        const data = await res.json();

        // 서버 데이터로 업데이트 및 로컬 저장
        updateCard('gout', data.gout);
        updateCard('calcium', data.calcium);
        saveToLocal({ gout: data.gout, calcium: data.calcium });

    } catch (e) {
        console.error(e);
        // 에러 시 로컬 데이터라도 계속 보여줌, 상단에 조그맣게 표시하면 좋지만 일단 유지
        // document.querySelectorAll('.status-display').forEach(el => el.innerText = "연결 실패 (캐시 사용중)");
    }
}

function updateCard(type, status) {
    const card = document.getElementById(`card-${type}`);
    const statusDisp = card.querySelector('.status-display');
    const btn = card.querySelector('.action-btn');

    card.className = "card"; // Reset
    if (status === 'Taken') {
        card.classList.add('taken');
        statusDisp.innerText = "복용 완료 ✅";
        btn.innerText = "완료";
        btn.disabled = true;
    } else {
        card.classList.add('not-taken');
        statusDisp.innerText = "미복용";
        btn.innerText = "먹었어요! 💊";
        btn.disabled = false;
    }
}

async function takeMedicine(type) {
    const btn = document.querySelector(`#card-${type} .action-btn`);

    // 1. Optimistic UI: 즉시 성공한 것처럼 보이게 함
    updateCard(type, 'Taken');

    // 2. 로컬 스토리지에도 즉시 반영
    const currentData = loadFromLocal();
    currentData[type] = 'Taken';
    saveToLocal(currentData);

    try {
        // 3. 백그라운드에서 서버로 전송
        await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ type: type })
        });
        // 성공 시 아무것도 안 해도 됨 (이미 UI는 업데이트 됨)
    } catch (e) {
        alert("저장 실패! 다시 시도해주세요.");
        // 실패 시 롤백
        updateCard(type, 'Not Taken');

        // 로컬 스토리지 롤백
        currentData[type] = 'Not Taken';
        saveToLocal(currentData);
    }
}

// 페이지 로드 시 서버 상태도 한 번 확인 (동기화)
checkStatus();