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
        const hexagonFound = await window.BotNavigation.clickHexagonWithPriority(window.BotNavigation.getPriorities());
        if (!hexagonFound) return;

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
                    
                    await window.BotCombat.fightEnemies();
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
            await window.BotCombat.fightEnemies();
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
            
            await window.BotCombat.fightEnemies();
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
            position: 'absolute',
            left: '0',
            top: '35px', // Сразу под кнопкой
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
            dropdown.style.display = isVisible ? 'none' : 'flex';
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

        // Сборка компонента - выпадающее меню добавляем к кнопке
        bossDropdownBtn.appendChild(dropdown);

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
                
                const polygon = await window.BotUtils.waitFor(() => {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                    const foundPolygon = document.querySelector(`polygon.hexagon[points="${polygonPoints}"]`);
                    if (foundPolygon) {
                        console.log(`✅ Найден полигон ${i + 1}: ${polygonPoints}`);
                    }
                    return foundPolygon;
                }, 200, 10000);
                
                if (!polygon) {
                    console.error(`❌ Не найден полигон для босса: ${polygonPoints}`);
                    throw new Error(`Не найден полигон для босса: ${polygonPoints}`);
                }
                
                console.log(`🔥 Кликаю на полигон ${i + 1}...`);
                const clickResult = window.BotNavigation.clickPolygon(polygon);
                if (!clickResult) {
                    console.error(`❌ Ошибка клика на полигон ${i + 1}`);
                    throw new Error(`Ошибка клика на полигон ${i + 1}`);
                }
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
            const bossPolygon = await window.BotUtils.waitFor(() => {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                return document.querySelector(`polygon.hexagon[points="${bossPolygonPoints}"]`);
            }, 200, 10000);
            
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
                const polygon = await window.BotUtils.waitFor(() => {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');
                    return document.querySelector(`polygon.hexagon[points="${polygonPoints}"]`);
                }, 200, 10000);
                
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
            const bossPolygon = await window.BotUtils.waitFor(() => {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');
                return document.querySelector(`polygon.hexagon[points="${bossPolygonPoints}"]`);
            }, 200, 10000);
            
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

            const bossIcon = await window.BotUtils.waitFor(() => {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFightLoop aborted');
                return document.querySelector('tui-icon.svg-icon[style*="mob-type-boss.svg"]');
            }, 200, 10000);

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
            
            // 1. Нажимаем на Гильдия
            console.log('1️⃣ Переход в Гильдию...');
            const guildButton = await window.BotUtils.waitForElement('div.footer-button .footer-button-text', 'Гильдия', 5000);
            if (guildButton) {
                guildButton.click();
                await window.BotUtils.delay(1000);
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
                await window.BotUtils.delay(1000);
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
            for (let i = 0; i < itemCards.length; i++) {
                const item = itemCards[i];
                console.log(`\n📦 === АНАЛИЗ ПРЕДМЕТА ${i + 1}/${itemCards.length} ===`);
                
                try {
                    // Кликаем на предмет
                    item.click();
                    await window.BotUtils.delay(500);

                    // Ждем появления диалога
                    const dialog = await window.BotUtils.waitForElement('app-dialog-container.dialog-container-item', null, 3000);
                    if (!dialog) {
                        console.log('⚠️ Диалог предмета не открылся, пропускаем');
                        continue;
                    }

                    // Извлекаем информацию о предмете
                    const itemInfo = this.extractItemInfo(dialog);
                    this.logItemInfo(itemInfo, i + 1);
                    
                    analyzedCount++;

                    // Закрываем диалог
                    const closeButton = dialog.querySelector('tui-icon.svg-icon[style*="close.svg"]');
                    if (closeButton) {
                        closeButton.click();
                        await window.BotUtils.delay(300);
                    }

                } catch (error) {
                    console.error(`❌ Ошибка при анализе предмета ${i + 1}:`, error);
                }
            }

            console.log(`\n🎉 === АНАЛИЗ ЗАВЕРШЕН ===`);
            console.log(`📊 Проанализировано предметов: ${analyzedCount}/${itemCards.length}`);

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
    }
}; 