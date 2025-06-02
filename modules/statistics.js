// Модуль статистики
window.BotStatistics = {
    stats: {
        mobsKilled: 0,
        championsKilled: 0,
        deaths: 0,
        items: {
            stored: 0,
            sold: 0,
            categories: {
                ancient: 0,
                pmaVa: 0,
                epicStats: 0,
                highGearScore: 0,
                dropCustom: 0
            }
        },
        sellTrips: 0,
        scriptStartTime: Date.now(),
        lastPauseTime: 0,
        totalPausedTime: 0
    },

    initializeStatistics() {
        this.stats = {
            mobsKilled: 0,
            championsKilled: 0,
            deaths: 0,
            items: {
                stored: 0,
                sold: 0,
                categories: {
                    ancient: 0,
                    pmaVa: 0,
                    epicStats: 0,
                    highGearScore: 0,
                    dropCustom: 0
                }
            },
            sellTrips: 0,
            scriptStartTime: Date.now(),
            lastPauseTime: 0,
            totalPausedTime: 0
        };
        
        this.updateStatisticsDisplay();
    },

    updateStatisticsDisplay() {
        this.updateStatElement('mobs-killed', this.stats.mobsKilled);
        this.updateStatElement('champions-killed', this.stats.championsKilled);
        this.updateStatElement('deaths', this.stats.deaths);
        this.updateStatElement('items-stored', this.stats.items.stored);
        this.updateStatElement('ancient-items', this.stats.items.categories.ancient);
        this.updateStatElement('pma-va-items', this.stats.items.categories.pmaVa);
        this.updateStatElement('epic-stats-items', this.stats.items.categories.epicStats);
        this.updateStatElement('high-gearscore-items', this.stats.items.categories.highGearScore);
        this.updateStatElement('custom-drop-items', this.stats.items.categories.dropCustom);
        this.updateStatElement('items-sold', this.stats.items.sold);
        this.updateStatElement('sell-trips', this.stats.sellTrips);
        this.updateRuntimeDisplay();
    },

    updateRuntimeDisplay() {
        if (!window.BotConfig.isScriptRunning) {
            this.stats.lastPauseTime = Date.now();
            return;
        }

        if (this.stats.lastPauseTime > 0) {
            this.stats.totalPausedTime += Date.now() - this.stats.lastPauseTime;
            this.stats.lastPauseTime = 0;
        }

        const runtimeInSeconds = Math.floor((Date.now() - this.stats.scriptStartTime - this.stats.totalPausedTime) / 1000);
        const hours = Math.floor(runtimeInSeconds / 3600);
        const minutes = Math.floor((runtimeInSeconds % 3600) / 60);
        const seconds = runtimeInSeconds % 60;

        const formattedTime = `${hours}ч ${minutes}м ${seconds}с`;
        this.updateStatElement('script-runtime', formattedTime);
    },

    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    async createStatisticsElement() {
        const oldStats = document.getElementById('statistics-container');
        if (oldStats) oldStats.remove();

        const statsContainer = document.createElement('div');
        statsContainer.id = 'statistics-container';
        
        Object.assign(statsContainer.style, {
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            width: '320px',
            background: '#060315',
            border: '1px solid #060315',
            borderRadius: '3px',
            position: 'fixed',
            right: '0px',
            top: '163px',
            zIndex: '1002',
            color: 'var(--white)',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '12px',
            opacity: '0',
            visibility: 'hidden',
            overflow: 'hidden',
            userSelect: 'none',
            boxShadow: '0 6px 24px 0 rgba(0,0,0,0.18)',
            padding: '0',
            marginBottom: '60px',
            maxHeight: 'none'
        });

        // Основная часть: две колонки
        const mainRow = document.createElement('div');
        Object.assign(mainRow.style, {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            padding: '10px 10px 0 10px',
            boxSizing: 'border-box'
        });

        // Левая колонка
        const leftColumn = document.createElement('div');
        Object.assign(leftColumn.style, {
            flex: '1',
            minWidth: '110px',
            marginRight: '10px'
        });

        leftColumn.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
                <span style="color:var(--gold-base);font-size:13px;">Мобов убито:</span>
                <span id="mobs-killed" style="color:#fff;font-weight:700;font-size:14px;">0</span>
            </div>
            <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
                <span style="color:var(--gold-base);font-size:13px;">Чемпионов убито:</span>
                <span id="champions-killed" style="color:#fff;font-weight:700;font-size:14px;">0</span>
            </div>
            <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
                <span style="color:var(--gold-base);font-size:13px;">Смертей:</span>
                <span id="deaths" style="color:#fff;font-weight:700;font-size:14px;">0</span>
            </div>
        `;

        // Правая колонка
        const rightColumn = document.createElement('div');
        Object.assign(rightColumn.style, {
            flex: '1',
            minWidth: '110px'
        });

        rightColumn.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
                <span style="color:var(--gold-base);font-size:13px;">Вещи в сундуке:</span>
                <span id="items-stored" style="color:#fff;font-weight:700;font-size:14px;">0</span>
            </div>
            <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
                <span style="color:var(--gray-light);font-size:11px;">Древние вещи:</span>
                <span id="ancient-items" style="color:#fff;font-weight:600;font-size:13px;">0</span>
            </div>
        `;

        mainRow.appendChild(leftColumn);
        mainRow.appendChild(rightColumn);

        // Нижняя часть: таймер
        const bottomRow = document.createElement('div');
        Object.assign(bottomRow.style, {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            padding: '12px 0 16px 0',
            boxSizing: 'border-box',
            background: 'rgba(0,0,0,0.10)',
            borderTop: '1px solid var(--black-light)'
        });

        const runtimeDisplay = document.createElement('div');
        runtimeDisplay.id = 'script-runtime';
        runtimeDisplay.textContent = '0 сек';
        Object.assign(runtimeDisplay.style, {
            color: '#fff',
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center'
        });

        bottomRow.appendChild(runtimeDisplay);
        statsContainer.appendChild(mainRow);
        statsContainer.appendChild(bottomRow);
        document.body.appendChild(statsContainer);

        await window.BotUtils.delay(100);
    }
};

// Обновляем время работы каждые 5 секунд
setInterval(() => {
    if (window.BotStatistics) {
        window.BotStatistics.updateRuntimeDisplay();
    }
}, 5000); 