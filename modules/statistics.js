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

    observer: null,
    lastShrinkedPanel: null,
    lastPanelVisible: false,
    positionCheckInterval: null,

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
        this.initializeMapObserver();
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
     * Методы для добавления статистики
     */
    addMobsKilled(count = 1) {
        this.stats.mobsKilled += count;
        this.updateStatisticsDisplay();
    },

    addChampionsKilled(count = 1) {
        this.stats.championsKilled += count;
        this.updateStatisticsDisplay();
    },

    addDeaths(count = 1) {
        this.stats.deaths += count;
        this.updateStatisticsDisplay();
    },

    addStoredItems(count) {
        this.stats.items.stored += count;
        this.updateStatisticsDisplay();
    },

    addSoldItems(count) {
        this.stats.items.sold += count;
        this.updateStatisticsDisplay();
    },

    addAncientItems(count) {
        this.stats.items.categories.ancient += count;
        this.updateStatisticsDisplay();
    },

    addPmaVaItems(count) {
        this.stats.items.categories.pmaVa += count;
        this.updateStatisticsDisplay();
    },

    addEpicStatsItems(count) {
        this.stats.items.categories.epicStats += count;
        this.updateStatisticsDisplay();
    },

    addHighGearScoreItems(count) {
        this.stats.items.categories.highGearScore += count;
        this.updateStatisticsDisplay();
    },

    addCustomDropItems(count) {
        this.stats.items.categories.dropCustom += count;
        this.updateStatisticsDisplay();
    },

    addSellTrip() {
        this.stats.sellTrips++;
        this.updateStatisticsDisplay();
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
            <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
                <span style="color:var(--gold-base);font-size:13px;">Продано вещей:</span>
                <span id="items-sold" style="color:#fff;font-weight:700;font-size:14px;">0</span>
            </div>
            <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
                <span style="color:var(--gold-base);font-size:13px;">Кол-во походов в магазин:</span>
                <span id="sell-trips" style="color:#fff;font-weight:700;font-size:14px;">0</span>
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
            <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
                <span style="color:var(--gray-light);font-size:11px;">Вещи с ПМА или ВА:</span>
                <span id="pma-va-items" style="color:#fff;font-weight:600;font-size:13px;">0</span>
            </div>
            <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
                <span style="color:var(--gray-light);font-size:11px;">Топ вещи для лучника:</span>
                <span id="epic-stats-items" style="color:#fff;font-weight:600;font-size:13px;">0</span>
            </div>
            <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
                <span style="color:var(--gray-light);font-size:11px;">Вещи с БМ больше ${window.BotConfig.dropMinGearScore}:</span>
                <span id="high-gearscore-items" style="color:#fff;font-weight:600;font-size:13px;">0</span>
            </div>
            <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
                <span style="color:var(--gray-light);font-size:11px;">Кастомный дроп:</span>
                <span id="custom-drop-items" style="color:#fff;font-weight:600;font-size:13px;">0</span>
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
            borderTop: '1px solid var(--black-light)',
            position: 'relative'
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

        // Версия коммита в правом нижнем углу
        const versionDisplay = document.createElement('div');
        versionDisplay.textContent = window.BotConfig.SCRIPT_COMMIT;
        Object.assign(versionDisplay.style, {
            position: 'absolute',
            bottom: '4px',
            right: '8px',
            color: 'var(--gray-light)',
            fontSize: '10px',
            fontWeight: 'normal',
            opacity: '0.7'
        });

        bottomRow.appendChild(runtimeDisplay);
        bottomRow.appendChild(versionDisplay);
        statsContainer.appendChild(mainRow);
        statsContainer.appendChild(bottomRow);
        document.body.appendChild(statsContainer);

        await window.BotUtils.delay(100);
    },

    /**
     * Инициализация наблюдателя за картой
     */
    initializeMapObserver() {
        const self = this;

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
            self.positionStatisticsPanel(statsContainer, mapWrapper);
        
            // Постоянно следим за изменением размера/позиции карты
            const repositionStats = () => self.positionStatisticsPanel(statsContainer, mapWrapper);
            window.removeEventListener('resize', repositionStats);
            window.addEventListener('resize', repositionStats);
            
            // Дополнительно проверяем позицию каждые 100мс
            if (self.positionCheckInterval) clearInterval(self.positionCheckInterval);
            self.positionCheckInterval = setInterval(repositionStats, 100);
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
            
            // Останавливаем проверку позиции
            if (self.positionCheckInterval) {
                clearInterval(self.positionCheckInterval);
                self.positionCheckInterval = null;
            }
        }

        /**
         * Уменьшение панели карты для освобождения места под статистику
         */
        function shrinkBattleMapPanel(panel) {
            if (!panel) return;
            if (self.lastShrinkedPanel === panel) return;
            self.lastShrinkedPanel = panel;

            const map = panel.querySelector('app-battle-map');
            if (!map) return;

            if (map.parentNode && map.parentNode.classList && map.parentNode.classList.contains('auto-map-wrapper')) {
                panel.style.transition = 'width 0.14s cubic-bezier(.4,2,.6,1), margin-right 0.14s cubic-bezier(.4,2,.6,1)';
                panel.style.marginRight = '240px';
                panel.style.width = '40%';
                // После анимации позиционируем статистику
                setTimeout(openStatisticsPanelAndAttach, 140);
                return;
            }

            const mapWrapper = document.createElement('div');
            mapWrapper.className = 'auto-map-wrapper';
            mapWrapper.style.width = '100%';
            mapWrapper.style.height = '100%';
            mapWrapper.style.overflow = 'hidden';

            map.parentNode.insertBefore(mapWrapper, map);
            mapWrapper.appendChild(map);

            panel.style.transition = 'width 0.14s cubic-bezier(.4,2,.6,1), margin-right 0.14s cubic-bezier(.4,2,.6,1)';
            panel.style.marginRight = '';
            panel.style.width = '';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    panel.style.marginRight = '240px';
                    panel.style.width = '40%';
                    // После анимации позиционируем статистику
                    setTimeout(openStatisticsPanelAndAttach, 140);
                });
            });
        }

        // MutationObserver для отслеживания появления и исчезновения карты
        this.observer = new MutationObserver(() => {
            // Пробуем несколько селекторов для обнаружения карты
            const panel = document.querySelector('app-battle-middle-panel') || 
                         document.querySelector('.battle-middle-panel') ||
                         document.querySelector('[class*="battle-middle"]') ||
                         document.querySelector('app-battle-map')?.closest('.battle-panel, .middle-panel, [class*="panel"]');
            
            const panelVisible = panel && 
                                panel.offsetParent !== null && 
                                getComputedStyle(panel).display !== 'none' &&
                                getComputedStyle(panel).visibility !== 'hidden' &&
                                panel.getBoundingClientRect().width > 0 &&
                                panel.getBoundingClientRect().height > 0;

            if (panelVisible && !self.lastPanelVisible) {
                console.log('🗺️ Карта обнаружена, активирую статистику');
                shrinkBattleMapPanel(panel);
                self.lastPanelVisible = true;
            } else if (!panelVisible && self.lastPanelVisible) {
                console.log('🗺️ Карта скрыта, прячу статистику');
                closeStatisticsPanel();
                self.lastPanelVisible = false;
                self.lastShrinkedPanel = null;
            }
            
            // Дополнительная проверка статистики если карта видна
            if (panelVisible) {
                const statsContainer = document.getElementById('statistics-container');
                const mapWrapper = document.querySelector('.auto-map-wrapper');
                if (statsContainer && mapWrapper) {
                    // Проверяем что статистика правильно позиционирована
                    const statsRect = statsContainer.getBoundingClientRect();
                    const mapRect = mapWrapper.getBoundingClientRect();
                    
                    // Если статистика слишком далеко от карты - перепозиционируем
                    if (Math.abs(statsRect.left - mapRect.right) > 50 || statsRect.width < 100) {
                        console.log('📊 Перепозиционирую статистику');
                        self.positionStatisticsPanel(statsContainer, mapWrapper);
                    }
                }
            }
        });

        this.observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['style', 'class'],
            characterData: false
        });

        // Если карта уже есть при загрузке - проверяем несколько селекторов
        const initialPanel = document.querySelector('app-battle-middle-panel') || 
                           document.querySelector('.battle-middle-panel') ||
                           document.querySelector('[class*="battle-middle"]') ||
                           document.querySelector('app-battle-map')?.closest('.battle-panel, .middle-panel, [class*="panel"]');
        
        if (initialPanel && 
            initialPanel.offsetParent !== null &&
            getComputedStyle(initialPanel).display !== 'none' &&
            getComputedStyle(initialPanel).visibility !== 'hidden' &&
            initialPanel.getBoundingClientRect().width > 0 &&
            initialPanel.getBoundingClientRect().height > 0) {
            console.log('🗺️ Карта уже присутствует при инициализации');
            shrinkBattleMapPanel(initialPanel);
            self.lastPanelVisible = true;
        }
    },

    /**
     * Позиционирование панели статистики рядом с картой
     */
    positionStatisticsPanel(statsContainer, mapWrapper) {
        try {
            // Получаем координаты и размеры карты
            const rect = mapWrapper.getBoundingClientRect();
            
            // Проверяем что карта видна
            if (rect.width === 0 || rect.height === 0) {
                console.log('⚠️ Карта не видна, скрываем статистику');
                statsContainer.style.opacity = '0';
                statsContainer.style.visibility = 'hidden';
                return;
            }
        
            // Получаем контейнер battle-top
            const battleTop = document.querySelector('.battle-top.page-container.ng-tns-c3091494937-7') ||
                             document.querySelector('.battle-top') ||
                             document.querySelector('[class*="battle-top"]') ||
                             document.body;
            
            const battleRect = battleTop ? battleTop.getBoundingClientRect() : { right: window.innerWidth };
        
            // Высота окна статистики = высота карты
            const statsHeight = rect.height + 10;
        
            // Левая граница окна статистики = правый край карты + 10px
            const statsLeft = rect.right + 10;
        
            // Правая граница окна статистики = правый край battle-top - 10px
            const statsRight = battleRect.right - 10;
        
            // Ширина окна статистики = statsRight - statsLeft
            const statsWidth = Math.max(280, Math.min(400, statsRight - statsLeft));
        
            // Позиционируем statsContainer фиксировано справа от карты
            statsContainer.style.position = 'fixed';
            statsContainer.style.left = statsLeft + 'px';
            statsContainer.style.top = (rect.top - 5) + 'px';
            statsContainer.style.width = statsWidth + 'px';
            statsContainer.style.height = statsHeight + 'px';
            statsContainer.style.minWidth = statsWidth + 'px';
            statsContainer.style.maxWidth = statsWidth + 'px';
            statsContainer.style.minHeight = statsHeight + 'px';
            statsContainer.style.maxHeight = statsHeight + 'px';
            statsContainer.style.overflowY = 'auto';
            statsContainer.style.transition = 'left 0.14s cubic-bezier(.4,2,.6,1), width 0.14s cubic-bezier(.4,2,.6,1), height 0.14s cubic-bezier(.4,2,.6,1), opacity 0.06s, visibility 0.06s';
            statsContainer.style.zIndex = '1002';
            
            // Принудительно показываем статистику если карта видна
            if (rect.width > 0 && rect.height > 0) {
                statsContainer.style.opacity = '1';
                statsContainer.style.visibility = 'visible';
            }
        } catch (error) {
            console.error('❌ Ошибка позиционирования статистики:', error);
        }
    },

    /**
     * Тестовая функция для показа статистики (для отладки)
     */
    testShowStatistics() {
        console.log('🔧 Тестирование отображения статистики...');
        const statsContainer = document.getElementById('statistics-container');
        if (!statsContainer) {
            console.log('❌ Контейнер статистики не найден');
            return;
        }

        // Показываем статистику принудительно
        statsContainer.style.opacity = '1';
        statsContainer.style.visibility = 'visible';
        statsContainer.style.position = 'fixed';
        statsContainer.style.right = '20px';
        statsContainer.style.top = '200px';
        statsContainer.style.width = '320px';
        statsContainer.style.zIndex = '9999';
        
        console.log('✅ Статистика принудительно показана для тестирования');
        console.log('Если вы её видите, то проблема в логике обнаружения карты');
        
        // Через 10 секунд скрываем
        setTimeout(() => {
            statsContainer.style.opacity = '0';
            statsContainer.style.visibility = 'hidden';
            console.log('🔧 Тестовая статистика скрыта');
        }, 10000);
    }
};

// Обновляем время работы каждые 5 секунд
setInterval(() => {
    if (window.BotStatistics) {
        window.BotStatistics.updateRuntimeDisplay();
    }
}, 5000); 