// Модуль основной игровой логики
window.BotGameLogic = {
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
     * Создание кнопок боссов (упрощенная версия)
     */
    async createBossButtons() {
        // Упрощенная версия кнопок боссов
        console.log('Кнопки боссов будут добавлены в следующих версиях');
    },

    /**
     * Фарм босса ВТ
     */
    async bossFarmLoopVT(abortSignal) {
        const polygons = [
            "-1.5,8.25 16.5,-2.25 16.5,-23.25 -1.5,-33.75 -19.5,-23.25 -19.5,-2.25 -1.5,8.25",
            "18,-25.5 36,-36 36,-57 18,-67.5 0,-57 0,-36 18,-25.5",
            "37.5,-59.25 55.5,-69.75 55.5,-90.75 37.5,-101.25 19.5,-90.75 19.5,-69.75 37.5,-59.25",
            "57,-93 75,-103.5 75,-124.5 57,-135 39,-124.5 39,-103.5 57,-93"
        ];
        const bossPolygonPoints = polygons[polygons.length - 1];

        while (true) {
            if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
            
            await window.BotUtils.clickByTextContent('Сражения', 5000);
            await window.BotUtils.clickByLocationName('Зеленые топи', 5000);

            for (let i = 0; i < polygons.length - 1; ++i) {
                const polygonPoints = polygons[i];
                const polygon = await window.BotUtils.waitFor(() => {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                    return document.querySelector(`polygon.hexagon[points="${polygonPoints}"]`);
                }, 200, 10000);
                
                if (!polygon) throw new Error(`Не найден полигон для босса: ${polygonPoints}`);
                
                window.BotNavigation.clickPolygon(polygon);
                await window.BotUtils.delay(300);
                
                const goBtn = await window.BotUtils.waitFor(() => {
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
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
                    if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                    const current = document.querySelector('g.hex-box.current polygon.hexagon');
                    return current && current.getAttribute('points') === polygonPoints;
                }, 200, 10000);
            }
            
            if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');

            // Переход на последний полигон (босс)
            const bossPolygon = await window.BotUtils.waitFor(() => {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
                return document.querySelector(`polygon.hexagon[points="${bossPolygonPoints}"]`);
            }, 200, 10000);
            
            window.BotNavigation.clickPolygon(bossPolygon);
            await window.BotUtils.delay(300);

            const goBtn = await window.BotUtils.waitFor(() => {
                if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
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
                if (abortSignal && abortSignal.aborted) throw new Error('bossFarmLoopVT aborted');
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