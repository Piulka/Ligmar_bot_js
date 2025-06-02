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
     * Создание кнопок боссов
     */
    async createBossButtons() {
        // Удаляем старые кнопки, если есть
        const oldBossVTBtn = document.getElementById('boss-vt-button');
        const oldBossCHTBtn = document.getElementById('boss-cht-button');
        if (oldBossVTBtn) oldBossVTBtn.remove();
        if (oldBossCHTBtn) oldBossCHTBtn.remove();

        // Проверяем, не созданы ли уже новые кнопки
        if (document.getElementById('boss-vt-button') || document.getElementById('boss-cht-button')) return;

        // Ждём появления системного хедера
        let header = document.querySelector('app-system-header .header-relative');
        for (let i = 0; i < 30 && !header; i++) {
            await window.BotUtils.delay(100);
            header = document.querySelector('app-system-header .header-relative');
        }
        if (!header) return;

        // Находим или создаём контейнер для кнопок по центру
        let centerContainer = header.querySelector('.header-center-controls');
        if (!centerContainer) {
            centerContainer = document.createElement('div');
            centerContainer.className = 'header-center-controls';
            Object.assign(centerContainer.style, {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                height: 'auto',
                zIndex: '1001'
            });
            header.appendChild(centerContainer);
        }

        // Размеры кнопок
        const btnWidth = '40px';
        const btnHeight = '40px';
        const btnFontSize = '11px';

        // --- Кнопка БОСС ВТ ---
        const bossVTBtn = document.createElement('button');
        bossVTBtn.id = 'boss-vt-button';
        bossVTBtn.className = 'control-button-boss-vt';
        Object.assign(bossVTBtn.style, {
            width: btnWidth,
            height: btnHeight,
            background: 'radial-gradient(circle, rgba(40,15,15,0.95) 0%, rgba(20,8,8,0.98) 100%)',
            color: '#FFD700',
            border: '2px solid transparent',
            borderImage: 'linear-gradient(135deg, #FFD700, #B8860B, #FFD700) 1',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: btnFontSize,
            fontWeight: 'bold',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(255, 69, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            letterSpacing: '0.5px',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            userSelect: 'none',
            outline: 'none',
            margin: '0',
            position: 'relative',
            overflow: 'hidden'
        });

        // Создаем внутренний градиент для VT
        const innerGlowVT = document.createElement('div');
        Object.assign(innerGlowVT.style, {
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            borderRadius: '10px',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 69, 0, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
        });
        bossVTBtn.appendChild(innerGlowVT);

        // Контейнер для контента VT
        const contentVT = document.createElement('div');
        Object.assign(contentVT.style, {
            position: 'relative',
            zIndex: '2',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        });

        const iconVT = document.createElement('span');
        iconVT.textContent = '🔥';
        iconVT.style.fontSize = '16px';
        iconVT.style.lineHeight = '1';

        contentVT.appendChild(iconVT);
        bossVTBtn.appendChild(contentVT);

        // События для кнопки ВТ
        bossVTBtn.addEventListener('mouseenter', () => {
            bossVTBtn.style.transform = 'scale(1.05)';
            bossVTBtn.style.boxShadow = '0 0 20px rgba(255, 69, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.2)';
        });
        
        bossVTBtn.addEventListener('mouseleave', () => {
            bossVTBtn.style.transform = 'scale(1)';
            bossVTBtn.style.boxShadow = '0 0 15px rgba(255, 69, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.1)';
        });

        bossVTBtn.addEventListener('mousedown', () => {
            bossVTBtn.style.transform = 'scale(0.95)';
        });

        bossVTBtn.addEventListener('mouseup', () => {
            bossVTBtn.style.transform = 'scale(1.05)';
        });

        bossVTBtn.addEventListener('click', async () => {
            if (!this.vtAbortController) {
                // Деактивируем все другие кнопки
                if (window.BotUI && window.BotUI.deactivateAllButtons) {
                    window.BotUI.deactivateAllButtons();
                }
                
                this.vtAbortController = new AbortController();
                iconVT.textContent = '⏸';
                
                // Добавляем визуальную индикацию активности
                bossVTBtn.style.background = 'radial-gradient(circle, rgba(60,25,25,0.95) 0%, rgba(30,12,12,0.98) 100%)';
                bossVTBtn.style.boxShadow = '0 0 25px rgba(255, 69, 0, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.2)';
                
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
                    iconVT.textContent = '🔥';
                    
                    // Возвращаем обычный стиль
                    bossVTBtn.style.background = 'radial-gradient(circle, rgba(40,15,15,0.95) 0%, rgba(20,8,8,0.98) 100%)';
                    bossVTBtn.style.boxShadow = '0 0 15px rgba(255, 69, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.1)';
                }
            } else {
                this.vtAbortController.abort();
                this.vtAbortController = null;
                iconVT.textContent = '🔥';
                
                // Возвращаем обычный стиль
                bossVTBtn.style.background = 'radial-gradient(circle, rgba(40,15,15,0.95) 0%, rgba(20,8,8,0.98) 100%)';
                bossVTBtn.style.boxShadow = '0 0 15px rgba(255, 69, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.1)';
            }
        });

        // --- Кнопка БОСС ЧТ ---
        const bossCHTBtn = document.createElement('button');
        bossCHTBtn.id = 'boss-cht-button';
        bossCHTBtn.className = 'control-button-boss-cht';
        Object.assign(bossCHTBtn.style, {
            width: btnWidth,
            height: btnHeight,
            background: 'radial-gradient(circle, rgba(25,15,40,0.95) 0%, rgba(15,8,25,0.98) 100%)',
            color: '#FFD700',
            border: '2px solid transparent',
            borderImage: 'linear-gradient(135deg, #FFD700, #B8860B, #FFD700) 1',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: btnFontSize,
            fontWeight: 'bold',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(138, 43, 226, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            letterSpacing: '0.5px',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            userSelect: 'none',
            outline: 'none',
            margin: '0',
            position: 'relative',
            overflow: 'hidden'
        });

        // Создаем внутренний градиент для ЧТ
        const innerGlowCHT = document.createElement('div');
        Object.assign(innerGlowCHT.style, {
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            borderRadius: '10px',
            background: 'radial-gradient(circle at 30% 30%, rgba(138, 43, 226, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
        });
        bossCHTBtn.appendChild(innerGlowCHT);

        // Контейнер для контента ЧТ
        const contentCHT = document.createElement('div');
        Object.assign(contentCHT.style, {
            position: 'relative',
            zIndex: '2',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        });

        const iconCHT = document.createElement('span');
        iconCHT.textContent = '⚡';
        iconCHT.style.fontSize = '16px';
        iconCHT.style.lineHeight = '1';

        contentCHT.appendChild(iconCHT);
        bossCHTBtn.appendChild(contentCHT);

        // События для кнопки ЧТ
        bossCHTBtn.addEventListener('mouseenter', () => {
            bossCHTBtn.style.transform = 'scale(1.05)';
            bossCHTBtn.style.boxShadow = '0 0 20px rgba(255, 69, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.2)';
        });
        
        bossCHTBtn.addEventListener('mouseleave', () => {
            bossCHTBtn.style.transform = 'scale(1)';
            bossCHTBtn.style.boxShadow = '0 0 15px rgba(255, 69, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.1)';
        });

        bossCHTBtn.addEventListener('mousedown', () => {
            bossCHTBtn.style.transform = 'scale(0.95)';
        });

        bossCHTBtn.addEventListener('mouseup', () => {
            bossCHTBtn.style.transform = 'scale(1.05)';
        });

        bossCHTBtn.addEventListener('click', async () => {
            if (!this.chtAbortController) {
                // Деактивируем все другие кнопки
                if (window.BotUI && window.BotUI.deactivateAllButtons) {
                    window.BotUI.deactivateAllButtons();
                }
                
                this.chtAbortController = new AbortController();
                iconCHT.textContent = '⏸';
                
                // Добавляем визуальную индикацию активности
                bossCHTBtn.style.background = 'radial-gradient(circle, rgba(45,25,60,0.95) 0%, rgba(25,15,40,0.98) 100%)';
                bossCHTBtn.style.boxShadow = '0 0 25px rgba(138, 43, 226, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.2)';
                
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
                    iconCHT.textContent = '⚡';
                    
                    // Возвращаем обычный стиль
                    bossCHTBtn.style.background = 'radial-gradient(circle, rgba(25,15,40,0.95) 0%, rgba(15,8,25,0.98) 100%)';
                    bossCHTBtn.style.boxShadow = '0 0 15px rgba(138, 43, 226, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.1)';
                }
            } else {
                this.chtAbortController.abort();
                this.chtAbortController = null;
                iconCHT.textContent = '⚡';
                
                // Возвращаем обычный стиль
                bossCHTBtn.style.background = 'radial-gradient(circle, rgba(25,15,40,0.95) 0%, rgba(15,8,25,0.98) 100%)';
                bossCHTBtn.style.boxShadow = '0 0 15px rgba(138, 43, 226, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.1)';
            }
        });

        // Добавляем кнопки в контейнер
        if (!centerContainer.contains(bossVTBtn)) {
            centerContainer.appendChild(bossVTBtn);
        }
        if (!centerContainer.contains(bossCHTBtn)) {
            centerContainer.appendChild(bossCHTBtn);
        }
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
            
            console.log('🔥 Переход в локацию для босса ВТ...');
            await window.BotUtils.clickByTextContent('Сражения', 5000);
            await window.BotUtils.clickByLocationName('Зеленые топи', 5000);

            for (let i = 0; i < polygons.length - 1; ++i) {
                const polygonPoints = polygons[i];
                console.log(`🔥 Переход на полигон ${i + 1}/${polygons.length - 1}: ${polygonPoints}`);
                
                const polygon = await window.BotUtils.waitFor(() => {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                    return document.querySelector(`polygon.hexagon[points="${polygonPoints}"]`);
                }, 200, 10000);
                
                if (!polygon) {
                    console.error(`❌ Не найден полигон для босса: ${polygonPoints}`);
                    throw new Error(`Не найден полигон для босса: ${polygonPoints}`);
                }
                
                console.log(`🔥 Кликаю на полигон ${i + 1}...`);
                window.BotNavigation.clickPolygon(polygon);
                await window.BotUtils.delay(300);
                
                console.log(`🔥 Ищу кнопку "Перейти"...`);
                const goBtn = await window.BotUtils.waitFor(() => {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                    return Array.from(document.querySelectorAll('div.button-content'))
                        .find(btn => btn.textContent.trim() === 'Перейти');
                }, 200, 10000);
                
                if (goBtn) {
                    console.log(`🔥 Нажимаю "Перейти" для полигона ${i + 1}...`);
                    goBtn.click();
                    await window.BotUtils.delay(500);
                } else {
                    console.error('❌ Кнопка "Перейти" не найдена');
                    throw new Error('Кнопка "Перейти" не найдена');
                }
                
                console.log(`🔥 Жду подтверждения перехода на полигон ${i + 1}...`);
                await window.BotUtils.waitFor(() => {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                    const current = document.querySelector('g.hex-box.current polygon.hexagon');
                    return current && current.getAttribute('points') === polygonPoints;
                }, 200, 10000);
                console.log(`✅ Переход на полигон ${i + 1} завершен`);
            }
            
            if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');

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

            console.log('🔥 Ищу кнопку "Перейти" к боссу...');
            const goBtn = await window.BotUtils.waitFor(() => {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                return Array.from(document.querySelectorAll('div.button-content'))
                    .find(btn => btn.textContent.trim() === 'Перейти');
            }, 200, 10000);
            
            if (goBtn) {
                console.log('🔥 Перехожу к боссу ВТ...');
                goBtn.click();
                await window.BotUtils.delay(500);
            } else {
                console.error('❌ Кнопка "Перейти" к боссу не найдена');
                throw new Error('Кнопка "Перейти" не найдена');
            }

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
            
            await window.BotUtils.clickByTextContent('Сражения', 5000);
            await window.BotUtils.clickByLocationName('Зеленые топи', 5000);

            for (let i = 0; i < polygons.length - 1; ++i) {
                const polygonPoints = polygons[i];
                const polygon = await window.BotUtils.waitFor(() => {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');
                    return document.querySelector(`polygon.hexagon[points="${polygonPoints}"]`);
                }, 200, 10000);
                
                if (!polygon) throw new Error(`Не найден полигон для босса: ${polygonPoints}`);
                
                window.BotNavigation.clickPolygon(polygon);
                await window.BotUtils.delay(300);
                
                const goBtn = await window.BotUtils.waitFor(() => {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');
                    return Array.from(document.querySelectorAll('div.button-content'))
                        .find(btn => btn.textContent.trim() === 'Перейти');
                }, 200, 10000);
                
                if (goBtn) {
                    goBtn.click();
                    await window.BotUtils.delay(500);
                } else {
                    throw new Error('Кнопка "Перейти" не найдена');
                }
                
                await window.BotUtils.waitFor(() => {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');
                    const current = document.querySelector('g.hex-box.current polygon.hexagon');
                    return current && current.getAttribute('points') === polygonPoints;
                }, 200, 10000);
            }
            
            if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');

            // Переход на последний полигон (босс)
            const bossPolygon = await window.BotUtils.waitFor(() => {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');
                return document.querySelector(`polygon.hexagon[points="${bossPolygonPoints}"]`);
            }, 200, 10000);
            
            window.BotNavigation.clickPolygon(bossPolygon);
            await window.BotUtils.delay(300);

            const goBtn = await window.BotUtils.waitFor(() => {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopCHT aborted');
                return Array.from(document.querySelectorAll('div.button-content'))
                    .find(btn => btn.textContent.trim() === 'Перейти');
            }, 200, 10000);
            
            if (goBtn) {
                goBtn.click();
                await window.BotUtils.delay(500);
            } else {
                throw new Error('Кнопка "Перейти" не найдена');
            }

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
    }
}; 