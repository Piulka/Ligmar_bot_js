// Модуль основной игровой логики
window.BotGameLogic = {
    vtAbortController: null,
    chtAbortController: null,

    /**
     * Запуск основного скрипта
     */
    async runScript() {
        try {
            window.BotConfig.selectedClass = window.BotUtils.detectPlayerClass();
            await window.BotUtils.clickByTextContent('Сражения');
            await window.BotUtils.delay(100);
            await window.BotUtils.clickByLocationName(window.BotConfig.selectedLocation);
            await window.BotUtils.delay(100);
            
            while (window.BotConfig.isScriptRunning) {
                await this.mainLoop();
                await window.BotUtils.delay(100);
            }
        } catch (error) {
            console.error('Ошибка в скрипте:', error);
        }
    },

    /**
     * Основной цикл игры
     */
    async mainLoop() {
        await window.BotNavigation.checkAndReturnToCity();
        window.BotConfig.selectedClass = window.BotUtils.detectPlayerClass();
        await window.BotNavigation.checkBattleMembersAndClickMap();
        await window.BotUtils.delay(100);

        await window.BotInventory.handleFullBackpack();
        await window.BotUtils.delay(100);

        // Автоматически определяем VIP/Не VIP
        window.BotConfig.vipStatus = window.BotUtils.autoDetectVipStatus();

        // 1. Всегда ищем и переходим на гексагон по приоритету
        const hexagonResult = await window.BotNavigation.clickHexagonWithPriority(window.BotNavigation.getPriorities());
        if (!hexagonResult.found) return;

        const transitionSuccess = await window.BotUtils.clickByTextContent('Перейти');
        await window.BotUtils.delay(100);

        if (!transitionSuccess) {
            const currentHexText = document.querySelector('div.hex-footer div.hex-current-text.ng-star-inserted');
            if (currentHexText && currentHexText.textContent.trim() === 'Вы здесь') {
                const closeButton = document.querySelector('tui-icon.svg-icon[style*="close.svg"]');
                if (closeButton) {
                    closeButton.click();
                    await window.BotUtils.delay(100);
                    
                    const autoSwitchIcon = document.querySelector('tui-icon.svg-icon[style*="switch-auto.svg"]');
                    if (autoSwitchIcon) {
                        autoSwitchIcon.click();
                        await window.BotUtils.delay(100);
                    } else {
                        console.error('Иконка автоматического режима не найдена');
                        return;
                    }
                    
                    // Определяем тип боя и вызываем соответствующую функцию
                    const isChampion = hexagonResult.type === 'champion';
                    await window.BotCombat.fightEnemies(isChampion);
                } else {
                    console.error('Кнопка закрытия не найдена');
                    return;
                }
                return;
            }
            return;
        }

        await window.BotUtils.delay(100);

        // Автоматически определяем VIP/Не VIP перед боем
        window.BotConfig.vipStatus = window.BotUtils.autoDetectVipStatus();

        // 2. После перехода: логика для VIP и не-VIP
        if (window.BotConfig.vipStatus === 'VIP') {
            const enemyAppeared = await window.BotCombat.waitForEnemy();
            await window.BotUtils.delay(100);
            if (!enemyAppeared) return;
            
            // Определяем тип боя и вызываем соответствующую функцию
            const isChampion = hexagonResult.type === 'champion';
            await window.BotCombat.fightEnemies(isChampion);
            await window.BotUtils.delay(100);
        } else {
            let enemyAppeared = false;
            let maxTries = 50;
            
            while (!enemyAppeared && maxTries-- > 0 && window.BotConfig.isScriptRunning) {
                await window.BotNavigation.checkAndReturnToCity();
        
                const enemyCard = document.querySelector('app-profile-card.target');
                let needSwitch = false;
        
                if (enemyCard) {
                    const hpText = enemyCard.querySelector('.profile-health .stats-text');
                    if (hpText) {
                        const hpMatch = hpText.textContent.trim().match(/^(\d+)\s*\/\s*[\d, ]+$/);
                        if (hpMatch && parseInt(hpMatch[1], 10) === 0) {
                            needSwitch = true;
                        }
                    }
                    
                    const deadIcon = enemyCard.querySelector('tui-icon.svg-icon[style*="dead.svg"]');
                    if (deadIcon) {
                        needSwitch = true;
                    }
                    
                    if (!needSwitch) {
                        enemyAppeared = true;
                        break;
                    }
                }
        
                const switchBtn = document.querySelector('div.button-icon-content tui-icon.svg-icon[style*="switch.svg"]');
                if (switchBtn) {
                    switchBtn.closest('div.button-icon-content').click();
                    await window.BotUtils.delay(300);
                } else {
                    await window.BotUtils.delay(300);
                }
            }
            
            if (!enemyAppeared) {
                console.log('Враг не найден после переключений');
                return;
            }
            
            // Определяем тип боя и вызываем соответствующую функцию
            const isChampion = hexagonResult.type === 'champion';
            await window.BotCombat.fightEnemies(isChampion);
            await window.BotUtils.delay(100);
        }
    },

    /**
     * Создание кнопки боссов с выпадающим меню
     */
    async createBossButtons() {
        // Удаляем старые кнопки, если есть
        const oldBossVTBtn = document.getElementById('boss-vt-button');
        const oldBossCHTBtn = document.getElementById('boss-cht-button');
        const oldBossDropdownBtn = document.getElementById('boss-dropdown-button');
        if (oldBossVTBtn) oldBossVTBtn.remove();
        if (oldBossCHTBtn) oldBossCHTBtn.remove();
        if (oldBossDropdownBtn) oldBossDropdownBtn.remove();

        // Проверяем, не создана ли уже новая кнопка
        if (document.getElementById('boss-dropdown-button')) return;

        // Создание кнопки АКТИВНОСТИ
        const bossDropdownBtn = document.createElement('button');
        bossDropdownBtn.id = 'boss-dropdown-button';
        bossDropdownBtn.className = 'control-button-boss-dropdown';
        Object.assign(bossDropdownBtn.style, {
            width: '80px',
            height: '33px',
            background: 'radial-gradient(circle, rgba(40,25,15,0.95) 0%, rgba(20,12,8,0.98) 100%)',
            color: '#FFD700',
            border: '1px solid rgba(128,128,128,0.3)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 'bold',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease',
            letterSpacing: '0.5px',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            userSelect: 'none',
            outline: 'none',
            margin: '0',
            position: 'fixed', // Позиционирование через новую систему
            zIndex: '1001',
            overflow: 'hidden'
        });

        // Создаем внутренний градиент
        const innerGlow = document.createElement('div');
        Object.assign(innerGlow.style, {
            position: 'absolute',
            top: '1px',
            left: '1px',
            right: '1px',
            bottom: '1px',
            borderRadius: '3px',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 140, 0, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
        });
        bossDropdownBtn.appendChild(innerGlow);

        // Контейнер для контента
        const content = document.createElement('div');
        Object.assign(content.style, {
            position: 'relative',
            zIndex: '2',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        });

        const iconSpan = document.createElement('span');
        iconSpan.textContent = 'АКТИВНОСТИ';
        iconSpan.style.fontSize = '10px';
        iconSpan.style.lineHeight = '1';

        content.appendChild(iconSpan);
        bossDropdownBtn.appendChild(content);

        // События для основной кнопки
        bossDropdownBtn.addEventListener('mouseenter', () => {
            if (!this.activeBossType) {
                bossDropdownBtn.style.transform = 'translateY(-1px)';
                bossDropdownBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
            }
        });
        
        bossDropdownBtn.addEventListener('mouseleave', () => {
            if (!this.activeBossType) {
                bossDropdownBtn.style.transform = 'translateY(0)';
                bossDropdownBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            }
        });

        // --- Выпадающее меню ---
        const dropdown = document.createElement('div');
        dropdown.id = 'boss-dropdown-menu';
        Object.assign(dropdown.style, {
            position: 'fixed', // Изменяем на fixed
            left: '0', // Будет позиционироваться динамически
            top: '0', // Будет позиционироваться динамически
            width: '80px',
            background: '#2c2c2c',
            border: '1px solid rgba(128,128,128,0.3)',
            borderRadius: '4px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: '1002',
            display: 'none',
            flexDirection: 'column',
            overflow: 'hidden'
        });

        // Кнопка БОСС ВТ
        const vtOption = document.createElement('div');
        Object.assign(vtOption.style, {
            padding: '8px',
            fontSize: '10px',
            color: '#FFD700',
            background: 'rgba(40,15,15,0.95)',
            cursor: 'pointer',
            textAlign: 'center',
            borderBottom: '1px solid rgba(128,128,128,0.2)',
            transition: 'background 0.2s ease'
        });
        vtOption.textContent = 'БОСС ВТ';
        vtOption.addEventListener('mouseenter', () => {
            vtOption.style.background = 'rgba(60,25,25,0.95)';
        });
        vtOption.addEventListener('mouseleave', () => {
            vtOption.style.background = 'rgba(40,15,15,0.95)';
        });

        // Кнопка БОСС ЧТ
        const chtOption = document.createElement('div');
        Object.assign(chtOption.style, {
            padding: '8px',
            fontSize: '10px',
            color: '#FFD700',
            background: 'rgba(25,15,40,0.95)',
            cursor: 'pointer',
            textAlign: 'center',
            borderBottom: '1px solid rgba(128,128,128,0.2)',
            transition: 'background 0.2s ease'
        });
        chtOption.textContent = 'БОСС ЧТ';
        chtOption.addEventListener('mouseenter', () => {
            chtOption.style.background = 'rgba(45,25,60,0.95)';
        });
        chtOption.addEventListener('mouseleave', () => {
            chtOption.style.background = 'rgba(25,15,40,0.95)';
        });

        // Кнопка Бонус (только для авторизованных)
        const dentistOption = document.createElement('div');
        Object.assign(dentistOption.style, {
            padding: '8px',
            fontSize: '10px',
            color: '#FFD700',
            background: 'rgba(15,40,25,0.95)',
            cursor: 'pointer',
            textAlign: 'center',
            borderBottom: '1px solid rgba(128,128,128,0.2)',
            transition: 'background 0.2s ease',
            display: window.BotUI && window.BotUI.isAuthorized ? 'block' : 'none'
        });
        dentistOption.textContent = 'БОНУС';
        dentistOption.addEventListener('mouseenter', () => {
            dentistOption.style.background = 'rgba(25,60,45,0.95)';
        });
        dentistOption.addEventListener('mouseleave', () => {
            dentistOption.style.background = 'rgba(15,40,25,0.95)';
        });

        // Кнопка АРС (только для авторизованных)
        const arsOption = document.createElement('div');
        Object.assign(arsOption.style, {
            padding: '8px',
            fontSize: '10px',
            color: '#FFD700',
            background: 'rgba(40,40,15,0.95)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'background 0.2s ease',
            display: window.BotUI && window.BotUI.isAuthorized ? 'block' : 'none'
        });
        arsOption.textContent = 'АРС';
        arsOption.addEventListener('mouseenter', () => {
            arsOption.style.background = 'rgba(60,60,25,0.95)';
        });
        arsOption.addEventListener('mouseleave', () => {
            arsOption.style.background = 'rgba(40,40,15,0.95)';
        });

        dropdown.appendChild(vtOption);
        dropdown.appendChild(chtOption);
        dropdown.appendChild(dentistOption);
        dropdown.appendChild(arsOption);

        // Переменные состояния
        this.activeBossType = null; // 'vt' или 'cht'
        this.vtAbortController = null;
        this.chtAbortController = null;

        // Функция показа/скрытия выпадающего меню
        const toggleDropdown = () => {
            const isVisible = dropdown.style.display === 'flex';
            if (isVisible) {
                dropdown.style.display = 'none';
            } else {
                // Позиционируем меню под кнопкой
                const buttonRect = bossDropdownBtn.getBoundingClientRect();
                dropdown.style.left = buttonRect.left + 'px';
                dropdown.style.top = (buttonRect.bottom + 2) + 'px';
                dropdown.style.display = 'flex';
            }
        };

        // Функция сброса кнопки к исходному состоянию
        const resetButton = () => {
            iconSpan.textContent = 'АКТИВНОСТИ';
            bossDropdownBtn.style.background = 'radial-gradient(circle, rgba(40,25,15,0.95) 0%, rgba(20,12,8,0.98) 100%)';
            bossDropdownBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            this.activeBossType = null;
        };

        // Функция активации босса ВТ
        const activateVT = async () => {
            if (window.BotUI && window.BotUI.deactivateAllButtons) {
                window.BotUI.deactivateAllButtons();
            }
            
            this.activeBossType = 'vt';
            this.vtAbortController = new AbortController();
            iconSpan.textContent = 'СТОП ВТ';
            dropdown.style.display = 'none';
            
            bossDropdownBtn.style.background = 'radial-gradient(circle, rgba(60,25,25,0.95) 0%, rgba(30,12,12,0.98) 100%)';
            bossDropdownBtn.style.boxShadow = '0 2px 8px rgba(255, 69, 0, 0.5)';
            
            try {
                await this.bossFarmLoopVT(this.vtAbortController.signal);
            } catch (error) {
                if (error.message.includes('aborted')) {
                    console.log('Фарм босса ВТ остановлен');
                } else {
                    console.error('Ошибка фарма босса ВТ:', error);
                }
            } finally {
                this.vtAbortController = null;
                resetButton();
            }
        };

        // Функция активации босса ЧТ
        const activateCHT = async () => {
            if (window.BotUI && window.BotUI.deactivateAllButtons) {
                window.BotUI.deactivateAllButtons();
            }
            
            this.activeBossType = 'cht';
            this.chtAbortController = new AbortController();
            iconSpan.textContent = 'СТОП ЧТ';
            dropdown.style.display = 'none';
            
            bossDropdownBtn.style.background = 'radial-gradient(circle, rgba(45,25,60,0.95) 0%, rgba(25,15,40,0.98) 100%)';
            bossDropdownBtn.style.boxShadow = '0 2px 8px rgba(138, 43, 226, 0.5)';
            
            try {
                await this.bossFarmLoopCHT(this.chtAbortController.signal);
            } catch (error) {
                if (error.message.includes('aborted')) {
                    console.log('Фарм босса ЧТ остановлен');
                } else {
                    console.error('Ошибка фарма босса ЧТ:', error);
                }
            } finally {
                this.chtAbortController = null;
                resetButton();
            }
        };

        // Обработчики событий
        bossDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (this.activeBossType === 'vt') {
                // Останавливаем ВТ
                this.vtAbortController.abort();
                this.vtAbortController = null;
                resetButton();
                toggleDropdown();
            } else if (this.activeBossType === 'cht') {
                // Останавливаем ЧТ
                this.chtAbortController.abort();
                this.chtAbortController = null;
                resetButton();
                toggleDropdown();
            } else {
                // Показываем меню
                toggleDropdown();
            }
        });

        vtOption.addEventListener('click', (e) => {
            e.stopPropagation();
            activateVT();
        });

        chtOption.addEventListener('click', (e) => {
            e.stopPropagation();
            activateCHT();
        });

        dentistOption.addEventListener('click', (e) => {
            e.stopPropagation();
            // TODO: Логика для бонуса будет добавлена позже
            console.log('🎁 Кнопка БОНУС нажата (логика будет добавлена позже)');
            dropdown.style.display = 'none';
        });

        arsOption.addEventListener('click', (e) => {
            e.stopPropagation();
            this.analyzeArsenal();
            dropdown.style.display = 'none';
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!bossDropdownBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Добавляем выпадающее меню в body
        document.body.appendChild(dropdown);

        // Добавляем кнопку в body (позиционирование через новую систему)
        document.body.appendChild(bossDropdownBtn);

        // Функция для обновления видимости кнопок после авторизации
        this.updateBossButtonsVisibility = () => {
            if (window.BotUI && window.BotUI.isAuthorized) {
                dentistOption.style.display = 'block';
                arsOption.style.display = 'block';
            } else {
                dentistOption.style.display = 'none';
                arsOption.style.display = 'none';
            }
        };
    },

    /**
     * Фарм босса ВТ
     */
    async bossFarmLoopVT(abortSignal) {
        console.log('🔥 Запуск фарма босса ВТ...');
        const polygons = [
            "18,-25.5 36,-36 36,-57 18,-67.5 0,-57 0,-36 18,-25.5",
            "37.5,-59.25 55.5,-69.75 55.5,-90.75 37.5,-101.25 19.5,-90.75 19.5,-69.75 37.5,-59.25"
        ];
        const bossPolygonPoints = polygons[polygons.length - 1];

        while (true) {
            if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
            
            // Проверяем кнопку "В город" перед началом
            await window.BotNavigation.checkAndReturnToCity();
            
            console.log('🔥 Переход в локацию для босса ВТ...');
            await window.BotUtils.clickByTextContent('Сражения', 5000);
            await window.BotUtils.clickByLocationName('Зеленые топи', 5000);

            for (let i = 0; i < polygons.length - 1; ++i) {
                // Проверяем кнопку "В город" на каждом шаге
                await window.BotNavigation.checkAndReturnToCity();
                
                const polygonPoints = polygons[i];
                console.log(`🔥 Переход на полигон ${i + 1}/${polygons.length - 1}: ${polygonPoints}`);
                
                // Ищем полигон напрямую
                let polygon = null;
                const maxTries = 50; // 10 секунд при интервале 200мс
                
                for (let attempt = 0; attempt < maxTries; attempt++) {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                    
                    polygon = document.querySelector(`polygon.hexagon[points="${polygonPoints}"]`);
                    if (polygon) {
                        console.log(`✅ Найден полигон ${i + 1}: ${polygonPoints}`);
                        break;
                    }
                    
                    await window.BotUtils.delay(200);
                }
                
                if (!polygon) {
                    console.error(`❌ Не найден полигон для босса: ${polygonPoints}`);
                    throw new Error(`Не найден полигон для босса: ${polygonPoints}`);
                }
                
                console.log(`🔥 Кликаю на полигон ${i + 1}...`);
                window.BotNavigation.clickPolygon(polygon);
                await window.BotUtils.delay(300);
                
                // Проверяем кнопку "В город" после клика
                await window.BotNavigation.checkAndReturnToCity();
                
                console.log(`🔥 Ищу кнопку "Перейти"...`);
                const goBtn = await window.BotUtils.findGoButton(10000);
                
                if (goBtn) {
                    console.log(`🔥 Нажимаю "Перейти" для полигона ${i + 1}...`);
                    goBtn.click();
                    await window.BotUtils.delay(500);
                } else {
                    console.error('❌ Кнопка "Перейти" не найдена');
                    const allButtons = Array.from(document.querySelectorAll('div.button-content, button, [role="button"]'));
                    console.error('Доступные кнопки:', allButtons.map(btn => btn.textContent.trim()));
                    throw new Error('Кнопка "Перейти" не найдена');
                }
                
                // Проверяем кнопку "В город" после нажатия "Перейти"
                await window.BotNavigation.checkAndReturnToCity();
                
                console.log(`🔥 Жду подтверждения перехода на полигон ${i + 1}...`);
                await window.BotUtils.waitFor(() => {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                    const current = document.querySelector('g.hex-box.current polygon.hexagon');
                    return current && current.getAttribute('points') === polygonPoints;
                }, 200, 10000);
                console.log(`✅ Переход на полигон ${i + 1} завершен`);
            }
            
            if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');

            // Проверяем кнопку "В город" перед переходом к боссу
            await window.BotNavigation.checkAndReturnToCity();

            // Переход на последний полигон (босс)
            console.log('🔥 Переход к боссу ВТ...');
            
            // Ищем босс полигон напрямую
            let bossPolygon = null;
            const maxBossTries = 50; // 10 секунд при интервале 200мс
            
            for (let attempt = 0; attempt < maxBossTries; attempt++) {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                
                bossPolygon = document.querySelector(`polygon.hexagon[points="${bossPolygonPoints}"]`);
                if (bossPolygon) {
                    console.log(`✅ Найден полигон босса: ${bossPolygonPoints}`);
                    break;
                }
                
                await window.BotUtils.delay(200);
            }
            
            if (!bossPolygon) {
                console.error(`❌ Не найден полигон босса: ${bossPolygonPoints}`);
                throw new Error(`Не найден полигон босса: ${bossPolygonPoints}`);
            }
            
            console.log('🔥 Кликаю на босса ВТ...');
            window.BotNavigation.clickPolygon(bossPolygon);
            await window.BotUtils.delay(300);

            // Проверяем кнопку "В город" после клика на босса
            await window.BotNavigation.checkAndReturnToCity();

            console.log('🔥 Ищу кнопку "Перейти" к боссу...');
            const goBtn = await window.BotUtils.findGoButton(10000);
            
            if (goBtn) {
                console.log('🔥 Перехожу к боссу ВТ...');
                goBtn.click();
                await window.BotUtils.delay(500);
            } else {
                console.error('❌ Кнопка "Перейти" к боссу не найдена');
                const allButtons = Array.from(document.querySelectorAll('div.button-content, button, [role="button"]'));
                console.error('Доступные кнопки к боссу:', allButtons.map(btn => btn.textContent.trim()));
                throw new Error('Кнопка "Перейти" не найдена');
            }

            // Проверяем кнопку "В город" после перехода к боссу
            await window.BotNavigation.checkAndReturnToCity();

            console.log('🔥 Жду подтверждения перехода к боссу...');
            await window.BotUtils.waitFor(() => {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                const current = document.querySelector('g.hex-box.current polygon.hexagon');
                return current && current.getAttribute('points') === bossPolygonPoints;
            }, 200, 10000);

            console.log('🔥 Активирую прицел...');
            const aimIcon = document.querySelector('tui-icon.svg-icon[style*="aim.svg"]');
            if (aimIcon) {
                aimIcon.click();
                await window.BotUtils.delay(200);
            }

            console.log('🔥 Кликаю на босса для атаки...');
            window.BotNavigation.clickPolygon(bossPolygon);
            await window.BotUtils.delay(200);

            console.log('🔥 Начинаю бой с боссом ВТ...');
            await this.bossFightLoop(abortSignal, bossPolygonPoints);
        }
    },

    /**
     * Фарм босса ЧТ
     */
    async bossFarmLoopCHT(abortSignal) {
        const polygons = [
            "-1.5,8.25 16.5,-2.25 16.5,-23.25 -1.5,-33.75 -19.5,-23.25 -19.5,-2.25 -1.5,8.25",
            "18,-25.5 36,-36 36,-57 18,-67.5 0,-57 0,-36 18,-25.5",
            "37.5,-59.25 55.5,-69.75 55.5,-90.75 37.5,-101.25 19.5,-90.75 19.5,-69.75 37.5,-59.25",
            "57,-93 75,-103.5 75,-124.5 57,-135 39,-124.5 39,-103.5 57,-93",
            "76.5,-126.75 94.5,-137.25 94.5,-158.25 76.5,-168.75 58.5,-158.25 58.5,-137.25 76.5,-126.75"
        ];
        const bossPolygonPoints = polygons[polygons.length - 1];

        while (true) {
            if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');
            
            // Проверяем кнопку "В город" перед началом
            await window.BotNavigation.checkAndReturnToCity();
            
            await window.BotUtils.clickByTextContent('Сражения', 5000);
            await window.BotUtils.clickByLocationName('Зеленые топи', 5000);

            for (let i = 0; i < polygons.length - 1; ++i) {
                // Проверяем кнопку "В город" на каждом шаге
                await window.BotNavigation.checkAndReturnToCity();
                
                const polygonPoints = polygons[i];
                
                // Ищем полигон напрямую
                let polygon = null;
                const maxTries = 50; // 10 секунд при интервале 200мс
                
                for (let attempt = 0; attempt < maxTries; attempt++) {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');
                    
                    polygon = document.querySelector(`polygon.hexagon[points="${polygonPoints}"]`);
                    if (polygon) {
                        break;
                    }
                    
                    await window.BotUtils.delay(200);
                }
                
                if (!polygon) throw new Error(`Не найден полигон для босса: ${polygonPoints}`);
                
                window.BotNavigation.clickPolygon(polygon);
                await window.BotUtils.delay(300);
                
                // Проверяем кнопку "В город" после клика
                await window.BotNavigation.checkAndReturnToCity();
                
                const goBtn = await window.BotUtils.findGoButton(10000);
                
                if (goBtn) {
                    goBtn.click();
                    await window.BotUtils.delay(500);
                } else {
                    throw new Error('Кнопка "Перейти" не найдена');
                }
                
                // Проверяем кнопку "В город" после нажатия "Перейти"
                await window.BotNavigation.checkAndReturnToCity();
                
                await window.BotUtils.waitFor(() => {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');
                    const current = document.querySelector('g.hex-box.current polygon.hexagon');
                    return current && current.getAttribute('points') === polygonPoints;
                }, 200, 10000);
            }
            
            if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');

            // Проверяем кнопку "В город" перед переходом к боссу
            await window.BotNavigation.checkAndReturnToCity();

            // Переход на последний полигон (босс)
            
            // Ищем босс полигон напрямую
            let bossPolygon = null;
            const maxBossTries = 50; // 10 секунд при интервале 200мс
            
            for (let attempt = 0; attempt < maxBossTries; attempt++) {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');
                
                bossPolygon = document.querySelector(`polygon.hexagon[points="${bossPolygonPoints}"]`);
                if (bossPolygon) {
                    break;
                }
                
                await window.BotUtils.delay(200);
            }
            
            if (!bossPolygon) {
                throw new Error(`Не найден полигон босса: ${bossPolygonPoints}`);
            }
            
            window.BotNavigation.clickPolygon(bossPolygon);
            await window.BotUtils.delay(300);

            // Проверяем кнопку "В город" после клика на босса
            await window.BotNavigation.checkAndReturnToCity();

            const goBtn = await window.BotUtils.findGoButton(10000);
            
            if (goBtn) {
                goBtn.click();
                await window.BotUtils.delay(500);
            } else {
                throw new Error('Кнопка "Перейти" не найдена');
            }

            // Проверяем кнопку "В город" после перехода к боссу
            await window.BotNavigation.checkAndReturnToCity();

            await window.BotUtils.waitFor(() => {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');
                const current = document.querySelector('g.hex-box.current polygon.hexagon');
                return current && current.getAttribute('points') === bossPolygonPoints;
            }, 200, 10000);

            const aimIcon = document.querySelector('tui-icon.svg-icon[style*="aim.svg"]');
            if (aimIcon) {
                aimIcon.click();
                await window.BotUtils.delay(200);
            }

            window.BotNavigation.clickPolygon(bossPolygon);
            await window.BotUtils.delay(200);

            await this.bossFightLoop(abortSignal, bossPolygonPoints);
        }
    },

    /**
     * Цикл боя с боссом
     */
    async bossFightLoop(abortSignal, bossPolygonPoints) {
        while (true) {
            if (abortSignal && abortSignal.aborted) throw new Error('bossFightLoop aborted');

            await window.BotNavigation.checkAndReturnToCity();

            // Ищем иконку босса напрямую
            let bossIcon = null;
            const maxIconTries = 50; // 10 секунд при интервале 200мс
            
            for (let attempt = 0; attempt < maxIconTries; attempt++) {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFightLoop aborted');
                
                bossIcon = document.querySelector('tui-icon.svg-icon[style*="mob-type-boss.svg"]');
                if (bossIcon) {
                    break;
                }
                
                await window.BotUtils.delay(200);
            }

            if (!bossIcon) throw new Error('Иконка босса не найдена');
            bossIcon.click();
            await window.BotUtils.delay(300);

            let bossDead = false;
            while (!bossDead) {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFightLoop aborted');

                await window.BotNavigation.checkAndReturnToCity();

                const bossCard = document.querySelector('app-profile-card.target');
                if (bossCard) {
                    const deadIcon = bossCard.querySelector('tui-icon.svg-icon[style*="dead.svg"]');
                    if (deadIcon) {
                        bossDead = true;
                        break;
                    }
                }

                window.BotConfig.selectedClass = window.BotUtils.detectPlayerClass();
                const skills = window.BotConfig.CLASS_SKILLS[window.BotConfig.selectedClass];
                if (skills && skills.attack && skills.attack.length) {
                    for (const skill of skills.attack) {
                        await window.BotCombat.useSkill(skill);
                        await window.BotUtils.delay(100);
                    }
                }
                
                if (window.BotConfig.selectedClass === 'Лучник' && skills && skills.multitarget) {
                    await window.BotCombat.useSkill(skills.multitarget);
                    await window.BotUtils.delay(100);
                }

                await window.BotCombat.checkManaAndHealth();
                await window.BotUtils.delay(100);
                await window.BotUtils.delay(200);
            }

            await window.BotUtils.delay(200);
        }
    },

    /**
     * Анализ арсенала гильдии
     */
    async analyzeArsenal() {
        try {
            console.log('🏛️ Начинаю анализ арсенала...');
            
            // 1. Нажимаем на Гильдию
            console.log('1️⃣ Переход в Гильдию...');
            const guildButton = await window.BotUtils.waitForElement('div.footer-button .footer-button-text', 'Гильдия', 5000);
            if (guildButton) {
                guildButton.click();
                await window.BotUtils.delay(100);
                console.log('✅ Перешли в Гильдию');
            } else {
                console.error('❌ Кнопка "Гильдия" не найдена');
                return;
            }

            // 2. Нажимаем на Арсенал
            console.log('2️⃣ Переход в Арсенал...');
            const arsenalButton = await window.BotUtils.waitForElement('div.guild-aspect-title', 'Арсенал', 5000);
            if (arsenalButton) {
                arsenalButton.closest('.guild-aspect').click();
                await window.BotUtils.delay(100);
                console.log('✅ Перешли в Арсенал');
            } else {
                console.error('❌ Кнопка "Арсенал" не найдена');
                return;
            }

            // 3. Анализируем все предметы
            console.log('3️⃣ Начинаю анализ предметов...');
            const itemList = document.querySelector('app-item-list');
            if (!itemList) {
                console.error('❌ Список предметов не найден');
                return;
            }

            const itemCards = itemList.querySelectorAll('app-item-card');
            console.log(`🔍 Найдено ${itemCards.length} предметов для анализа`);

            let analyzedCount = 0;
            const itemsData = []; // Массив для сбора данных

            for (let i = 0; i < itemCards.length; i++) {
                const item = itemCards[i];
                console.log(`📦 Анализ предмета ${i + 1}/${itemCards.length}...`);
                
                try {
                    // Кликаем на предмет
                    item.click();
                    await window.BotUtils.delay(100);

                    // Ждем появления диалога
                    const dialog = await window.BotUtils.waitForElement('app-dialog-container.dialog-container-item', null, 3000);
                    if (!dialog) {
                        console.log('⚠️ Диалог предмета не открылся, пропускаем');
                        continue;
                    }

                    // Извлекаем информацию о предмете
                    const itemInfo = this.extractItemInfo(dialog);
                    itemsData.push(itemInfo);
                    
                    analyzedCount++;

                    // Закрываем диалог
                    const closeButton = dialog.querySelector('tui-icon.svg-icon[style*="close.svg"]');
                    if (closeButton) {
                        closeButton.click();
                        await window.BotUtils.delay(100);
                    }

                } catch (error) {
                    console.error(`❌ Ошибка при анализе предмета ${i + 1}:`, error);
                }
            }

            console.log(`\n🎉 === АНАЛИЗ ЗАВЕРШЕН ===`);
            console.log(`📊 Проанализировано предметов: ${analyzedCount}/${itemCards.length}`);

            // Создаем Google Doc с результатами
            if (itemsData.length > 0) {
                await this.createGoogleDocWithItems(itemsData);
            }

        } catch (error) {
            console.error('❌ Ошибка при анализе арсенала:', error);
        }
    },

    /**
     * Извлечение информации о предмете из диалога
     * @param {HTMLElement} dialog - диалог предмета
     */
    extractItemInfo(dialog) {
        const info = {};

        try {
            // Название предмета
            const nameElement = dialog.querySelector('.dialog-header');
            info.name = nameElement ? nameElement.textContent.trim() : 'Неизвестно';

            // Мощь предмета (ГС)
            const gearScoreElement = dialog.querySelector('.gear-score-value');
            info.gearScore = gearScoreElement ? parseInt(gearScoreElement.textContent.trim()) : 0;

            // Тип предмета
            const typeElement = dialog.querySelector('.item-tags');
            info.type = typeElement ? typeElement.textContent.trim() : 'Неизвестно';

            // Уровень
            const tierElement = dialog.querySelector('.item-tier');
            info.tier = tierElement ? tierElement.textContent.trim() : 'Неизвестно';

            // Качество
            const qualityElement = dialog.querySelector('.item-quality');
            info.quality = qualityElement ? qualityElement.textContent.trim() : 'Неизвестно';

            // Основные характеристики
            info.stats = [];
            const statElements = dialog.querySelectorAll('.item-index-item');
            statElements.forEach(stat => {
                const valueElement = stat.querySelector('.item-index-value');
                const keyElement = stat.querySelector('.item-index-key');
                if (valueElement && keyElement) {
                    info.stats.push({
                        value: valueElement.textContent.trim(),
                        name: keyElement.textContent.trim()
                    });
                }
            });

            // Магические свойства
            info.magicProps = [];
            const magicElements = dialog.querySelectorAll('app-magic-prop');
            magicElements.forEach(prop => {
                const valueElement = prop.querySelector('.magic-prop-value');
                const nameElement = prop.querySelector('.magic-prop-name');
                const percentElement = prop.querySelector('.magic-prop-percent');
                
                if (valueElement && nameElement) {
                    info.magicProps.push({
                        value: valueElement.textContent.trim(),
                        name: nameElement.textContent.trim(),
                        percent: percentElement ? percentElement.textContent.trim() : ''
                    });
                }
            });

            // Требования
            info.requirements = [];
            const reqElements = dialog.querySelectorAll('.item-requirement');
            reqElements.forEach(req => {
                const keyElement = req.querySelector('.item-requirement-key');
                const valueElement = req.querySelector('.item-requirement-value');
                if (keyElement && valueElement) {
                    info.requirements.push({
                        key: keyElement.textContent.trim(),
                        value: valueElement.textContent.trim()
                    });
                }
            });

        } catch (error) {
            console.error('Ошибка при извлечении информации о предмете:', error);
        }

        return info;
    },

    /**
     * Вывод информации о предмете в консоль
     * @param {Object} itemInfo - информация о предмете
     * @param {number} index - номер предмета
     */
    logItemInfo(itemInfo, index) {
        console.log(`📋 ПРЕДМЕТ #${index}:`);
        console.log(`   🏷️  Название: ${itemInfo.name}`);
        console.log(`   ⚔️  Тип: ${itemInfo.type}`);
        console.log(`   ⭐  Качество: ${itemInfo.quality}`);
        console.log(`   🔢  Уровень: ${itemInfo.tier}`);
        console.log(`   💪  Мощь предмета (ГС): ${itemInfo.gearScore}`);
        
        if (itemInfo.stats.length > 0) {
            console.log(`   📊  Основные характеристики:`);
            itemInfo.stats.forEach(stat => {
                console.log(`       • ${stat.name}: ${stat.value}`);
            });
        }
        
        if (itemInfo.magicProps.length > 0) {
            console.log(`   ✨  Магические свойства:`);
            itemInfo.magicProps.forEach(prop => {
                console.log(`       • ${prop.name}: ${prop.value} ${prop.percent}`);
            });
        }
        
        if (itemInfo.requirements.length > 0) {
            console.log(`   📋  Требования:`);
            itemInfo.requirements.forEach(req => {
                console.log(`       • ${req.key} ${req.value}`);
            });
        }
    },

    /**
     * Создание Google Doc с результатами анализа
     * @param {Array} itemsData - массив данных о предметах
     */
    async createGoogleDocWithItems(itemsData) {
        try {
            console.log('📝 Создание документа с результатами...');
            
            // Пытаемся отправить в Google Sheets (если настроен)
            await this.sendToGoogleSheets(itemsData);
            
            // Создаем HTML для локального просмотра
            const htmlContent = this.generateItemsTableHTML(itemsData);
            
            // Открываем новое окно с результатами
            const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes');
            
            if (newWindow) {
                newWindow.document.write(htmlContent);
                newWindow.document.close();
                console.log('✅ Результаты открыты в новом окне');
                
                // Также сохраняем в буфер обмена (если поддерживается)
                try {
                    const textContent = this.generatePlainTextTable(itemsData);
                    await navigator.clipboard.writeText(textContent);
                    console.log('📋 Данные также скопированы в буфер обмена');
                } catch (clipboardError) {
                    console.log('⚠️ Не удалось скопировать в буфер обмена');
                }
            } else {
                console.error('❌ Не удалось открыть новое окно. Проверьте настройки блокировщика всплывающих окон');
            }
            
        } catch (error) {
            console.error('❌ Ошибка при создании документа:', error);
        }
    },

    /**
     * Отправка данных в Google Sheets
     * @param {Array} itemsData - массив данных о предметах
     */
    async sendToGoogleSheets(itemsData) {
        try {
            // Проверяем, настроен ли Google Apps Script URL
            const gasUrl = window.BotConfig.googleSheetsUrl;
            if (!gasUrl) {
                console.log('📊 Google Sheets не настроен. Для настройки смотрите инструкцию в консоли.');
                this.showGoogleSheetsSetupInstructions();
                return;
            }

            console.log('📤 Отправка данных в Google Sheets...');
            console.log('🔗 URL:', gasUrl);

            // Создаем уникальные идентификаторы для предметов
            const itemsWithIds = itemsData.map(item => ({
                ...item,
                uniqueId: this.generateItemId(item),
                analysisDate: new Date().toISOString(),
                botVersion: window.BotConfig.SCRIPT_COMMIT
            }));

            const payload = {
                action: 'addItems',
                items: itemsWithIds
            };

            console.log('📦 Отправляем данных:', itemsWithIds.length, 'предметов');

            // Попробуем несколько подходов
            let success = false;
            let lastError = null;

            // Подход 1: Прямой POST без CORS проблем - используем content-type: text/plain
            try {
                console.log('🔄 Попытка 1: text/plain запрос...');
                const response = await fetch(gasUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: JSON.stringify(payload)
                });
                
                console.log('📡 Статус ответа:', response.status, response.statusText);
                
                if (response.ok) {
                    try {
                        const result = await response.text();
                        console.log('✅ Успешная отправка! Ответ от сервера:', result);
                        
                        // Пытаемся парсить как JSON
                        try {
                            const jsonResult = JSON.parse(result);
                            console.log(`📊 Добавлено новых предметов: ${jsonResult.addedCount}, пропущено дублей: ${jsonResult.duplicatesCount}`);
                            if (jsonResult.spreadsheetUrl) {
                                console.log(`🔗 Ссылка на таблицу: ${jsonResult.spreadsheetUrl}`);
                            }
                        } catch (parseError) {
                            console.log('📝 Ответ (не JSON):', result);
                        }
                        success = true;
                    } catch (readError) {
                        console.log('⚠️ Запрос отправлен, но не удалось прочитать ответ:', readError.message);
                        success = true; // считаем успешным, если статус 200
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                console.log('⚠️ Попытка 1 не удалась:', error.message);
                lastError = error;
            }

            // Подход 2: Если первый не сработал, попробуем через form data
            if (!success) {
                try {
                    console.log('🔄 Попытка 2: form data...');
                    const formData = new FormData();
                    formData.append('data', JSON.stringify(payload));

                    const response = await fetch(gasUrl, {
                        method: 'POST',
                        body: formData
                    });
                    
                    console.log('📡 Статус ответа (form):', response.status, response.statusText);
                    
                    if (response.ok) {
                        const result = await response.text();
                        console.log('✅ Успешная отправка через form data! Ответ:', result);
                        success = true;
                    } else {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                } catch (error) {
                    console.log('⚠️ Попытка 2 не удалась:', error.message);
                    lastError = error;
                }
            }

            // Подход 3: No-CORS как крайний случай
            if (!success) {
                try {
                    console.log('🔄 Попытка 3: no-cors режим (отправка вслепую)...');
                    const response = await fetch(gasUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'text/plain',
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    console.log('📡 No-CORS ответ получен (type:', response.type, ')');
                    console.log('✅ Данные отправлены в no-cors режиме. Проверьте таблицу вручную.');
                    console.log(`📊 Отправлено ${itemsWithIds.length} предметов.`);
                    
                    // Пытаемся построить ссылку на таблицу
                    const spreadsheetUrl = this.getSpreadsheetUrlFromGasUrl(gasUrl);
                    if (spreadsheetUrl) {
                        console.log(`🔗 Примерная ссылка на проект: ${spreadsheetUrl}`);
                    }
                    success = true;
                } catch (error) {
                    console.log('⚠️ Попытка 3 не удалась:', error.message);
                    lastError = error;
                }
            }

            if (!success) {
                throw lastError || new Error('Все попытки отправки завершились неудачей');
            }

        } catch (error) {
            console.error('❌ Ошибка отправки в Google Sheets:', error);
            console.log('');
            console.log('🔧 === ДИАГНОСТИКА ПРОБЛЕМЫ ===');
            console.log('');
            
            if (error.message.includes('401')) {
                console.log('🚨 ОШИБКА 401 (Unauthorized):');
                console.log('   1. Проверьте настройки деплоя в Google Apps Script:');
                console.log('      • "Execute as" (Выполнить как): Me (Я)');
                console.log('      • "Who has access" (Кто имеет доступ): Anyone (Все)');
                console.log('   2. Убедитесь что скрипт развернут правильно');
                console.log('   3. Попробуйте создать новый деплой');
            } else if (error.message.includes('CORS')) {
                console.log('🚨 ОШИБКА CORS:');
                console.log('   1. Убедитесь что в Google Apps Script есть функция doOptions()');
                console.log('   2. Проверьте что возвращаются правильные CORS заголовки');
            } else {
                console.log('🚨 ОБЩАЯ ОШИБКА:');
                console.log('   1. Проверьте что URL правильный и заканчивается на /exec');
                console.log('   2. Убедитесь что Google Apps Script работает');
                console.log('   3. Попробуйте протестировать скрипт отдельно');
            }
            
            console.log('');
            console.log('💡 РЕШЕНИЯ:');
            console.log('   • Данные всё равно сохранены локально');
            console.log('   • Попробуйте перездеплоить Google Apps Script');
            console.log('   • Проверьте код Google Apps Script (ниже)');
            
            // Показываем инструкции
            this.showGoogleSheetsSetupInstructions();
        }
    },

    /**
     * Получение URL таблицы из URL Google Apps Script
     * @param {string} gasUrl - URL Google Apps Script
     */
    getSpreadsheetUrlFromGasUrl(gasUrl) {
        try {
            // Пытаемся извлечь ID скрипта из URL
            const match = gasUrl.match(/\/macros\/s\/([a-zA-Z0-9-_]+)\//);
            if (match && match[1]) {
                // Примерная ссылка на проект скрипта
                return `https://script.google.com/d/${match[1]}/edit`;
            }
        } catch (error) {
            console.log('Не удалось построить ссылку на таблицу');
        }
        return null;
    },

    /**
     * Генерация уникального ID для предмета
     * @param {Object} item - данные предмета
     */
    generateItemId(item) {
        // Создаем уникальный ID на основе основных характеристик предмета
        const baseString = [
            item.name || '',
            item.type || '',
            item.quality || '',
            item.tier || '',
            item.gearScore || 0,
            item.stats.map(s => `${s.name}:${s.value}`).sort().join('|'),
            item.magicProps.map(p => `${p.name}:${p.value}:${p.percent}`).sort().join('|')
        ].join('::');
        
        // Простая хеш-функция
        let hash = 0;
        for (let i = 0; i < baseString.length; i++) {
            const char = baseString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Конвертируем в 32-битное число
        }
        
        return Math.abs(hash).toString(36);
    },

    /**
     * Показ инструкций по настройке Google Sheets
     */
    showGoogleSheetsSetupInstructions() {
        const googleAppsScriptCode = "// Обработка POST запросов\n" +
"function doPost(e) {\n" +
"  try {\n" +
"    var data;\n" +
"    \n" +
"    // Пытаемся получить данные из разных источников\n" +
"    if (e.postData) {\n" +
"      if (e.postData.type === 'application/json') {\n" +
"        data = JSON.parse(e.postData.contents);\n" +
"      } else if (e.postData.type === 'text/plain') {\n" +
"        data = JSON.parse(e.postData.contents);\n" +
"      } else {\n" +
"        // Form data\n" +
"        data = JSON.parse(e.parameter.data);\n" +
"      }\n" +
"    } else if (e.parameter && e.parameter.data) {\n" +
"      data = JSON.parse(e.parameter.data);\n" +
"    } else {\n" +
"      throw new Error('Нет данных в запросе');\n" +
"    }\n" +
"    \n" +
"    console.log('Получены данные:', data);\n" +
"    \n" +
"    if (data.action === 'addItems') {\n" +
"      return addItemsToSheet(data.items);\n" +
"    }\n" +
"    \n" +
"    return createSuccessResponse({error: 'Неизвестное действие'});\n" +
"      \n" +
"  } catch (error) {\n" +
"    console.error('Ошибка в doPost:', error);\n" +
"    return createSuccessResponse({error: error.toString()});\n" +
"  }\n" +
"}\n" +
"\n" +
"// Обработка OPTIONS запросов для CORS\n" +
"function doOptions() {\n" +
"  return createSuccessResponse('');\n" +
"}\n" +
"\n" +
"// Создание ответа с правильными заголовками\n" +
"function createSuccessResponse(data) {\n" +
"  return ContentService\n" +
"    .createTextOutput(typeof data === 'string' ? data : JSON.stringify(data))\n" +
"    .setMimeType(ContentService.MimeType.JSON)\n" +
"    .setHeaders({\n" +
"      'Access-Control-Allow-Origin': '*',\n" +
"      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',\n" +
"      'Access-Control-Allow-Headers': 'Content-Type, Authorization'\n" +
"    });\n" +
"}\n" +
"\n" +
"// Добавление предметов в таблицу\n" +
"function addItemsToSheet(items) {\n" +
"  try {\n" +
"    // Создаем или получаем таблицу\n" +
"    var spreadsheet;\n" +
"    try {\n" +
"      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();\n" +
"    } catch (e) {\n" +
"      // Если нет привязанной таблицы, создаем новую\n" +
"      spreadsheet = SpreadsheetApp.create('Арсенал Гильдии Ligmar');\n" +
"      console.log('Создана новая таблица:', spreadsheet.getUrl());\n" +
"    }\n" +
"    \n" +
"    var sheet = spreadsheet.getSheetByName('Арсенал');\n" +
"    \n" +
"    // Создаем лист если не существует\n" +
"    if (!sheet) {\n" +
"      sheet = spreadsheet.insertSheet('Арсенал');\n" +
"      // Добавляем заголовки\n" +
"      var headers = [\n" +
"        'ID', 'Дата анализа', 'Версия бота', 'Название', 'Тип', 'Качество', \n" +
"        'Уровень', 'ГС', 'Основные характеристики', 'Магические свойства', 'Требования'\n" +
"      ];\n" +
"      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);\n" +
"      \n" +
"      // Форматирование заголовков\n" +
"      var headerRange = sheet.getRange(1, 1, 1, headers.length);\n" +
"      headerRange.setFontWeight('bold');\n" +
"      headerRange.setBackground('#4285f4');\n" +
"      headerRange.setFontColor('white');\n" +
"      headerRange.setBorder(true, true, true, true, true, true);\n" +
"    }\n" +
"    \n" +
"    // Получаем существующие ID для избежания дублей\n" +
"    var existingData = sheet.getDataRange().getValues();\n" +
"    var existingIds = [];\n" +
"    for (var i = 1; i < existingData.length; i++) {\n" +
"      if (existingData[i][0]) {\n" +
"        existingIds.push(existingData[i][0]);\n" +
"      }\n" +
"    }\n" +
"    \n" +
"    // Фильтруем новые предметы\n" +
"    var newItems = items.filter(function(item) {\n" +
"      return existingIds.indexOf(item.uniqueId) === -1;\n" +
"    });\n" +
"    \n" +
"    console.log('Обработка: ' + items.length + ' предметов, новых: ' + newItems.length);\n" +
"    \n" +
"    if (newItems.length > 0) {\n" +
"      // Добавляем новые предметы\n" +
"      var newRows = newItems.map(function(item) {\n" +
"        return [\n" +
"          item.uniqueId,\n" +
"          new Date(item.analysisDate),\n" +
"          item.botVersion,\n" +
"          item.name || '',\n" +
"          item.type || '',\n" +
"          item.quality || '',\n" +
"          item.tier || '',\n" +
"          item.gearScore || 0,\n" +
"          item.stats.map(function(s) { return s.name + ': ' + s.value; }).join(', '),\n" +
"          item.magicProps.map(function(p) { return p.name + ': ' + p.value + ' ' + p.percent; }).join(', '),\n" +
"          item.requirements.map(function(r) { return r.key + ' ' + r.value; }).join(', ')\n" +
"        ];\n" +
"      });\n" +
"      \n" +
"      var startRow = sheet.getLastRow() + 1;\n" +
"      sheet.getRange(startRow, 1, newRows.length, newRows[0].length).setValues(newRows);\n" +
"      \n" +
"      // Применяем форматирование\n" +
"      var dataRange = sheet.getRange(startRow, 1, newRows.length, newRows[0].length);\n" +
"      dataRange.setBorder(true, true, true, true, true, true);\n" +
"      \n" +
"      // Автоматическая ширина колонок\n" +
"      sheet.autoResizeColumns(1, newRows[0].length);\n" +
"    }\n" +
"    \n" +
"    var result = {\n" +
"      success: true,\n" +
"      addedCount: newItems.length,\n" +
"      duplicatesCount: items.length - newItems.length,\n" +
"      totalItems: sheet.getLastRow() - 1,\n" +
"      spreadsheetUrl: spreadsheet.getUrl(),\n" +
"      sheetId: spreadsheet.getId()\n" +
"    };\n" +
"    \n" +
"    console.log('Результат:', result);\n" +
"    return createSuccessResponse(result);\n" +
"    \n" +
"  } catch (error) {\n" +
"    console.error('Ошибка в addItemsToSheet:', error);\n" +
"    return createSuccessResponse({\n" +
"      success: false,\n" +
"      error: error.toString()\n" +
"    });\n" +
"  }\n" +
"}\n" +
"\n" +
"// Тестовая функция для проверки работы\n" +
"function testFunction() {\n" +
"  console.log('Тест успешен! Скрипт работает.');\n" +
"  return 'OK';\n" +
"}";

        console.log(`
📊 === ИНСТРУКЦИЯ ПО НАСТРОЙКЕ GOOGLE SHEETS ===

🔧 Шаг 1: Создайте Google Apps Script
1. Перейдите на https://script.google.com
2. Создайте новый проект
3. Вставьте код Google Apps Script (см. ниже)
4. Сохраните проект (Ctrl+S)

🔧 Шаг 2: Разверните как веб-приложение
1. Нажмите "Deploy" (Развернуть) > "New deployment" (Новый деплой)
2. Выберите тип: "Web app" (Веб-приложение)
3. Настройки:
   • Execute as (Выполнить как): Me (Я)
   • Who has access (Кто имеет доступ): Anyone (Все)
4. Нажмите "Deploy" (Развернуть)
5. Скопируйте URL веб-приложения (заканчивается на /exec)

🔧 Шаг 3: Добавьте URL в конфиг
Добавьте строку в modules/config.js:
googleSheetsUrl: 'ВАШ_URL_СЮДА',

📝 КОД ДЛЯ GOOGLE APPS SCRIPT:
========================================`);
        
        console.log(googleAppsScriptCode);
        
        console.log(`========================================

🧪 Шаг 4: Протестируйте
1. В редакторе Google Apps Script запустите функцию testFunction()
2. Проверьте что нет ошибок
3. Попробуйте анализ арсенала в боте

⚠️ ВАЖНО:
• URL должен заканчиваться на /exec (НЕ /dev)
• Настройки доступа должны быть "Anyone" (Все)
• Если не работает, попробуйте создать новый деплой

✅ После настройки ваши данные будут автоматически сохраняться в Google Sheets!
        `);
    },

    /**
     * Генерация HTML таблицы для результатов
     * @param {Array} itemsData - массив данных о предметах
     */
    generateItemsTableHTML(itemsData) {
        const currentDate = new Date().toLocaleString('ru-RU');
        
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Анализ Арсенала Гильдии - ${currentDate}</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .container { max-width: 1400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                h1 { color: #2c3e50; text-align: center; margin-bottom: 10px; font-size: 28px; }
                .subtitle { text-align: center; color: #7f8c8d; margin-bottom: 30px; font-size: 16px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
                th { background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 12px 8px; text-align: left; font-weight: bold; position: sticky; top: 0; }
                td { padding: 10px 8px; border-bottom: 1px solid #ecf0f1; vertical-align: top; }
                tr:nth-child(even) { background-color: #f8f9fa; }
                tr:hover { background-color: #e3f2fd; }
                .item-name { font-weight: bold; color: #2c3e50; max-width: 150px; }
                .item-type { color: #8e44ad; font-weight: 600; }
                .quality-epic { color: #9b59b6; font-weight: bold; }
                .quality-rare { color: #3498db; font-weight: bold; }
                .quality-uncommon { color: #27ae60; font-weight: bold; }
                .quality-common { color: #95a5a6; }
                .gear-score { font-size: 14px; font-weight: bold; color: #e74c3c; text-align: center; }
                .stats-list { margin: 0; padding: 0; list-style: none; }
                .stats-list li { margin: 2px 0; font-size: 11px; }
                .magic-props { margin: 0; padding: 0; list-style: none; }
                .magic-props li { margin: 2px 0; font-size: 11px; color: #8e44ad; }
                .requirements { margin: 0; padding: 0; list-style: none; font-size: 10px; color: #7f8c8d; }
                .summary { background: #ecf0f1; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center; }
                .summary h3 { color: #2c3e50; margin: 0 0 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🏛️ Анализ Арсенала Гильдии</h1>
                <div class="subtitle">Дата анализа: ${currentDate} | Всего предметов: ${itemsData.length}</div>
                
                <table>
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Название</th>
                            <th>Тип</th>
                            <th>Качество</th>
                            <th>Уровень</th>
                            <th>ГС</th>
                            <th>Основные характеристики</th>
                            <th>Магические свойства</th>
                            <th>Требования</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        itemsData.forEach((item, index) => {
            const qualityClass = this.getQualityClass(item.quality);
            
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td class="item-name">${item.name || 'Неизвестно'}</td>
                    <td class="item-type">${item.type || 'Неизвестно'}</td>
                    <td class="${qualityClass}">${item.quality || 'Неизвестно'}</td>
                    <td>${item.tier || 'Неизвестно'}</td>
                    <td class="gear-score">${item.gearScore || 0}</td>
                    <td>
                        <ul class="stats-list">
                            ${item.stats.map(stat => `<li>• ${stat.name}: ${stat.value}</li>`).join('')}
                        </ul>
                    </td>
                    <td>
                        <ul class="magic-props">
                            ${item.magicProps.map(prop => `<li>• ${prop.name}: ${prop.value} ${prop.percent}</li>`).join('')}
                        </ul>
                    </td>
                    <td>
                        <ul class="requirements">
                            ${item.requirements.map(req => `<li>${req.key} ${req.value}</li>`).join('')}
                        </ul>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
                
                <div class="summary">
                    <h3>📊 Сводка анализа</h3>
                    <p>Проанализировано предметов: <strong>${itemsData.length}</strong></p>
                    <p>Средний ГС: <strong>${this.calculateAverageGS(itemsData)}</strong></p>
                    <p>Максимальный ГС: <strong>${this.getMaxGS(itemsData)}</strong></p>
                    <p>Сгенерировано ботом Ligmar v.${window.BotConfig.SCRIPT_COMMIT}</p>
                </div>
            </div>
        </body>
        </html>
        `;
        
        return html;
    },

    /**
     * Получение CSS класса для качества предмета
     */
    getQualityClass(quality) {
        if (quality.includes('Эпическ')) return 'quality-epic';
        if (quality.includes('Редк')) return 'quality-rare';
        if (quality.includes('Необычн')) return 'quality-uncommon';
        return 'quality-common';
    },

    /**
     * Вычисление среднего ГС
     */
    calculateAverageGS(itemsData) {
        const totalGS = itemsData.reduce((sum, item) => sum + (item.gearScore || 0), 0);
        return Math.round(totalGS / itemsData.length);
    },

    /**
     * Получение максимального ГС
     */
    getMaxGS(itemsData) {
        return Math.max(...itemsData.map(item => item.gearScore || 0));
    },

    /**
     * Генерация текстовой таблицы для буфера обмена
     */
    generatePlainTextTable(itemsData) {
        const currentDate = new Date().toLocaleString('ru-RU');
        let text = `🏛️ АНАЛИЗ АРСЕНАЛА ГИЛЬДИИ\n`;
        text += `Дата: ${currentDate}\n`;
        text += `Всего предметов: ${itemsData.length}\n\n`;
        
        text += `№\tНазвание\tТип\tКачество\tУровень\tГС\tОсновные характеристики\tМагические свойства\n`;
        text += '='.repeat(150) + '\n';
        
        itemsData.forEach((item, index) => {
            const stats = item.stats.map(s => `${s.name}: ${s.value}`).join(', ');
            const magicProps = item.magicProps.map(p => `${p.name}: ${p.value} ${p.percent}`).join(', ');
            
            text += `${index + 1}\t${item.name}\t${item.type}\t${item.quality}\t${item.tier}\t${item.gearScore}\t${stats}\t${magicProps}\n`;
        });
        
        text += '\n📊 СВОДКА:\n';
        text += `Средний ГС: ${this.calculateAverageGS(itemsData)}\n`;
        text += `Максимальный ГС: ${this.getMaxGS(itemsData)}\n`;
        text += `Сгенерировано ботом Ligmar v.${window.BotConfig.SCRIPT_COMMIT}`;
        
        return text;
    },
}; 