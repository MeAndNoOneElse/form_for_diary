// Основной стейт
let selectedFolder = null;
let activityCount = 0;
let goodEventCount = 0;
let badEventCount = 0;
let allReports = [];

// Пресеты событий
const GOOD_PRESETS = [
    { emoji: '📚', text: 'Сдал лабу/работу' },
    { emoji: '☀️', text: 'Солнышко светило' },
    { emoji: '👥', text: 'Посидели с друзьями' },
    { emoji: '🏆', text: 'Успех/достижение' },
    { emoji: '😌', text: 'Хорошо отдохнул' },
    { emoji: '🎮', text: 'Поиграл в игры' },
    { emoji: '📺', text: 'Посмотрел кино/сериал' },
    { emoji: '🍕', text: 'Вкусно поел' },
    { emoji: '🎵', text: 'Послушал музыку' }
];

const BAD_PRESETS = [
    { emoji: '📉', text: 'Завалили/провалил' },
    { emoji: '🌧', text: 'Дождь/плохая погода' },
    { emoji: '😠', text: 'Ссора/конфликт' },
    { emoji: '😫', text: 'Сильная усталость' },
    { emoji: '🤒', text: 'Плохое самочувствие' },
    { emoji: '💰', text: 'Финансовые проблемы' },
    { emoji: '🚗', text: 'Пробки/опоздал' },
    { emoji: '📱', text: 'Плохие новости' },
    { emoji: '😤', text: 'Ничего не успел' }
];

// Автоинициализация
window.onload = () => {
    if (!window.showDirectoryPicker) {
        showMessage('⚠️ Ваш браузер не поддерживает выбор папки. Используйте Chrome/Edge/Opera', 'error');
    }
    addActivity();
    addGoodEvent();
    addBadEvent();
    loadFromStorage();
};

// UI helpers
function updateRangeValue(elementId, value) {
    document.getElementById(elementId).textContent = value;
}

function switchTab(tabName, el) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    if (el) el.classList.add('active');
}

// Папка
async function selectFolder() {
    try {
        selectedFolder = await window.showDirectoryPicker();
        localStorage.setItem('folderName', selectedFolder.name);
        document.getElementById('folderStatus').innerHTML = `📁 Папка: <strong>${selectedFolder.name}</strong>`;
        showMessage(`✅ Папка "${selectedFolder.name}" выбрана!`, 'success');
    } catch (err) {
        if (err.name !== 'AbortError') {
            showMessage('❌ Ошибка: ' + err.message, 'error');
        }
    }
}

async function ensureFolderAccess() {
    return !!selectedFolder;
}

// Загрузка локального состояния
function loadFromStorage() {
    const saved = localStorage.getItem('allReports');
    if (saved) {
        try { allReports = JSON.parse(saved); } catch (e) { console.warn('storage parse error'); }
    }
    const folderName = localStorage.getItem('folderName');
    if (folderName) {
        document.getElementById('folderStatus').innerHTML = `📁 Папка: <strong>${folderName}</strong> (нажми "Выбрать папку")`;
    }
}

// Работа с формой
function addActivity() {
    const container = document.getElementById('activities');
    const id = activityCount++;
    const div = document.createElement('div');
    div.className = 'activity-item';
    div.id = `activity_${id}`;
    div.innerHTML = `
        <div class="event-header">
            <h4>🏃 Активность ${activityCount}</h4>
            <button class="remove-btn" onclick="removeActivity(${id})">❌</button>
        </div>
        <div class="row">
            <div class="col">
                <select id="activity_type_${id}">
                    <option value="gym">🏋️ Тренажёрный зал</option>
                    <option value="run">🏃 Бег/кардио</option>
                    <option value="walk">🚶 Прогулка</option>
                    <option value="yoga">🧘 Йога/растяжка</option>
                    <option value="sport">⚽ Спортивные игры</option>
                    <option value="other">✨ Своё</option>
                </select>
            </div>
            <div class="col">
                <input type="text" id="activity_other_${id}" placeholder="Если своё, напиши" style="display: none;">
            </div>
        </div>
        <div class="row" style="margin-top: 10px;">
            <div class="col">
                <label>Длительность (мин)</label>
                <input type="number" id="activity_duration_${id}" min="0" max="1000" value="30">
            </div>
            <div class="col">
                <label>Калории</label>
                <input type="number" id="activity_calories_${id}" min="0" max="5000" value="200">
            </div>
        </div>`;
    container.appendChild(div);
    document.getElementById(`activity_type_${id}`).addEventListener('change', (e) => {
        const otherField = document.getElementById(`activity_other_${id}`);
        otherField.style.display = e.target.value === 'other' ? 'block' : 'none';
    });
}

function removeActivity(id) {
    const el = document.getElementById(`activity_${id}`);
    if (el) el.remove();
}

function addGoodEvent() {
    const container = document.getElementById('goodEvents');
    const id = goodEventCount++;
    const div = document.createElement('div');
    div.className = 'event-item';
    div.id = `good_${id}`;

    const presetsHtml = GOOD_PRESETS.map(p => `<span class="preset-tag" onclick="toggleGoodPreset(${id}, '${p.emoji} ${p.text}')">${p.emoji} ${p.text}</span>`).join('');

    div.innerHTML = `
        <div class="event-header">
            <h4>✨ Хорошее событие ${goodEventCount}</h4>
            <button class="remove-btn" onclick="removeGoodEvent(${id})">❌</button>
        </div>
        <div class="event-presets">${presetsHtml}</div>
        <textarea id="good_text_${id}" rows="3" placeholder="Выбери пресеты или напиши своё..."></textarea>`;

    container.appendChild(div);
}

function toggleGoodPreset(id, text) {
    const textarea = document.getElementById(`good_text_${id}`);
    const currentText = textarea.value;
    const tag = event.target;
    if (currentText.includes(text)) {
        textarea.value = currentText.split('\n').filter(line => !line.includes(text)).join('\n').trim();
        tag.classList.remove('selected');
    } else {
        textarea.value = currentText.trim() ? `${currentText}\n${text}` : text;
        tag.classList.add('selected');
    }
}

function removeGoodEvent(id) {
    const el = document.getElementById(`good_${id}`);
    if (el) el.remove();
}

function addBadEvent() {
    const container = document.getElementById('badEvents');
    const id = badEventCount++;
    const div = document.createElement('div');
    div.className = 'event-item';
    div.id = `bad_${id}`;

    const presetsHtml = BAD_PRESETS.map(p => `<span class="preset-tag" onclick="toggleBadPreset(${id}, '${p.emoji} ${p.text}')">${p.emoji} ${p.text}</span>`).join('');

    div.innerHTML = `
        <div class="event-header">
            <h4>💔 Плохое событие ${badEventCount}</h4>
            <button class="remove-btn" onclick="removeBadEvent(${id})">❌</button>
        </div>
        <div class="event-presets">${presetsHtml}</div>
        <textarea id="bad_text_${id}" rows="3" placeholder="Выбери пресеты или напиши своё..."></textarea>`;

    container.appendChild(div);
}

function toggleBadPreset(id, text) {
    const textarea = document.getElementById(`bad_text_${id}`);
    const currentText = textarea.value;
    const tag = event.target;
    if (currentText.includes(text)) {
        textarea.value = currentText.split('\n').filter(line => !line.includes(text)).join('\n').trim();
        tag.classList.remove('selected');
    } else {
        textarea.value = currentText.trim() ? `${currentText}\n${text}` : text;
        tag.classList.add('selected');
    }
}

function removeBadEvent(id) {
    const el = document.getElementById(`bad_${id}`);
    if (el) el.remove();
}

function collectGoodEvents() {
    const events = [];
    for (let i = 0; i < goodEventCount; i++) {
        const el = document.getElementById(`good_${i}`);
        if (!el) continue;
        const text = document.getElementById(`good_text_${i}`).value;
        if (text.trim()) events.push(text.trim());
    }
    return events;
}

function collectBadEvents() {
    const events = [];
    for (let i = 0; i < badEventCount; i++) {
        const el = document.getElementById(`bad_${i}`);
        if (!el) continue;
        const text = document.getElementById(`bad_text_${i}`).value;
        if (text.trim()) events.push(text.trim());
    }
    return events;
}

function collectActivities() {
    const activities = [];
    for (let i = 0; i < activityCount; i++) {
        const el = document.getElementById(`activity_${i}`);
        if (!el) continue;
        const type = document.getElementById(`activity_type_${i}`).value;
        const other = document.getElementById(`activity_other_${i}`).value;
        const duration = parseInt(document.getElementById(`activity_duration_${i}`).value, 10) || 0;
        const calories = parseInt(document.getElementById(`activity_calories_${i}`).value, 10) || 0;
        activities.push({
            type,
            description: type === 'other' ? other : null,
            duration,
            calories
        });
    }
    return activities;
}

function collectFormData() {
    return {
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        sleepTime: document.getElementById('sleepTime').value,
        wakeTime: document.getElementById('wakeTime').value,
        daySleep: parseInt(document.getElementById('daySleep').value, 10) || 0,
        totalSleep: parseFloat(document.getElementById('totalSleep').value) || 0,
        sleepQuality: parseInt(document.getElementById('sleepQuality').value, 10) || 0,
        activities: collectActivities(),
        steps: parseInt(document.getElementById('steps').value, 10) || 0,
        mood: parseInt(document.getElementById('mood').value, 10) || 0,
        stress: parseInt(document.getElementById('stress').value, 10) || 0,
        goodEvents: collectGoodEvents(),
        badEvents: collectBadEvents(),
        classesAttended: parseInt(document.getElementById('classesAttended').value, 10) || 0,
        classesTotal: parseInt(document.getElementById('classesTotal').value, 10) || 0,
        homeStudyHours: parseFloat(document.getElementById('homeStudyHours').value) || 0,
        difficulty: parseInt(document.getElementById('difficulty').value, 10) || 0,
        procrastination: parseInt(document.getElementById('procrastination').value, 10) || 0,
        productivity: parseInt(document.getElementById('productivity').value, 10) || 0,
        fatigue: parseInt(document.getElementById('fatigue').value, 10) || 0,
        comment: document.getElementById('comment').value
    };
}

// Сохранение
async function saveReport() {
    try {
        const report = collectFormData();
        allReports = allReports.filter(r => r.date !== report.date);
        allReports.push(report);
        allReports.sort((a, b) => new Date(a.date) - new Date(b.date));
        localStorage.setItem('allReports', JSON.stringify(allReports));

        if (await ensureFolderAccess()) {
            const date = new Date(report.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const fileName = `report_${year}_${month}_${day}.json`;
            const fileHandle = await selectedFolder.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(report, null, 2));
            await writable.close();
            localStorage.setItem('folderName', selectedFolder.name);
            document.getElementById('folderStatus').innerHTML = `📁 Папка: <strong>${selectedFolder.name}</strong>`;
            showMessage(`✅ Отчёт сохранён как ${fileName}`, 'success');
        } else {
            showMessage('✅ Отчёт сохранён локально (выбери папку для бэкапа)', 'success');
        }
    } catch (err) {
        showMessage('❌ Ошибка при сохранении: ' + err.message, 'error');
    }
}

// Загрузка из выбранной папки
async function loadFromFolder() {
    if (!await ensureFolderAccess()) {
        showMessage('❌ Сначала выбери папку!', 'error');
        return;
    }
    try {
        const reports = [];
        for await (const entry of selectedFolder.values()) {
            if (entry.kind === 'file' && entry.name.startsWith('report_') && entry.name.endsWith('.json')) {
                const file = await entry.getFile();
                const content = await file.text();
                try { reports.push(JSON.parse(content)); } catch (e) { console.warn('bad file', entry.name); }
            }
        }
        reports.sort((a, b) => new Date(a.date) - new Date(b.date));
        allReports = reports;
        localStorage.setItem('allReports', JSON.stringify(reports));
        showMessage(`✅ Загружено ${reports.length} отчётов`, 'success');
        if (document.getElementById('analytics').classList.contains('active')) {
            loadAnalytics();
        }
    } catch (err) {
        showMessage('❌ Ошибка загрузки: ' + err.message, 'error');
    }
}

// Аналитика
function loadAnalytics() {
    if (!allReports.length) {
        showMessage('❌ Нет данных для анализа', 'error');
        return;
    }
    const periodVal = document.getElementById('analyticsPeriod').value;
    let filtered = allReports;
    if (periodVal !== 'all') {
        const days = parseInt(periodVal, 10);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        filtered = allReports.filter(r => new Date(r.date) >= cutoff);
    }
    if (!filtered.length) {
        showMessage('❌ Нет данных за выбранный период', 'error');
        return;
    }
    updateStatsGrid(filtered);
    updateCharts(filtered);
    updateCorrelations(filtered);
    updateEventsStats(filtered);
}

function updateStatsGrid(reports) {
    const grid = document.getElementById('statsGrid');
    const avg = (field) => reports.reduce((s, r) => s + (r[field] || 0), 0) / reports.length;
    const avgMood = avg('mood');
    const avgSleep = avg('totalSleep');
    const avgStress = avg('stress');
    const avgProductivity = avg('productivity');
    const avgFatigue = avg('fatigue');
    const last = reports[reports.length - 1];
    const prev = reports.length > 1 ? reports[reports.length - 2] : null;
    const trend = (field) => !prev ? '' : `<div class=\"trend ${last[field] > prev[field] ? 'up' : last[field] < prev[field] ? 'down' : 'stable'}\">${last[field] > prev[field] ? '📈 +' : last[field] < prev[field] ? '📉 ' : '➡️ '}${Math.abs(last[field] - prev[field]).toFixed(1)} vs предыдущий</div>`;

    grid.innerHTML = `
        <div class="stat-card"><h3>😊 Среднее настроение</h3><div class="value">${avgMood.toFixed(1)}/10</div>${trend('mood') || ''}</div>
        <div class="stat-card"><h3>😴 Средний сон</h3><div class="value">${avgSleep.toFixed(1)} ч</div></div>
        <div class="stat-card"><h3>😰 Средний стресс</h3><div class="value">${avgStress.toFixed(1)}/10</div></div>
        <div class="stat-card"><h3>⚡ Средняя продуктивность</h3><div class="value">${avgProductivity.toFixed(1)}/10</div></div>
        <div class="stat-card"><h3>😩 Средняя усталость</h3><div class="value">${avgFatigue.toFixed(1)}/10</div></div>
        <div class="stat-card"><h3>📊 Всего записей</h3><div class="value">${reports.length}</div></div>`;
}

function updateCharts(reports) {
    const labels = reports.map(r => {
        const [y, m, d] = r.date.split('-');
        return `${d}.${m}`;
    });
    const mood = reports.map(r => r.mood);
    const stress = reports.map(r => r.stress);
    const productivity = reports.map(r => r.productivity);
    const fatigue = reports.map(r => r.fatigue);
    const sleep = reports.map(r => r.totalSleep);
    const steps = reports.map(r => r.steps || 0);

    const moodMA = movingAverage(mood, 3);
    const stressMA = movingAverage(stress, 3);

    drawChart('moodChart', labels, [
        { data: mood, color: '#5ac8fa', label: 'Настроение' },
        { data: stress, color: '#ff6b6b', label: 'Стресс' },
        { data: moodMA, color: '#8a7bff', label: 'MA(3) настроение', dashed: true },
        { data: stressMA, color: '#f7b955', label: 'MA(3) стресс', dashed: true }
    ], { yMax: 10 });

    drawChart('productivityChart', labels, [
        { data: productivity, color: '#3ecf8e', label: 'Продуктивность' },
        { data: fatigue, color: '#f7b955', label: 'Усталость' }
    ], { yMax: 10 });

    const sleepDebt = sleep.map(h => 8 - h);
    drawChart('sleepChart', labels, [
        { data: sleep, color: '#8a7bff', label: 'Сон (ч)' },
        { data: sleepDebt, color: '#ff6b6b', label: 'Долг сна (8-ч)' }
    ], { yMax: Math.max(10, Math.max(...sleep) + 1) });

    drawChart('stepsMoodChart', labels, [
        { data: normalize(steps), color: '#5ac8fa', label: 'Шаги (норм.)' },
        { data: normalize(mood), color: '#3ecf8e', label: 'Настроение (норм.)' }
    ], { yMax: 1 });
}

function movingAverage(arr, windowSize) {
    const res = [];
    for (let i = 0; i < arr.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const slice = arr.slice(start, i + 1);
        res.push(slice.reduce((s, v) => s + v, 0) / slice.length);
    }
    return res;
}

function normalize(arr) {
    const max = Math.max(...arr, 1);
    return arr.map(v => v / max);
}

function drawChart(canvasId, labels, datasets, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 700;
    const height = canvas.height = 240;
    const padding = { left: 50, right: 20, top: 20, bottom: 40 };
    const gw = width - padding.left - padding.right;
    const gh = height - padding.top - padding.bottom;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0f162d';
    ctx.fillRect(0, 0, width, height);

    const yMax = opts.yMax || 10;
    const stepX = labels.length > 1 ? gw / (labels.length - 1) : gw;
    const yScale = gh / yMax;

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (gh * i) / 5;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }

    // axes labels (Y)
    ctx.fillStyle = '#9aa3c2';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
        const value = (yMax - (yMax * i) / 5).toFixed(0);
        const y = padding.top + (gh * i) / 5;
        ctx.fillText(value, padding.left - 8, y);
    }

    // x labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelStep = Math.max(1, Math.floor(labels.length / 6));
    for (let i = 0; i < labels.length; i += labelStep) {
        const x = padding.left + stepX * i;
        ctx.fillText(labels[i], x, height - padding.bottom + 6);
    }

    // lines
    datasets.forEach(ds => {
        ctx.beginPath();
        ctx.strokeStyle = ds.color;
        ctx.lineWidth = 2;
        if (ds.dashed) ctx.setLineDash([6, 4]); else ctx.setLineDash([]);
        ds.data.forEach((v, i) => {
            const x = padding.left + stepX * i;
            const y = padding.top + gh - v * yScale;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        ds.data.forEach((v, i) => {
            const x = padding.left + stepX * i;
            const y = padding.top + gh - v * yScale;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = ds.color;
            ctx.fill();
        });
    });

    // legend
    ctx.fillStyle = 'rgba(11,16,33,0.9)';
    ctx.fillRect(width - 180, 12, 170, 8 + datasets.length * 18);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(width - 180, 12, 170, 8 + datasets.length * 18);
    datasets.forEach((ds, i) => {
        const y = 18 + i * 18;
        ctx.fillStyle = ds.color;
        ctx.fillRect(width - 170, y, 12, 12);
        ctx.fillStyle = '#e6e9f0';
        ctx.font = '11px Segoe UI';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(ds.label, width - 152, y + 6);
    });
}

function updateCorrelations(reports) {
    const correlations = document.getElementById('correlations');
    const corr = (a, b) => calculateCorrelation(a, b);
    const sleepMood = corr(reports.map(r => r.totalSleep), reports.map(r => r.mood));
    const stressMood = corr(reports.map(r => r.stress), reports.map(r => r.mood));
    const sleepProd = corr(reports.map(r => r.totalSleep), reports.map(r => r.productivity));
    correlations.innerHTML = `
        <div class="correlation-card">
            <h4>😴 Сон → 😊 Настроение</h4>
            <div class="correlation-value">${(sleepMood * 100).toFixed(0)}%</div>
            <div class="correlation-bar"><div class="correlation-fill" style="width:${Math.abs(sleepMood * 100)}%"></div></div>
            <p style="margin-top:8px;color:#9aa3c2;">${sleepMood > 0.3 ? 'Больше сна → лучше настроение' : 'Связь слабая/нет'}</p>
        </div>
        <div class="correlation-card">
            <h4>😰 Стресс → 😊 Настроение</h4>
            <div class="correlation-value">${(stressMood * 100).toFixed(0)}%</div>
            <div class="correlation-bar"><div class="correlation-fill" style="width:${Math.abs(stressMood * 100)}%"></div></div>
            <p style="margin-top:8px;color:#9aa3c2;">${stressMood < -0.3 ? 'Стресс портит настроение' : 'Связь слабая/нет'}</p>
        </div>
        <div class="correlation-card">
            <h4>😴 Сон → ⚡ Продуктивность</h4>
            <div class="correlation-value">${(sleepProd * 100).toFixed(0)}%</div>
            <div class="correlation-bar"><div class="correlation-fill" style="width:${Math.abs(sleepProd * 100)}%"></div></div>
            <p style="margin-top:8px;color:#9aa3c2;">${sleepProd > 0.3 ? 'Больше сна → выше продуктивность' : 'Связь слабая/нет'}</p>
        </div>`;
}

function calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);
    const denom = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    if (!denom) return 0;
    const corr = (n * sumXY - sumX * sumY) / denom;
    return isNaN(corr) ? 0 : corr;
}

function updateEventsStats(reports) {
    const goodEvents = {};
    const badEvents = {};
    reports.forEach(r => {
        (r.goodEvents || []).forEach(e => goodEvents[e] = (goodEvents[e] || 0) + 1);
        (r.badEvents || []).forEach(e => badEvents[e] = (badEvents[e] || 0) + 1);
    });
    const render = (obj) => Object.entries(obj).sort((a,b)=>b[1]-a[1]).map(([event,count]) => `
        <div class="event-stat"><span>${event}</span><span class="count">${count} раз</span></div>`).join('') || '<p>Нет данных</p>';
    document.getElementById('goodEventsStats').innerHTML = render(goodEvents);
    document.getElementById('badEventsStats').innerHTML = render(badEvents);
}

// Экспорт
function exportJSON() {
    const dataStr = JSON.stringify(allReports, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_reports_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showMessage('✅ JSON экспортирован', 'success');
}

function exportCSV() {
    if (!allReports.length) return;
    const headers = ['date','mood','stress','totalSleep','sleepQuality','productivity','fatigue','steps','classesAttended','classesTotal','homeStudyHours','difficulty','procrastination'];
    let csv = headers.join(',') + '\n';
    allReports.forEach(r => { csv += headers.map(h => r[h] ?? '').join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showMessage('✅ CSV экспортирован', 'success');
}

function exportStats() {
    if (!allReports.length) return;
    const avg = (f) => (allReports.reduce((s,r)=>s+(r[f]||0),0)/allReports.length).toFixed(2);
    const stats = { exportDate: new Date().toISOString(), totalReports: allReports.length, averages: {
        mood: avg('mood'), stress: avg('stress'), sleep: avg('totalSleep'), productivity: avg('productivity'), fatigue: avg('fatigue')
    } };
    const dataStr = JSON.stringify(stats, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stats_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showMessage('✅ Статистика экспортирована', 'success');
}

function clearAllData() {
    if (confirm('Точно удалить все данные? Это нельзя отменить!')) {
        allReports = [];
        localStorage.removeItem('allReports');
        showMessage('🧹 Все данные удалены', 'success');
        if (document.getElementById('analytics').classList.contains('active')) {
            loadAnalytics();
        }
    }
}

// Сообщения
function showMessage(text, type) {
    const el = document.getElementById('message');
    el.textContent = text;
    el.className = `message ${type}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
}
