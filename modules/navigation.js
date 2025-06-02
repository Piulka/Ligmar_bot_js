// Модуль навигации и взаимодействия с картой
window.BotNavigation = {
    /**
     * Поиск и клик по гексагону с приоритетом
     * @param {Array} priorities - массив приоритетов
     * @param {number} timeout - таймаут
     */
    async clickHexagonWithPriority(priorities, timeout = 5000) {
        const start = Date.now();

        while (Date.now() - start < timeout) {
            if (!window.BotConfig.isScriptRunning) return false;

            const aimIcon = document.querySelector('tui-icon.svg-icon[style*="aim.svg"]');
            if (aimIcon) {
                aimIcon.click();
                await window.BotUtils.delay(100);
            }

            // Получаем текущий гексагон где стоит игрок
            const currentHexagon = document.querySelector('g.hex-box.current');

            let championHexes = [];
            if (window.BotConfig.attackChampionsSetting === 'Игнорировать чампов') {
                championHexes = Array.from(document.querySelectorAll('g.hex-box')).filter(hex => {
                    return !!hex.querySelector('use[href="#champion"], use[xlink\\:href="#champion"]');
                });
            }

            for (const priority of priorities) {
                let hexagons = [];
                
                if (['champion', 'shrine', 'boss', 'chest-epic', 'chest-rare', 'chest-common'].includes(priority.type)) {
                    const targetUses = Array.from(document.querySelectorAll('use')).filter(use => {
                        const href = use.getAttribute('xlink:href') || use.getAttribute('href');
                        return href === priority.selector.replace('use[xlink\\:href="', '').replace('"]', '');
                    });
                    hexagons = targetUses.map(use => use.closest('g.hex-box'));
                }

                if (priority.type === 'enemies') {
                    hexagons = Array.from(document.querySelectorAll('g.hex-box')).filter(hexagon => {
                        const textElement = hexagon.querySelector('text.enemies');
                        return textElement && textElement.textContent.trim() === String(priority.value);
                    });
                }

                // Исключаем текущий гексагон где стоит игрок
                if (currentHexagon) {
                    hexagons = hexagons.filter(hex => hex && hex !== currentHexagon);
                }

                if (window.BotConfig.attackChampionsSetting === 'Игнорировать чампов' && championHexes.length > 0) {
                    hexagons = hexagons.filter(hex => hex && !championHexes.includes(hex));
                }

                for (const hexagon of hexagons) {
                    if (!hexagon) continue;
                    
                    // Использование мультискилла лучника до захода на гексагон
                    if (window.BotConfig.selectedClass === 'Лучник') {
                        const enemiesText = hexagon.querySelector('text.enemies');
                        const enemiesCount = enemiesText ? parseInt(enemiesText.textContent.trim(), 10) : 0;
                        const hasChampion = !!hexagon.querySelector('use[href="#champion"], use[xlink\\:href="#champion"]');
                        
                        if (enemiesCount >= 2 || hasChampion) {
                            if (window.BotCombat && window.BotCombat.useSkill) {
                                await window.BotCombat.useSkill(window.BotConfig.CLASS_SKILLS['Лучник'].multitarget);
                                await window.BotUtils.delay(100);
                            }
                        }
                    }
                    
                    console.log(`Найден гексагон по приоритету: ${priority.type}`);
                    this.clickHexagon(hexagon);
                    await window.BotUtils.delay(100);

                    // Возвращаем true и информацию о типе гексагона для mainLoop
                    return { found: true, type: priority.type };
                }
            }

            await window.BotUtils.delay(100);
        }

        return { found: false, type: null };
    },

    /**
     * Универсальная функция клика по гексагону
     * @param {HTMLElement} hexagon - элемент гексагона
     */
    clickHexagon(hexagon) {
        const rect = hexagon.getBoundingClientRect();

        const createMouseEvent = (type) => new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2
        });

        hexagon.dispatchEvent(createMouseEvent('mousedown'));
        hexagon.dispatchEvent(createMouseEvent('mouseup'));
        hexagon.dispatchEvent(createMouseEvent('click'));
    },

    /**
     * Клик по полигону гексагона
     * @param {HTMLElement} element - элемент полигона или родительский <g> элемент
     */
    clickPolygon(element) {
        console.log('🎯 clickPolygon: попытка клика по полигону');
        
        if (!element) {
            console.error('❌ clickPolygon: элемент не найден или равен null');
            return false;
        }
        
        // Проверяем, что element является DOM элементом
        if (!element.nodeType || element.nodeType !== Node.ELEMENT_NODE) {
            console.error('❌ clickPolygon: переданный объект не является DOM элементом:', element);
            return false;
        }
        
        // Ищем полигон: либо сам элемент является полигоном, либо ищем дочерний полигон
        let targetPolygon = element;
        if (element.tagName === 'g' || element.classList.contains('hex-box')) {
            targetPolygon = element.querySelector('polygon.hexagon');
            if (!targetPolygon) {
                console.error('❌ clickPolygon: не найден дочерний polygon в <g> элементе');
                return false;
            }
        }
        
        // Проверяем, что у элемента есть метод getBoundingClientRect
        if (typeof targetPolygon.getBoundingClientRect !== 'function') {
            console.error('❌ clickPolygon: элемент не поддерживает getBoundingClientRect:', targetPolygon);
            return false;
        }
        
        try {
            // Кликаем по родительскому <g> элементу, а не по самому полигону
            const clickTarget = targetPolygon.closest('g.hex-box') || targetPolygon.parentElement || targetPolygon;
            const rect = targetPolygon.getBoundingClientRect();
            console.log('✅ Получены координаты полигона:', rect);
            
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
            });
            
            // Кликаем по родительскому элементу, который обрабатывает события
            clickTarget.click();
            console.log('✅ Клик по полигону выполнен');
            return true;
        } catch (error) {
            console.error('❌ Ошибка клика по полигону:', error);
            return false;
        }
    },

    /**
     * Получение приоритетов для поиска гексагонов
     */
    getPriorities() {
        const basePriorities = [
            { type: 'chest-epic', selector: '#chest-epic' },
            { type: 'shrine', selector: '#shrine' },
            { type: 'chest-rare', selector: '#chest-rare' },
            { type: 'chest-common', selector: '#chest-common' },
            { type: 'enemies', value: '1' },
            { type: 'enemies', value: '2' }
        ];
        
        if (window.BotConfig.attackChampionsSetting === 'Атаковать чампов') {
            return [{ type: 'champion', selector: '#champion' }, ...basePriorities];
        }
        
        return basePriorities;
    },

    /**
     * Проверка наличия алтаря или сундука на текущем гексагоне
     */
    async isSpecialHexagon() {
        const currentHexagon = document.querySelector('g.hex-box.current');
        if (!currentHexagon) return false;

        const specialEntities = Array.from(currentHexagon.querySelectorAll('use')).find(use => {
            const href = use.getAttribute('href') || use.getAttribute('xlink:href');
            return href && (href.includes('shrine') || href.includes('chest'));
        });

        return !!specialEntities;
    },

    /**
     * Проверка членов битвы и клик по карте
     */
    async checkBattleMembersAndClickMap() {
        const battleMembers = document.querySelector('div.battle-members');
        if (battleMembers && battleMembers.offsetParent !== null) {
            const mapBtn = document.querySelector('div.button-icon-content tui-icon.svg-icon[style*="map.svg"]');
            if (mapBtn) {
                mapBtn.closest('div.button-icon-content').click();
                await window.BotUtils.delay(200);
                console.log('Обнаружен экран battle-members, выполнен клик по карте');
                return true;
            }
        }
        return false;
    },

    /**
     * Переход на локацию по названию
     * @param {string} name - название локации
     * @param {AbortSignal} abortSignal - сигнал отмены
     */
    async goToLocationByName(name, abortSignal) {
        const openMap = () => {
            const mapBtn = document.querySelector('app-button-icon.button-map[data-appearance="primary"]');
            if (mapBtn) mapBtn.click();
        };
        
        openMap();
        
        await window.BotUtils.waitFor(() => {
            if (abortSignal && abortSignal.aborted) throw new Error('goToLocationByName aborted');
            return Array.from(document.querySelectorAll('.location-list-item, .location-item, .location-name'))
                .find(el => el.textContent && el.textContent.includes(name));
        }, 100, 10000);
        
        const locBtn = Array.from(document.querySelectorAll('.location-list-item, .location-item, .location-name'))
            .find(el => el.textContent && el.textContent.includes(name));
        
        if (locBtn) locBtn.click();
        
        await window.BotUtils.waitFor(() => {
            if (abortSignal && abortSignal.aborted) throw new Error('goToLocationByName aborted');
            const header = document.querySelector('.location-header, .location-title');
            return header && header.textContent && header.textContent.includes(name);
        }, 200, 10000);
    },

    /**
     * Переход к полигону по координатам
     * @param {string} points - координаты полигона
     * @param {AbortSignal} abortSignal - сигнал отмены
     */
    async stepToPolygonByPoints(points, abortSignal) {
        const polygon = await window.BotUtils.waitFor(() => {
            if (abortSignal && abortSignal.aborted) throw new Error('stepToPolygonByPoints aborted');
            return Array.from(document.querySelectorAll('polygon.hexagon'))
                .find(p => p.getAttribute('points') === points);
        }, 200, 10000);
        
        this.clickPolygon(polygon);
        
        await window.BotUtils.waitFor(() => {
            if (abortSignal && abortSignal.aborted) throw new Error('stepToPolygonByPoints aborted');
            const current = document.querySelector('g.hex-box.current polygon.hexagon');
            return current && current.getAttribute('points') === points;
        }, 200, 10000);
    },

    /**
     * Проверка и возврат в город при смерти
     */
    async checkAndReturnToCity() {
        try {
            const cityButton = Array.from(document.querySelectorAll('div.button-content'))
                .find(btn => btn.textContent.trim() === 'В город');
            
            if (cityButton) {
                console.log('Найдена кнопка "В город", выполняем нажатие...');
                cityButton.click();
                await window.BotUtils.delay(100);
                await window.BotUtils.delay(1000);
                
                if (window.BotInventory && window.BotInventory.claimRewardButton) {
                    await window.BotInventory.claimRewardButton();
                }

                // Обновляем статистику смертей
                window.BotConfig.deaths++;
                if (window.BotStatistics) {
                    window.BotStatistics.addDeaths();
                }
                console.log(`Смерть зафиксирована. Всего смертей: ${window.BotConfig.deaths}`);

                // Возвращаемся к боям
                await window.BotUtils.clickByTextContent('Сражения');
                await window.BotUtils.delay(100);
                await window.BotUtils.clickByLocationName(window.BotConfig.selectedLocation);
                await window.BotUtils.delay(100);
            }
        } catch (error) {
            console.error('Ошибка в функции checkAndReturnToCity:', error);
        }
    }
}; 