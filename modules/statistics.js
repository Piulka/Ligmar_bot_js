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

    /**
     * Обновление статистики (для совместимости с оригинальным кодом)
     * @param {string} stat - название статистики
     * @param {number} value - значение
     */
    updateStatistics(stat, value) {
        const statElement = document.getElementById(stat);
        if (statElement) {
            statElement.textContent = value;
        }
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

// Логика автоматического показа статистики при открытии карты
(function() {
    let lastShrinkedPanel = null;
    let lastPanelVisible = false;

    /**
     * Открытие панели статистики и привязка к карте
     */
    function openStatisticsPanelAndAttach() {
        const statsContainer = document.getElementById('statistics-container');
        const mapWrapper = document.querySelector('.auto-map-wrapper');
        if (!statsContainer || !mapWrapper) return;
    
        // Показываем окно статистики
        statsContainer.style.opacity = '1';
        statsContainer.style.visibility = 'visible';
    
        // Позиционируем окно статистики справа от карты
        positionStatisticsPanel(statsContainer, mapWrapper);
    
        // Следим за изменением размера/позиции карты (например, при ресайзе окна)
        window.addEventListener('resize', () => positionStatisticsPanel(statsContainer, mapWrapper));
    }

    /**
     * Закрытие панели статистики
     */
    function closeStatisticsPanel() {
        const statsContainer = document.getElementById('statistics-container');
        if (!statsContainer) return;
    
        statsContainer.style.transition = 'none';
        statsContainer.style.opacity = '0';
        statsContainer.style.visibility = 'hidden';
    }

    /**
     * Позиционирование панели статистики рядом с картой
     */
    function positionStatisticsPanel(statsContainer, mapWrapper) {
        // Получаем координаты и размеры карты
        const rect = mapWrapper.getBoundingClientRect();
    
        // Получаем контейнер battle-top
        const battleTop = document.querySelector('.battle-top.page-container.ng-tns-c3091494937-7');
        if (!battleTop) return;
        const battleRect = battleTop.getBoundingClientRect();
    
        // Высота окна статистики = высота карты (без дополнительных пикселей)
        const statsHeight = rect.height + 10;
    
        // Левая граница окна статистики = правый край карты + 10px
        const statsLeft = rect.right + 10;
    
        // Правая граница окна статистики = правый край battle-top - 30px (оставляем отступ)
        const statsRight = battleRect.right - 10;
    
        // Ширина окна статистики = statsRight - statsLeft
        const statsWidth = Math.max(0, statsRight - statsLeft);
    
        // Позиционируем statsContainer фиксировано справа от карты
        statsContainer.style.position = 'fixed';
        statsContainer.style.left = statsLeft + 'px';
        statsContainer.style.top = (rect.top - 5) + 'px'; // на 5px ниже карты
        statsContainer.style.width = statsWidth + 'px';
        statsContainer.style.height = statsHeight + 'px';
        statsContainer.style.minWidth = statsWidth + 'px';
        statsContainer.style.maxWidth = statsWidth + 'px';
        statsContainer.style.minHeight = statsHeight + 'px';
        statsContainer.style.maxHeight = statsHeight + 'px';
        statsContainer.style.overflowY = 'auto';
        statsContainer.style.transition = 'left 0.7s cubic-bezier(.4,2,.6,1), width 0.7s cubic-bezier(.4,2,.6,1), height 0.7s cubic-bezier(.4,2,.6,1), opacity 0.3s, visibility 0.3s';
        statsContainer.style.zIndex = '1002';
    }

    /**
     * Уменьшение панели карты для освобождения места под статистику
     */
    function shrinkBattleMapPanel(panel) {
        if (!panel) return;
        if (lastShrinkedPanel === panel) return;
        lastShrinkedPanel = panel;

        const map = panel.querySelector('app-battle-map');
        if (!map) return;

        if (map.parentNode && map.parentNode.classList && map.parentNode.classList.contains('auto-map-wrapper')) {
            panel.style.transition = 'width 0.7s cubic-bezier(.4,2,.6,1), margin-right 0.7s cubic-bezier(.4,2,.6,1)';
            panel.style.marginRight = '240px';
            panel.style.width = '40%';
            // После анимации позиционируем статистику
            setTimeout(openStatisticsPanelAndAttach, 700);
            return;
        }

        const mapWrapper = document.createElement('div');
        mapWrapper.className = 'auto-map-wrapper';
        mapWrapper.style.width = '100%';
        mapWrapper.style.height = '100%';
        mapWrapper.style.overflow = 'hidden';

        map.parentNode.insertBefore(mapWrapper, map);
        mapWrapper.appendChild(map);

        panel.style.transition = 'width 0.7s cubic-bezier(.4,2,.6,1), margin-right 0.7s cubic-bezier(.4,2,.6,1)';
        panel.style.marginRight = '';
        panel.style.width = '';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                panel.style.marginRight = '240px';
                panel.style.width = '40%';
                // После анимации позиционируем статистику
                setTimeout(openStatisticsPanelAndAttach, 700);
            });
        });
    }

    // MutationObserver для отслеживания появления и исчезновения карты
    const observer = new MutationObserver(() => {
        const panel = document.querySelector('app-battle-middle-panel');
        const panelVisible = panel && panel.offsetParent !== null;

        if (panelVisible) {
            shrinkBattleMapPanel(panel);
            lastPanelVisible = true;
        } else if (lastPanelVisible) {
            closeStatisticsPanel();
            lastPanelVisible = false;
            lastShrinkedPanel = null;
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Если карта уже есть при загрузке
    const initialPanel = document.querySelector('app-battle-middle-panel');
    if (initialPanel && initialPanel.offsetParent !== null) {
        shrinkBattleMapPanel(initialPanel);
        lastPanelVisible = true;
    }
})(); 