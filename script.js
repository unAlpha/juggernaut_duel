// Preload frames to prevent flickering during animation
const preloadedFrames = [];
for (let i = 0; i < 6; i++) {
    const img = new Image();
    img.src = `frames/frame_${i}.png`;
    preloadedFrames.push(img);
}

// --- 隐藏控制参数 (Hidden Control Parameters) ---
// 你可以直接在这里修改数值，以调整战斗动画的效果
const ANIM_CONFIG = {
    lungeDistSimultaneous: 130, // 同时对砍时的冲刺距离 (px)
    lungeDistTurnBased: 270,    // 轮流对砍或单边攻击时的冲刺距离 (px)
    hitShakeDist: 10,           // 角色受击时的水平晃动距离 (px)
    hitShakeAngle: 3,           // 角色受击时的旋转晃动角度 (deg)
    idleBreathScale: 0.79,      // 待机呼吸缩放强度 (1为不缩放，数值越小呼吸起伏越大)
    idleBreathScaleX: 0.90,     // 待机呼吸横向缩放强度 (1为不缩放，数值越小呼吸起伏越大)
    particleCount: 500,         // 粒子飞溅系统强度 (产生的粒子数量)
    screenShakeIntensity: 10,   // 碎屏级暴击反馈强度 (屏幕晃动距离 px)
    slashScale: 30,             // 刀光特效强度 (刀光动画拉伸长度倍数)
    textLanguage: 'CN',         // 战斗浮动文字语言 ('EN' 显示 MISS/CRIT，'CN' 显示 闪避/暴击)
    fontSizeDodge: 3,           // 闪避/MISS 文字大小 (rem)
    fontSizeCrit: 3.5,          // 暴击/CRIT 文字大小 (rem)
    textOffsetXDodge: 60,       // 闪避文字水平位置微调 (px，正数向两侧外扩，负数向内收缩)
    textOffsetYDodge: 30,       // 闪避文字垂直位置微调 (px，负数向上，正数向下)
    textOffsetXCrit: 60,        // 暴击及普通伤害(-1)水平位置微调 (px，正数向两侧外扩，负数向内收缩)
    textOffsetYCrit: 30,        // 暴击及普通伤害(-1)垂直位置微调 (px，负数向上，正数向下)
    attackForwardPct: 30,       // 冲刺前进所占动画时间百分比 (越小冲得越快)
    attackHoldPct: 80,          // 保持冲刺姿势到什么时候开始后退 (百分比，越大后退越快，越小后退越慢，原来是85)
    charSpacing: -65,           // 控制人物初始距离 (px，越小越近，越大越远，默认 -50)
    characterVerticalOffset: -80, // 控制人物垂直位置 (px，正数向下，负数向上)
    sidebarDefaultWidth: 280,   // 左右侧边栏默认宽度 (px)
    sidebarMinWidth: 280,       // 左右侧边栏拖拽最小宽度 (px，不是默认宽度)
    rememberSidebarWidth: false, // 是否记住拖拽后的侧边栏宽度（false 时刷新恢复默认宽度）

    healthBarHeight: 44,       // 顶部血条高度 (px，当前默认高度)
    healthBarTopOffset: 50,     // 顶部血条距离竞技场上方的位置 (px)

    showFighterNames: true,     // 是否显示血条下方的角色名称
    fighterNameFontSize: 1.5,  // 血条下方角色名称字体大小 (rem)
    fighterNameTopOffset: 18,   // 角色名称距离血条下方的垂直位置 (px，越大越往下)
    fighterNameHorizontalOffset: 14, // 角色名称距离血条左右边缘的位置 (px，越大越往内)

    enableAfterimage: true,     // 是否开启闪避残影特效
    enableShockwave: true,      // 是否开启受击震荡波特效
    enableCritFlash: true,      // 是否开启暴击全屏闪屏特效
    enableSound: true           // 是否开启音效
};

function applyAnimConfig() {
    // 修复不连续的缩放计算公式：让1精确对应不缩放，且数值在1附近时过渡平滑。
    let ampY = 0;
    if (ANIM_CONFIG.idleBreathScale < 1) {
        ampY = (1 - ANIM_CONFIG.idleBreathScale) * 0.1; // 数值越小(趋近0)，Y压扁越多(最大约0.1)
    } else if (ANIM_CONFIG.idleBreathScale > 1) {
        ampY = - (ANIM_CONFIG.idleBreathScale - 1) * 0.02; // 大于1时稍微反向(向上拉伸)
    }
    let idleScaleVal = 1 - ampY;

    let ampX = 0;
    if (ANIM_CONFIG.idleBreathScaleX < 1) {
        ampX = (1 - ANIM_CONFIG.idleBreathScaleX) * 0.1; // 数值越小(趋近0)，X横向拉伸越多
    } else if (ANIM_CONFIG.idleBreathScaleX > 1) {
        ampX = - (ANIM_CONFIG.idleBreathScaleX - 1) * 0.02; // 大于1时稍微反向(向内挤压)
    }
    let idleScaleValX = 1 + ampX;

    document.documentElement.style.setProperty('--idle-scale', idleScaleVal);
    document.documentElement.style.setProperty('--idle-scale-x', idleScaleValX);
    document.documentElement.style.setProperty('--screen-shake-dist', `${ANIM_CONFIG.screenShakeIntensity}px`);
    document.documentElement.style.setProperty('--slash-scale', ANIM_CONFIG.slashScale);
    document.documentElement.style.setProperty('--font-size-dodge', `${ANIM_CONFIG.fontSizeDodge}rem`);
    document.documentElement.style.setProperty('--font-size-crit', `${ANIM_CONFIG.fontSizeCrit}rem`);
    document.documentElement.style.setProperty('--text-offset-x-dodge', `${ANIM_CONFIG.textOffsetXDodge}px`);
    document.documentElement.style.setProperty('--text-offset-y-dodge', `${ANIM_CONFIG.textOffsetYDodge}px`);
    document.documentElement.style.setProperty('--text-offset-x-crit', `${ANIM_CONFIG.textOffsetXCrit}px`);
    document.documentElement.style.setProperty('--text-offset-y-crit', `${ANIM_CONFIG.textOffsetYCrit}px`);
    document.documentElement.style.setProperty('--char-spacing', `${ANIM_CONFIG.charSpacing}px`);
    document.documentElement.style.setProperty('--character-vertical-offset', `${ANIM_CONFIG.characterVerticalOffset}px`);
    document.documentElement.style.setProperty('--left-panel-width', `${ANIM_CONFIG.sidebarDefaultWidth}px`);
    document.documentElement.style.setProperty('--right-panel-width', `${ANIM_CONFIG.sidebarDefaultWidth}px`);
    document.documentElement.style.setProperty('--sidebar-min-width', `${ANIM_CONFIG.sidebarMinWidth}px`);
    document.documentElement.style.setProperty('--health-bar-height', `${ANIM_CONFIG.healthBarHeight}px`);
    document.documentElement.style.setProperty('--health-bar-top-offset', `${ANIM_CONFIG.healthBarTopOffset}px`);
    document.documentElement.style.setProperty('--fighter-name-display', ANIM_CONFIG.showFighterNames ? 'block' : 'none');
    document.documentElement.style.setProperty('--fighter-name-font-size', `${ANIM_CONFIG.fighterNameFontSize}rem`);
    document.documentElement.style.setProperty('--fighter-name-top-offset', `${ANIM_CONFIG.fighterNameTopOffset}px`);
    document.documentElement.style.setProperty('--fighter-name-horizontal-offset', `${ANIM_CONFIG.fighterNameHorizontalOffset}px`);

    let styleTag = document.getElementById('dynamic-anim-styles');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-anim-styles';
        document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
        @keyframes lungeA {
            0% { transform: translateX(0); }
            ${ANIM_CONFIG.attackForwardPct}% { transform: translateX(var(--lunge-dist, 250px)); }
            ${ANIM_CONFIG.attackHoldPct}% { transform: translateX(var(--lunge-dist, 250px)); }
            100% { transform: translateX(0); }
        }
        @keyframes lungeB {
            0% { transform: translateX(0); }
            ${ANIM_CONFIG.attackForwardPct}% { transform: translateX(calc(-1 * var(--lunge-dist, 250px))); }
            ${ANIM_CONFIG.attackHoldPct}% { transform: translateX(calc(-1 * var(--lunge-dist, 250px))); }
            100% { transform: translateX(0); }
        }
    `;
}
applyAnimConfig(); // 初始化时应用一次

// ------------------------------------------------

// --- 高级音效引擎 (Web Audio API - 调频 FM 合成) ---
let audioCtx;
let noiseBuffer;

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function getNoiseBuffer() {
    if (!noiseBuffer && audioCtx) {
        const bufferSize = audioCtx.sampleRate * 2; // 2 seconds
        noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
    }
    return noiseBuffer;
}

// 使用 FM (频率调制) 产生电影级夸张的金属碰撞与反光声
function playFMMetal(t, duration, freqC, freqM, modIndex, volume, sweepMultiplier = 0.95) {
    const carrier = audioCtx.createOscillator();
    const modulator = audioCtx.createOscillator();
    const modGain = audioCtx.createGain();
    const masterGain = audioCtx.createGain();

    carrier.type = 'sine';
    carrier.frequency.value = freqC;

    modulator.type = 'sine';
    modulator.frequency.value = freqM;

    // 调制深度
    modGain.gain.value = freqC * modIndex;

    // 调制器改变载波的频率
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    carrier.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    // 电影音效需要略微平滑的起音和长长的余音，创造一种“空间感”
    masterGain.gain.setValueAtTime(0, t);
    masterGain.gain.linearRampToValueAtTime(volume, t + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    // 电影剑光通常带有音高的上扬（拔剑声）或轻微下降（重劈）
    carrier.frequency.exponentialRampToValueAtTime(freqC * sweepMultiplier, t + duration);

    carrier.start(t);
    carrier.stop(t + duration);
    modulator.start(t);
    modulator.stop(t + duration);
}

const SFX = {
    play: (type) => {
        if (!ANIM_CONFIG.enableSound) return;
        initAudio();
        const t = audioCtx.currentTime;

        if (type === 'slash') {
            // 挥击：锋利干脆的剑风声（使用带通滤波白噪，绝对避免使用纯正弦波产生鸟叫声）
            const noise = audioCtx.createBufferSource();
            noise.buffer = getNoiseBuffer();
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.Q.value = 1.5; // 轻微共振增加锋利感，但不过高以免产生哨声
            filter.frequency.setValueAtTime(3000, t);
            filter.frequency.exponentialRampToValueAtTime(800, t + 0.15);

            const gain = audioCtx.createGain();
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(2.0, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

            noise.start(t);
            noise.stop(t + 0.15);

        } else if (type === 'hit') {
            // 普通命中肉体：取消金属声，改为沉闷的入肉声和衣物/血肉撕裂声

            // 1. 沉闷的重击感 (Thud)
            const thud = audioCtx.createOscillator();
            const thudGain = audioCtx.createGain();
            thud.type = 'sine'; // 低频正弦波产生肉搏的闷响
            thud.frequency.setValueAtTime(150, t);
            thud.frequency.exponentialRampToValueAtTime(40, t + 0.15);
            thud.connect(thudGain);
            thudGain.connect(audioCtx.destination);
            thudGain.gain.setValueAtTime(3.0, t);
            thudGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
            thud.start(t);
            thud.stop(t + 0.15);

            // 2. 刀刃切开血肉/衣服的撕裂声 (Squelch)
            const noise = audioCtx.createBufferSource();
            noise.buffer = getNoiseBuffer();
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass'; // 低通滤波，避免产生清脆的金属感，强调沉闷的撕裂感
            filter.frequency.setValueAtTime(2500, t);
            filter.frequency.exponentialRampToValueAtTime(300, t + 0.1);
            const noiseGain = audioCtx.createGain();
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(audioCtx.destination);
            noiseGain.gain.setValueAtTime(2.5, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            noise.start(t);
            noise.stop(t + 0.1);

        } else if (type === 'crit') {
            // 受重伤（暴击）：取消所有金属的叮叮声，改为极其惨烈的骨折/重击/撕裂声

            // 1. 骨头断裂/沉闷爆震感 (Massive Thud & Crunch)
            const thud = audioCtx.createOscillator();
            const thudGain = audioCtx.createGain();
            thud.type = 'square'; // 用方波带来粗糙的破裂感，模拟重创
            thud.frequency.setValueAtTime(100, t);
            thud.frequency.exponentialRampToValueAtTime(20, t + 0.3);

            // 加入低通滤波让方波变成沉闷的肉体爆裂声
            const thudFilter = audioCtx.createBiquadFilter();
            thudFilter.type = 'lowpass';
            thudFilter.frequency.setValueAtTime(800, t);
            thudFilter.frequency.exponentialRampToValueAtTime(100, t + 0.3);

            thud.connect(thudFilter);
            thudFilter.connect(thudGain);
            thudGain.connect(audioCtx.destination);
            thudGain.gain.setValueAtTime(4.0, t);
            thudGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            thud.start(t);
            thud.stop(t + 0.3);

            // 2. 极其残暴的血肉大面积撕裂声 (Massive Squelch / Gore)
            const noise = audioCtx.createBufferSource();
            noise.buffer = getNoiseBuffer();
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass'; // 低通滤波保留沉闷的血肉感
            filter.frequency.setValueAtTime(4000, t);
            filter.frequency.exponentialRampToValueAtTime(200, t + 0.25);
            const noiseGain = audioCtx.createGain();
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(audioCtx.destination);
            noiseGain.gain.setValueAtTime(4.0, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
            noise.start(t);
            noise.stop(t + 0.25);

            // 3. 短促尖锐的骨裂声 (Bone Snap)
            const snap = audioCtx.createBufferSource();
            snap.buffer = getNoiseBuffer();
            const snapFilter = audioCtx.createBiquadFilter();
            snapFilter.type = 'highpass';
            snapFilter.frequency.setValueAtTime(6000, t);
            snapFilter.frequency.exponentialRampToValueAtTime(2000, t + 0.05);
            const snapGain = audioCtx.createGain();
            snap.connect(snapFilter);
            snapFilter.connect(snapGain);
            snapGain.connect(audioCtx.destination);
            snapGain.gain.setValueAtTime(5.0, t);
            snapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
            snap.start(t);
            snap.stop(t + 0.05);

        } else if (type === 'dodge') {
            // 闪避声：快速掠过的低沉风声
            const noise = audioCtx.createBufferSource();
            noise.buffer = getNoiseBuffer();
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.Q.value = 1.0;
            filter.frequency.setValueAtTime(2000, t);
            filter.frequency.exponentialRampToValueAtTime(400, t + 0.2);

            const gain = audioCtx.createGain();
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(1.5, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

            noise.start(t);
            noise.stop(t + 0.2);
        }
    }
};

// ------------------------------------------------

const els = {
    // A Panel
    hpA: document.getElementById('hpA'),
    hpAVal: document.getElementById('hpAVal'),
    dodgeA: document.getElementById('dodgeA'),
    dodgeAVal: document.getElementById('dodgeAVal'),
    critA: document.getElementById('critA'),
    critAVal: document.getElementById('critAVal'),
    critMultA: document.getElementById('critMultA'),
    critMultAVal: document.getElementById('critMultAVal'),

    // B Panel
    hpB: document.getElementById('hpB'),
    hpBVal: document.getElementById('hpBVal'),
    dodgeB: document.getElementById('dodgeB'),
    dodgeBVal: document.getElementById('dodgeBVal'),
    critB: document.getElementById('critB'),
    critBVal: document.getElementById('critBVal'),
    critMultB: document.getElementById('critMultB'),
    critMultBVal: document.getElementById('critMultBVal'),

    // Global
    combatMode: document.getElementById('combatMode'),
    calcPriority: document.getElementById('calcPriority'),
    trueStrike: document.getElementById('trueStrike'),
    trueStrikeVal: document.getElementById('trueStrikeVal'),
    strikeDuration: document.getElementById('strikeDuration'),
    strikeDurationVal: document.getElementById('strikeDurationVal'),

    // Arena Elements
    healthA: document.getElementById('healthA'),
    healthTextA: document.getElementById('healthTextA'),
    charA: document.getElementById('charA'),
    floatA: document.getElementById('floatA'),

    healthB: document.getElementById('healthB'),
    healthTextB: document.getElementById('healthTextB'),
    charB: document.getElementById('charB'),
    floatB: document.getElementById('floatB'),

    startBtn: document.getElementById('startBtn'),
    resetBtn: document.getElementById('resetBtn'),
    battleLog: document.getElementById('battleLog'),

    winMessage: document.getElementById('winMessage'),
    winText: document.getElementById('winText'),

    // Data Analysis Modal
    analysisBtn: document.getElementById('analysisBtn'),
    analysisModal: document.getElementById('analysisModal'),
    closeAnalysisModal: document.getElementById('closeAnalysisModal'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    hpCurveChart: document.getElementById('hpCurveChart'),
    winRateChart: document.getElementById('winRateChart'),
    hpDistChart: document.getElementById('hpDistChart'),
    hpTrendChart: document.getElementById('hpTrendChart')
};

// Global Data and Chart Instances
let battleHpHistory = { A: [], B: [], labels: [] };
let hpCurveChartInstance = null;
let winRateChartInstance = null;
let hpDistChartInstance = null;
let hpTrendChartInstance = null;

// Bind inputs to display values
function bindInput(input, valDisplay) {
    input.addEventListener('input', () => {
        if (valDisplay.tagName === 'INPUT') {
            valDisplay.value = input.value;
        } else {
            valDisplay.textContent = input.value;
        }
        if (!isPlaying) resetState();
    });

    if (valDisplay.tagName === 'INPUT') {
        valDisplay.addEventListener('change', () => {
            // Ensure min/max boundaries
            let val = parseFloat(valDisplay.value);
            let min = parseFloat(input.min);
            let max = parseFloat(input.max);
            if (!isNaN(val)) {
                if (val < min) val = min;
                if (val > max) val = max;
                valDisplay.value = val;
                input.value = val;
                if (!isPlaying) resetState();
            }
        });
    }
}

bindInput(els.hpA, els.hpAVal);
bindInput(els.dodgeA, els.dodgeAVal);
bindInput(els.critA, els.critAVal);
bindInput(els.critMultA, els.critMultAVal);

bindInput(els.hpB, els.hpBVal);
bindInput(els.dodgeB, els.dodgeBVal);
bindInput(els.critB, els.critBVal);
bindInput(els.critMultB, els.critMultBVal);

if (els.trueStrike && els.trueStrikeVal) bindInput(els.trueStrike, els.trueStrikeVal);
if (els.strikeDuration && els.strikeDurationVal) bindInput(els.strikeDuration, els.strikeDurationVal);

if (els.calcPriority) {
    els.calcPriority.addEventListener('change', () => {
        const tsGroup = document.getElementById('trueStrikeGroup');
        if (tsGroup) {
            tsGroup.style.display = els.calcPriority.value === 'crit_first' ? 'flex' : 'none';
        }
        if (!isPlaying) resetState();
    });
    // Init state
    const tsGroup = document.getElementById('trueStrikeGroup');
    if (tsGroup) {
        tsGroup.style.display = els.calcPriority.value === 'crit_first' ? 'flex' : 'none';
    }
}

// Game State
let state = {
    A: { maxHp: 20, currentHp: 20 },
    B: { maxHp: 20, currentHp: 20 }
};

let isPlaying = false;
let animationTimeout = null;
let currentScript = [];

function initParams() {
    state.A.maxHp = parseFloat(els.hpA.value);
    state.B.maxHp = parseFloat(els.hpB.value);
    state.A.currentHp = state.A.maxHp;
    state.B.currentHp = state.B.maxHp;
}

function updateHealthBars() {
    const pctA = Math.max(0, (state.A.currentHp / state.A.maxHp) * 100);
    const pctB = Math.max(0, (state.B.currentHp / state.B.maxHp) * 100);

    // Animate trails slightly later
    setTimeout(() => {
        document.getElementById('healthTrailA').style.width = pctA + '%';
        document.getElementById('healthTrailB').style.width = pctB + '%';
    }, 200);

    els.healthA.style.width = pctA + '%';
    els.healthB.style.width = pctB + '%';

    // Change color based on health percentage
    const colorA = pctA > 50 ? 'var(--hp-green)' : (pctA > 20 ? '#ffaa00' : '#ff3333');
    const colorB = pctB > 50 ? 'var(--hp-green)' : (pctB > 20 ? '#ffaa00' : '#ff3333');
    els.healthA.style.backgroundColor = colorA;
    els.healthB.style.backgroundColor = colorB;
    els.healthA.style.boxShadow = `0 0 15px ${colorA}`;
    els.healthB.style.boxShadow = `0 0 15px ${colorB}`;

    if (els.healthTextA) els.healthTextA.textContent = `${Math.ceil(state.A.currentHp)} / ${state.A.maxHp}`;
    if (els.healthTextB) els.healthTextB.textContent = `${Math.ceil(state.B.currentHp)} / ${state.B.maxHp}`;
}

function resetState() {
    if (isPlaying) return;
    initParams();
    updateHealthBars();
    els.battleLog.innerHTML = '';
    els.floatA.innerHTML = '';
    els.floatB.innerHTML = '';
    els.winMessage.classList.add('hidden');
    els.charA.className = 'character player-a';
    els.charB.className = 'character player-b';
    els.charA.querySelector('.sprite-character').classList.add('sprite-a');
    els.charB.querySelector('.sprite-character').classList.add('sprite-b');

    // 给两名角色随机分配略微不同的呼吸频率 (2.0s ~ 3.5s 之间)
    els.charA.querySelector('.sprite-character').style.setProperty('--breath-duration', (2 + Math.random() * 1.5) + 's');
    els.charB.querySelector('.sprite-character').style.setProperty('--breath-duration', (2 + Math.random() * 1.5) + 's');

    clearTimeout(animationTimeout);
}

els.resetBtn.addEventListener('click', resetState);

// Add log entry
function log(msg, type = '') {
    const p = document.createElement('p');
    p.innerHTML = msg;
    if (type) p.className = type;
    els.battleLog.appendChild(p);
    els.battleLog.scrollTop = els.battleLog.scrollHeight;
}

// Create floating text
function showFloatingText(container, text, type) {
    const el = document.createElement('div');
    el.className = `float-text ${type}`;
    el.innerHTML = text;
    // Slight random horizontal offset
    el.style.left = `calc(50% + ${(Math.random() - 0.5) * 40}px)`;
    container.appendChild(el);
    setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
    }, 800);
}

// 闪避残影特效
function createAfterimage(targetElem) {
    if (!ANIM_CONFIG.enableAfterimage) return;
    const after = document.createElement('div');
    after.className = 'afterimage';
    const sprite = targetElem.querySelector('.sprite-character');
    const style = window.getComputedStyle(sprite);
    after.style.backgroundImage = style.getPropertyValue('background-image');
    after.style.setProperty('--base-scale-x', style.getPropertyValue('--base-scale-x'));
    after.style.setProperty('--base-filter', style.getPropertyValue('--base-filter'));
    targetElem.appendChild(after);
    setTimeout(() => { if (after.parentNode) after.parentNode.removeChild(after); }, 400);
}

// 震荡波特效
function createShockwave(targetElem, color) {
    if (!ANIM_CONFIG.enableShockwave) return;
    const rect = targetElem.getBoundingClientRect();
    const arena = document.querySelector('.arena');
    const arenaRect = arena.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - arenaRect.left;
    const y = rect.top + rect.height / 2 - arenaRect.top;

    const wave = document.createElement('div');
    wave.className = 'shockwave anim-shockwave';
    wave.style.borderColor = color;
    wave.style.color = color;
    wave.style.left = `${x}px`;
    wave.style.top = `${y}px`;

    arena.appendChild(wave);
    setTimeout(() => { if (wave.parentNode) wave.parentNode.removeChild(wave); }, 400);
}

// 全屏闪烁特效
let flashOverlay = document.getElementById('flashOverlay');
if (!flashOverlay) {
    flashOverlay = document.createElement('div');
    flashOverlay.id = 'flashOverlay';
    flashOverlay.className = 'crit-flash-overlay';
    document.body.appendChild(flashOverlay);
}
function triggerCritFlash(color) {
    if (!ANIM_CONFIG.enableCritFlash) return;
    flashOverlay.style.background = color;
    flashOverlay.classList.remove('anim-crit-flash');
    void flashOverlay.offsetWidth;
    flashOverlay.classList.add('anim-crit-flash');
}

function getModeText(mode) {
    switch (mode) {
        case 'simultaneous': return '同时对砍';
        case 'turn_a': return '轮流模式 (闪避先砍)';
        case 'turn_b': return '轮流模式 (暴击先砍)';
        case 'a_only': return '单边砍 (A砍B)';
        case 'b_only': return '单边砍 (B砍A)';
        default: return mode;
    }
}

// Battle Engine: Generate Script
function generateBattleScript() {
    const rounds = 10000; // 强制至死方休，设置一个极大的上限防止死循环
    const mode = els.combatMode ? els.combatMode.value : 'simultaneous';
    const calcPriority = els.calcPriority ? els.calcPriority.value : 'dodge_first';
    const paramA = {
        dodge: parseFloat(els.dodgeA.value) / 100,
        crit: parseFloat(els.critA.value) / 100,
        critMult: parseFloat(els.critMultA.value)
    };
    const paramB = {
        dodge: parseFloat(els.dodgeB.value) / 100,
        crit: parseFloat(els.critB.value) / 100,
        critMult: parseFloat(els.critMultB.value)
    };

    let simHpA = state.A.maxHp;
    let simHpB = state.B.maxHp;
    let script = [];

    for (let i = 1; i <= rounds; i++) {
        if (simHpA <= 0 || simHpB <= 0) break;

        let roundData = { round: i, A: null, B: null, endHpA: 0, endHpB: 0 };

        const aAttacks = () => {
            let aHit = false, aDmg = 0, aCrit = false, aTs = false;
            if (mode !== 'b_only') {
                if (calcPriority === 'crit_first') {
                    aCrit = Math.random() < paramA.crit;
                    const tsProb = els.trueStrike ? parseFloat(els.trueStrike.value) / 100 : 0.8;
                    aTs = Math.random() < tsProb;
                    if (aTs) {
                        aHit = true;
                        aDmg = aCrit ? 1 * paramA.critMult : 1;
                    } else {
                        aHit = Math.random() >= paramB.dodge;
                        aDmg = aHit ? (aCrit ? 1 * paramA.critMult : 1) : 0;
                    }
                } else {
                    aHit = Math.random() >= paramB.dodge;
                    if (aHit) {
                        aCrit = Math.random() < paramA.crit;
                        aDmg = aCrit ? 1 * paramA.critMult : 1;
                    }
                }
                if (aHit) simHpB -= aDmg;
                roundData.A = { hit: aHit, crit: aCrit, dmg: aDmg, hpAfter: simHpB, trueStrike: aTs };
            }
        };

        const bAttacks = () => {
            let bHit = false, bDmg = 0, bCrit = false, bTs = false;
            if (mode !== 'a_only') {
                if (calcPriority === 'crit_first') {
                    bCrit = Math.random() < paramB.crit;
                    const tsProb = els.trueStrike ? parseFloat(els.trueStrike.value) / 100 : 0.8;
                    bTs = Math.random() < tsProb;
                    if (bTs) {
                        bHit = true;
                        bDmg = bCrit ? 1 * paramB.critMult : 1;
                    } else {
                        bHit = Math.random() >= paramA.dodge;
                        bDmg = bHit ? (bCrit ? 1 * paramB.critMult : 1) : 0;
                    }
                } else {
                    bHit = Math.random() >= paramA.dodge;
                    if (bHit) {
                        bCrit = Math.random() < paramB.crit;
                        bDmg = bCrit ? 1 * paramB.critMult : 1;
                    }
                }
                if (bHit) simHpA -= bDmg;
                roundData.B = { hit: bHit, crit: bCrit, dmg: bDmg, hpAfter: simHpA, trueStrike: bTs };
            }
        };

        if (mode === 'turn_b') {
            bAttacks();
            if (simHpA <= 0) {
                roundData.endHpA = simHpA;
                roundData.endHpB = simHpB;
                script.push(roundData);
                break;
            }
            aAttacks();
        } else {
            aAttacks();
            if ((mode === 'turn_a' || mode === 'a_only') && simHpB <= 0) {
                roundData.endHpA = simHpA;
                roundData.endHpB = simHpB;
                script.push(roundData);
                break;
            }
            bAttacks();
        }

        roundData.endHpA = simHpA;
        roundData.endHpB = simHpB;
        script.push(roundData);
    }
    return script;
}

// Helper to execute a single attack animation and logging
function playAttackAnim(attacker, defender, attackData, delayMs) {
    const isA = attacker === 'A';
    const charElem = isA ? els.charA : els.charB;
    const defElem = isA ? els.charB : els.charA;
    const floatElem = isA ? els.floatB : els.floatA;
    const slashElem = document.getElementById(isA ? 'slashB' : 'slashA');
    const animClass = isA ? 'anim-attack-a' : 'anim-attack-b';

    const totalAnimTime = delayMs * 0.8;
    const impactDelay = totalAnimTime * 0.75; // The sword visually hits at ~75% of the animation

    document.documentElement.style.setProperty('--anim-time', `${totalAnimTime}ms`);

    charElem.classList.add(animClass);
    SFX.play('slash');
    setTimeout(() => charElem.classList.remove(animClass), totalAnimTime);

    setTimeout(() => {
        if (!isPlaying) return; // Prevent effects if reset was pressed

        let logMsg = `${attacker} 攻击 ${isA ? 'B' : 'A'}：`;
        const priorityVal = document.getElementById('calcPriority') ? document.getElementById('calcPriority').value : 'dodge_first';
        if (priorityVal === 'crit_first' && attackData.trueStrike) {
            logMsg += `<span style="color: #ffaa00; font-weight: bold;">[克敌机先]</span> `;
        }

        if (!attackData.hit) {
            logMsg += `<span class="log-dodge">被闪避！</span>`;
            defElem.classList.add('anim-dodge');
            SFX.play('dodge');

            // 触发残影
            createAfterimage(defElem);
            setTimeout(() => createAfterimage(defElem), 100);

            setTimeout(() => defElem.classList.remove('anim-dodge'), totalAnimTime * 0.6);
            const dodgeText = ANIM_CONFIG.textLanguage === 'CN' ? '闪避' : 'MISS';
            showFloatingText(floatElem, dodgeText, 'text-dodge');
        } else {
            if (isA) state.B.currentHp -= attackData.dmg;
            else state.A.currentHp -= attackData.dmg;

            slashElem.classList.remove('anim-slash');
            void slashElem.offsetWidth;
            slashElem.classList.add('anim-slash');

            defElem.classList.add('anim-hit');
            setTimeout(() => defElem.classList.remove('anim-hit'), totalAnimTime * 0.6);

            if (attackData.crit) {
                logMsg += `<span class="log-crit">暴击！造成 ${attackData.dmg} 伤害</span>`;
                const critText = ANIM_CONFIG.textLanguage === 'CN' ? '暴击' : 'CRIT';
                showFloatingText(floatElem, `${critText}<br>-${attackData.dmg}`, 'text-crit');
                const containerElem = document.querySelector('.container');
                if (containerElem) {
                    containerElem.classList.add('screen-shake');
                    setTimeout(() => containerElem.classList.remove('screen-shake'), 400);
                }
                createParticles(defElem, isA ? '#00f0ff' : '#ff0055');
                createShockwave(defElem, isA ? '#00f0ff' : '#ff0055');
                triggerCritFlash(isA ? 'rgba(0,240,255,0.3)' : 'rgba(255,0,85,0.3)');
                SFX.play('crit');
            } else {
                createParticles(defElem, '#ffffff');
                createShockwave(defElem, 'rgba(255,255,255,0.3)');
                logMsg += `造成 ${attackData.dmg} 伤害`;
                showFloatingText(floatElem, `-${attackData.dmg}`, 'text-damage');
                SFX.play('hit');
            }
        }
        log(logMsg);
        updateHealthBars();
    }, impactDelay);
}

// Play out the script
async function playSimulation() {
    if (isPlaying) return;
    isPlaying = true;
    els.startBtn.disabled = true;
    els.winMessage.classList.add('hidden');
    if (ANIM_CONFIG.enableSound) initAudio();

    initParams();
    updateHealthBars();
    els.battleLog.innerHTML = '';
    els.charA.classList.remove('dead');
    els.charB.classList.remove('dead');

    currentScript = generateBattleScript();

    const mode = els.combatMode ? els.combatMode.value : 'simultaneous';

    // Adjust lunge distance so they don't clip through each other in simultaneous mode
    const lungeDist = mode === 'simultaneous' ? `${ANIM_CONFIG.lungeDistSimultaneous}px` : `${ANIM_CONFIG.lungeDistTurnBased}px`;
    document.documentElement.style.setProperty('--lunge-dist', lungeDist);

    // Set dynamic shake amplitude variables
    document.documentElement.style.setProperty('--shake-dist', `${ANIM_CONFIG.hitShakeDist}px`);
    document.documentElement.style.setProperty('--shake-angle', `${ANIM_CONFIG.hitShakeAngle}deg`);
    applyAnimConfig();

    let delayMs = parseFloat(els.strikeDuration.value);
    if (isNaN(delayMs) || delayMs < 1) delayMs = 1;

    const conditionStr = '至死方休';
    log(`=== 战斗开始 (模式: ${getModeText(mode)}, ${conditionStr}) ===`);

    battleHpHistory = { A: [state.A.maxHp], B: [state.B.maxHp], labels: ['Start'] };

    for (let i = 0; i < currentScript.length; i++) {
        const turn = currentScript[i];

        log(`[第 ${turn.round} 回合]`, 'log-turn');

        if (mode === 'simultaneous') {
            await new Promise(resolve => {
                animationTimeout = setTimeout(() => {
                    if (turn.A) playAttackAnim('A', 'B', turn.A, delayMs);
                    if (turn.B) playAttackAnim('B', 'A', turn.B, delayMs);
                    resolve();
                }, delayMs);
            });
        } else if (mode === 'turn_a' || mode === 'turn_b') {
            // Turn-based
            const halfDelay = delayMs / 2;

            const executeA = async () => {
                if (turn.A) {
                    await new Promise(resolve => {
                        animationTimeout = setTimeout(() => {
                            playAttackAnim('A', 'B', turn.A, halfDelay);
                            resolve();
                        }, halfDelay);
                    });
                }
            };

            const executeB = async () => {
                if (turn.B) {
                    await new Promise(resolve => {
                        animationTimeout = setTimeout(() => {
                            playAttackAnim('B', 'A', turn.B, halfDelay);
                            resolve();
                        }, halfDelay);
                    });
                }
            };

            if (mode === 'turn_a') {
                await executeA();
                await executeB();
            } else {
                await executeB();
                await executeA();
            }
        } else if (mode === 'a_only') {
            await new Promise(resolve => {
                animationTimeout = setTimeout(() => {
                    if (turn.A) playAttackAnim('A', 'B', turn.A, delayMs);
                    resolve();
                }, delayMs);
            });
        } else if (mode === 'b_only') {
            await new Promise(resolve => {
                animationTimeout = setTimeout(() => {
                    if (turn.B) playAttackAnim('B', 'A', turn.B, delayMs);
                    resolve();
                }, delayMs);
            });
        }

        battleHpHistory.A.push(Math.max(0, turn.endHpA));
        battleHpHistory.B.push(Math.max(0, turn.endHpB));
        battleHpHistory.labels.push(`回合 ${turn.round}`);

        if (turn.endHpA <= 0 || turn.endHpB <= 0) {
            break;
        }
    }

    // End of Battle
    log('=== 战斗结束 ===');

    setTimeout(() => {
        let resultMsg = "";
        let color = "";
        if (state.A.currentHp <= 0 && state.B.currentHp <= 0) {
            log('双方阵亡，同归于尽！', 'log-dead');
            resultMsg = "同归于尽！";
            color = "#fff";
            els.charA.classList.add('dead');
            els.charB.classList.add('dead');
        } else if (state.A.currentHp <= 0) {
            log('A 阵亡，B 胜利！', 'log-dead');
            resultMsg = "暴击剑圣 (B) 获胜！";
            color = "var(--secondary-color)";
            els.charA.classList.add('dead');
        } else if (state.B.currentHp <= 0) {
            log('B 阵亡，A 胜利！', 'log-dead');
            resultMsg = "闪避剑圣 (A) 获胜！";
            color = "var(--primary-color)";
            els.charB.classList.add('dead');
        } else {
            log('回合结束，双方存活。');
            if (state.A.currentHp > state.B.currentHp) {
                resultMsg = "回合结束，A 血量优势胜！";
                color = "var(--primary-color)";
            } else if (state.B.currentHp > state.A.currentHp) {
                resultMsg = "回合结束，B 血量优势胜！";
                color = "var(--secondary-color)";
            } else {
                resultMsg = "回合结束，平局！";
                color = "#fff";
            }
        }

        els.winText.textContent = resultMsg;
        els.winMessage.style.borderColor = color;
        els.winText.style.color = color;
        els.winMessage.classList.remove('hidden');

        isPlaying = false;
        els.startBtn.disabled = false;
    }, 500);
}

els.startBtn.addEventListener('click', playSimulation);

// Panel Toggle Logic
const toggleLeft = document.getElementById('toggleLeft');
const toggleRight = document.getElementById('toggleRight');
const panelA = document.getElementById('panelA');
const panelB = document.getElementById('panelB');

if (toggleLeft && panelA) {
    toggleLeft.addEventListener('click', () => {
        panelA.classList.toggle('collapsed');
    });
}

if (toggleRight && panelB) {
    toggleRight.addEventListener('click', () => {
        panelB.classList.toggle('collapsed');
    });
}

// Resizable sidebars
function initResizableSidebars() {
    if (!panelA || !panelB) return;

    const root = document.documentElement;
    const storageKeys = {
        left: 'juggernautDuel.leftPanelWidth',
        right: 'juggernautDuel.rightPanelWidth'
    };
    const widthVars = {
        left: '--left-panel-width',
        right: '--right-panel-width'
    };
    const panels = {
        left: panelA,
        right: panelB
    };
    const MIN_WIDTH = ANIM_CONFIG.sidebarMinWidth;
    const MAX_WIDTH = 560;
    const MIN_ARENA_WIDTH = 420;
    const PANEL_GAPS = 40;

    const getPanelWidth = (side) => panels[side].getBoundingClientRect().width;
    const oppositeSide = (side) => side === 'left' ? 'right' : 'left';
    const clamp = (value, side) => {
        const otherWidth = getPanelWidth(oppositeSide(side));
        const availableMax = window.innerWidth - otherWidth - MIN_ARENA_WIDTH - PANEL_GAPS;
        const maxWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, availableMax));
        return Math.round(Math.max(MIN_WIDTH, Math.min(maxWidth, value)));
    };
    const setPanelWidth = (side, value, shouldStore = true) => {
        const width = clamp(value, side);
        root.style.setProperty(widthVars[side], `${width}px`);
        if (shouldStore && ANIM_CONFIG.rememberSidebarWidth) {
            try {
                localStorage.setItem(storageKeys[side], String(width));
            } catch (err) {
                // localStorage can be unavailable in restrictive browser contexts.
            }
        }
    };

    if (ANIM_CONFIG.rememberSidebarWidth) {
        Object.keys(storageKeys).forEach((side) => {
            try {
                const savedWidth = Number(localStorage.getItem(storageKeys[side]));
                if (Number.isFinite(savedWidth)) {
                    setPanelWidth(side, savedWidth, false);
                }
            } catch (err) {
                // Ignore unavailable localStorage and keep default widths.
            }
        });
    }

    document.querySelectorAll('.panel-resizer').forEach((resizer) => {
        const side = resizer.dataset.panel;
        if (!panels[side]) return;

        resizer.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            panels[side].classList.remove('collapsed');

            const startX = event.clientX;
            const startWidth = getPanelWidth(side);

            resizer.setPointerCapture(event.pointerId);
            resizer.classList.add('is-dragging');
            document.body.classList.add('is-resizing-sidebar');

            const handlePointerMove = (moveEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const nextWidth = side === 'left'
                    ? startWidth + deltaX
                    : startWidth - deltaX;
                setPanelWidth(side, nextWidth);
            };

            const stopResize = () => {
                resizer.classList.remove('is-dragging');
                document.body.classList.remove('is-resizing-sidebar');
                resizer.removeEventListener('pointermove', handlePointerMove);
                resizer.removeEventListener('pointerup', stopResize);
                resizer.removeEventListener('pointercancel', stopResize);
            };

            resizer.addEventListener('pointermove', handlePointerMove);
            resizer.addEventListener('pointerup', stopResize);
            resizer.addEventListener('pointercancel', stopResize);
        });
    });

    window.addEventListener('resize', () => {
        setPanelWidth('left', getPanelWidth('left'), false);
        setPanelWidth('right', getPanelWidth('right'), false);
    });
}

initResizableSidebars();

// Init
resetState();

// Particle System
function createParticles(targetElem, color) {
    const rect = targetElem.getBoundingClientRect();
    const arena = document.querySelector('.arena');
    const arenaRect = arena.getBoundingClientRect();

    // Center of target relative to arena
    const x = rect.left + rect.width / 2 - arenaRect.left;
    const y = rect.top + rect.height / 2 - arenaRect.top;

    for (let i = 0; i < ANIM_CONFIG.particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.backgroundColor = color;
        p.style.color = color;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 150 + 50;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        p.style.left = `${x}px`;
        p.style.top = `${y}px`;

        arena.appendChild(p);

        p.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
        ], {
            duration: 400 + Math.random() * 300,
            easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
            fill: 'forwards'
        });

        setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 800);
    }
}

// ---------------- Data Analysis & Modal ----------------
if (els.analysisBtn) {
    els.analysisBtn.addEventListener('click', openAnalysisModal);
    els.closeAnalysisModal.addEventListener('click', () => {
        els.analysisModal.classList.add('hidden');
    });
}

els.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        els.tabBtns.forEach(b => b.classList.remove('active'));
        els.tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

function openAnalysisModal() {
    els.analysisModal.classList.remove('hidden');

    // Update title to include combat mode
    const mode = els.combatMode ? els.combatMode.value : 'simultaneous';
    const priorityText = els.calcPriority && els.calcPriority.value === 'crit_first' ? '暴击计算优先' : '闪避计算优先';
    document.querySelector('#analysisModal .global-title').textContent = `战斗数据分析 - ${getModeText(mode)} [${priorityText}]`;

    // Update footer HP label
    const hpA = parseFloat(els.hpA.value);
    const hpB = parseFloat(els.hpB.value);
    document.getElementById('mcSimHpLabel').textContent = hpA === hpB ? hpA : `A:${hpA} B:${hpB}`;

    renderCurrentMatchChart();

    // Run Monte Carlo Simulation and Render
    const mcResults = runMonteCarloSimulation(1000);
    renderMonteCarloCharts(mcResults);

    // Render HP vs Win Rate Trend
    renderHpTrendChart();
}

function renderCurrentMatchChart() {
    if (hpCurveChartInstance) hpCurveChartInstance.destroy();

    const ctx = els.hpCurveChart.getContext('2d');

    // Chart.js global defaults for dark theme
    Chart.defaults.color = '#8b9bb4';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';

    hpCurveChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: battleHpHistory.labels,
            datasets: [
                {
                    label: '闪避剑圣 (A) 血量',
                    data: battleHpHistory.A,
                    borderColor: '#00f0ff',
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#00f0ff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: '暴击剑圣 (B) 血量',
                    data: battleHpHistory.B,
                    borderColor: '#ff0055',
                    backgroundColor: 'rgba(255, 0, 85, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#ff0055',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '本局比赛血量交锋变化图', color: '#fff', font: { size: 16 }, padding: { bottom: 25 } },
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'line'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(state.A.maxHp, state.B.maxHp),
                    title: { display: true, text: '血量', color: '#8b9bb4', font: { size: 20, weight: 'bold' } }
                },
                x: {
                    title: { display: true, text: '回合数', color: '#8b9bb4', font: { size: 20, weight: 'bold' } },
                    grid: {
                        color: function (context) {
                            const index = context.index;
                            const total = battleHpHistory.labels.length;
                            const step = (t => t <= 15 ? 1 : t <= 30 ? 2 : t <= 75 ? 5 : t <= 150 ? 10 : t <= 300 ? 20 : t <= 750 ? 50 : t <= 1500 ? 100 : t <= 3000 ? 200 : t <= 7500 ? 500 : 1000)(total);
                            if (index === 0 || index === total - 1) return 'rgba(255, 255, 255, 0.1)';
                            if (index % step === 0 && (total - 1 - index) > step * 0.5) return 'rgba(255, 255, 255, 0.1)';
                            return 'transparent';
                        }
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 0,
                        callback: function (val, index) {
                            const total = battleHpHistory.labels.length;
                            const step = (t => t <= 15 ? 1 : t <= 30 ? 2 : t <= 75 ? 5 : t <= 150 ? 10 : t <= 300 ? 20 : t <= 750 ? 50 : t <= 1500 ? 100 : t <= 3000 ? 200 : t <= 7500 ? 500 : 1000)(total);
                            if (index === 0 || index === total - 1) return this.getLabelForValue(val);
                            if (index % step === 0 && (total - 1 - index) > step * 0.5) return this.getLabelForValue(val);
                            return '';
                        }
                    }
                }
            }
        }
    });
}

function runMonteCarloSimulation(iterations) {
    const rounds = 10000;
    const mode = els.combatMode ? els.combatMode.value : 'simultaneous';
    const calcPriority = els.calcPriority ? els.calcPriority.value : 'dodge_first';

    const paramA = { dodge: parseFloat(els.dodgeA.value) / 100, crit: parseFloat(els.critA.value) / 100, mult: parseFloat(els.critMultA.value), hp: parseFloat(els.hpA.value) };
    const paramB = { dodge: parseFloat(els.dodgeB.value) / 100, crit: parseFloat(els.critB.value) / 100, mult: parseFloat(els.critMultB.value), hp: parseFloat(els.hpB.value) };

    let winsA = 0, winsB = 0, draws = 0;
    let remainHpA = [], remainHpB = [];

    for (let i = 0; i < iterations; i++) {
        let hpA = paramA.hp;
        let hpB = paramB.hp;

        for (let r = 1; r <= rounds; r++) {
            if (hpA <= 0 || hpB <= 0) break;
            const aAttacks = () => {
                if (mode !== 'b_only') {
                    if (calcPriority === 'crit_first') {
                        const tsProb = els.trueStrike ? parseFloat(els.trueStrike.value) / 100 : 0.8;
                        const isTs = Math.random() < tsProb;
                        const isCrit = Math.random() < paramA.crit;
                        if (isTs) {
                            hpB -= isCrit ? 1 * paramA.mult : 1;
                        } else {
                            if (Math.random() >= paramB.dodge) {
                                hpB -= isCrit ? 1 * paramA.mult : 1;
                            }
                        }
                    } else {
                        if (Math.random() >= paramB.dodge) {
                            hpB -= (Math.random() < paramA.crit) ? 1 * paramA.mult : 1;
                        }
                    }
                }
            };
            const bAttacks = () => {
                if (mode !== 'a_only') {
                    if (calcPriority === 'crit_first') {
                        const tsProb = els.trueStrike ? parseFloat(els.trueStrike.value) / 100 : 0.8;
                        const isTs = Math.random() < tsProb;
                        const isCrit = Math.random() < paramB.crit;
                        if (isTs) {
                            hpA -= isCrit ? 1 * paramB.mult : 1;
                        } else {
                            if (Math.random() >= paramA.dodge) {
                                hpA -= isCrit ? 1 * paramB.mult : 1;
                            }
                        }
                    } else {
                        if (Math.random() >= paramA.dodge) {
                            hpA -= (Math.random() < paramB.crit) ? 1 * paramB.mult : 1;
                        }
                    }
                }
            };

            if (mode === 'turn_b') {
                bAttacks();
                if (hpA <= 0) break;
                aAttacks();
            } else {
                aAttacks();
                if ((mode === 'turn_a' || mode === 'a_only') && hpB <= 0) break;
                bAttacks();
            }
        }

        if (hpA <= 0 && hpB <= 0) draws++;
        else if (hpA <= 0) { winsB++; remainHpB.push(hpB > 0 ? hpB : 0); }
        else if (hpB <= 0) { winsA++; remainHpA.push(hpA > 0 ? hpA : 0); }
        else {
            if (hpA > hpB) winsA++;
            else if (hpB > hpA) winsB++;
            else draws++;
        }
    }
    return { winsA, winsB, draws, remainHpA, remainHpB, iterations };
}

function renderMonteCarloCharts(mc) {
    if (winRateChartInstance) winRateChartInstance.destroy();
    if (hpDistChartInstance) hpDistChartInstance.destroy();

    const ctxWin = els.winRateChart.getContext('2d');
    const ctxDist = els.hpDistChart.getContext('2d');

    // Win Rate Pie Chart
    const winRateLabels = [
        `闪避剑圣 (A) 胜 [${(mc.winsA / mc.iterations * 100).toFixed(1)}%]`,
        `暴击剑圣 (B) 胜 [${(mc.winsB / mc.iterations * 100).toFixed(1)}%]`,
        `平局/同归于尽 [${(mc.draws / mc.iterations * 100).toFixed(1)}%]`
    ];
    const winRateColors = ['#00f0ff', '#ff0055', '#555555'];

    winRateChartInstance = new Chart(ctxWin, {
        type: 'doughnut',
        data: {
            labels: winRateLabels,
            datasets: [{
                data: [mc.winsA, mc.winsB, mc.draws],
                backgroundColor: winRateColors,
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: `千局胜率分布 (${mc.iterations} 局)`, color: '#fff', font: { size: 16 }, padding: { bottom: 25 } },
                legend: { display: false }
            }
        }
    });

    // Populate custom HTML legend
    const legendContainer = document.getElementById('customWinRateLegend');
    legendContainer.innerHTML = winRateLabels.map((label, i) => `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 40px; height: 16px; background-color: ${winRateColors[i]};"></div>
            <span>${label}</span>
        </div>
    `).join('');

    // Compute distribution (buckets of HP)
    // Simplify: just show average remaining HP when winning
    const avgHpA = mc.remainHpA.length ? (mc.remainHpA.reduce((a, b) => a + b, 0) / mc.remainHpA.length).toFixed(1) : 0;
    const avgHpB = mc.remainHpB.length ? (mc.remainHpB.reduce((a, b) => a + b, 0) / mc.remainHpB.length).toFixed(1) : 0;

    hpDistChartInstance = new Chart(ctxDist, {
        type: 'bar',
        data: {
            labels: ['闪避剑圣 (A) 获胜时', '暴击剑圣 (B) 获胜时'],
            datasets: [{
                label: '平均剩余血量',
                data: [avgHpA, avgHpB],
                backgroundColor: ['rgba(0, 240, 255, 0.5)', 'rgba(255, 0, 85, 0.5)'],
                borderColor: ['#00f0ff', '#ff0055'],
                borderWidth: 2,
                borderRadius: 4,
                maxBarThickness: 80
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '存活者平均剩余血量期望', color: '#fff', font: { size: 16 }, padding: { bottom: 25 } },
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderHpTrendChart() {
    if (hpTrendChartInstance) hpTrendChartInstance.destroy();

    const ctx = els.hpTrendChart.getContext('2d');

    const mode = els.combatMode ? els.combatMode.value : 'simultaneous';
    const calcPriority = els.calcPriority ? els.calcPriority.value : 'dodge_first';
    const rounds = 10000;

    const paramA = { dodge: parseFloat(els.dodgeA.value) / 100, crit: parseFloat(els.critA.value) / 100, mult: parseFloat(els.critMultA.value) };
    const paramB = { dodge: parseFloat(els.dodgeB.value) / 100, crit: parseFloat(els.critB.value) / 100, mult: parseFloat(els.critMultB.value) };

    const labels = [];
    const winRatesA = [];
    const winRatesB = [];

    const iters = 1000; // Increased simulation per point for higher accuracy
    for (let hp = 1; hp <= 100; hp++) {
        labels.push(hp);

        let winsA = 0;
        let winsB = 0;

        for (let i = 0; i < iters; i++) {
            let hpA = hp;
            let hpB = hp;

            for (let r = 1; r <= rounds; r++) {
                if (hpA <= 0 || hpB <= 0) break;

                const aAttacks = () => {
                    if (mode !== 'b_only') {
                        if (calcPriority === 'crit_first') {
                            const tsProb = els.trueStrike ? parseFloat(els.trueStrike.value) / 100 : 0.8;
                            const isTs = Math.random() < tsProb;
                            const isCrit = Math.random() < paramA.crit;
                            if (isTs) {
                                hpB -= isCrit ? 1 * paramA.mult : 1;
                            } else {
                                if (Math.random() >= paramB.dodge) {
                                    hpB -= isCrit ? 1 * paramA.mult : 1;
                                }
                            }
                        } else {
                            if (Math.random() >= paramB.dodge) {
                                hpB -= (Math.random() < paramA.crit) ? 1 * paramA.mult : 1;
                            }
                        }
                    }
                };
                const bAttacks = () => {
                    if (mode !== 'a_only') {
                        if (calcPriority === 'crit_first') {
                            const tsProb = els.trueStrike ? parseFloat(els.trueStrike.value) / 100 : 0.8;
                            const isTs = Math.random() < tsProb;
                            const isCrit = Math.random() < paramB.crit;
                            if (isTs) {
                                hpA -= isCrit ? 1 * paramB.mult : 1;
                            } else {
                                if (Math.random() >= paramA.dodge) {
                                    hpA -= isCrit ? 1 * paramB.mult : 1;
                                }
                            }
                        } else {
                            if (Math.random() >= paramA.dodge) {
                                hpA -= (Math.random() < paramB.crit) ? 1 * paramB.mult : 1;
                            }
                        }
                    }
                };

                if (mode === 'turn_b') {
                    bAttacks();
                    if (hpA <= 0) break;
                    aAttacks();
                } else {
                    aAttacks();
                    if ((mode === 'turn_a' || mode === 'a_only') && hpB <= 0) break;
                    bAttacks();
                }
            }
            if (hpA > 0 && hpB <= 0) winsA++;
            else if (hpB > 0 && hpA <= 0) winsB++;
            else {
                if (hpA > hpB) winsA++;
                else if (hpB > hpA) winsB++;
            }
        }
        winRatesA.push((winsA / iters * 100).toFixed(1));
        winRatesB.push((winsB / iters * 100).toFixed(1));
    }

    hpTrendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '闪避剑圣 (A) 胜率 %',
                    data: winRatesA,
                    borderColor: '#00f0ff',
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: '暴击剑圣 (B) 胜率 %',
                    data: winRatesB,
                    borderColor: '#ff0055',
                    backgroundColor: 'rgba(255, 0, 85, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '理论胜率与最大血量关系趋势 (双边等血量假设)', color: '#fff', font: { size: 16 }, padding: { bottom: 25 } },
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'line'
                    }
                }
            },
            scales: {
                y: {
                    min: 0, max: 100,
                    title: { display: true, text: '胜率 (%)', color: '#8b9bb4', font: { size: 20, weight: 'bold' } },
                    grid: { drawTicks: false }
                },
                x: {
                    title: { display: true, text: '角色初始血量', color: '#8b9bb4', font: { size: 20, weight: 'bold' } },
                    grid: {
                        drawTicks: false,
                        color: function (context) {
                            if (context.index === 0 || (context.index + 1) % 10 === 0) {
                                return 'rgba(255, 255, 255, 0.1)';
                            }
                            return 'transparent';
                        }
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 0,
                        callback: function (val, index) {
                            const label = this.getLabelForValue(val);
                            return (label === 1 || label % 10 === 0) ? label : '';
                        }
                    }
                }
            }
        }
    });
}
