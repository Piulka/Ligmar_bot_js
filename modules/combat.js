// Модуль боевой системы
window.BotCombat = {
    async useSkill(skill) {
        const skillButton = document.querySelector(`div.action-image[style*="${skill}"]`);
        if (skillButton) {
            skillButton.click();
            await window.BotUtils.delay(100);
        }
    },

    async useSkills() {
        const skills = window.BotConfig.CLASS_SKILLS[window.BotConfig.selectedClass];
        if (!skills) return;

        if (skills.attack && skills.attack.length) {
            for (const skill of skills.attack) {
                await this.useSkill(skill);
                await window.BotUtils.delay(100);
            }
        }
    },

    async checkManaAndHealth() {
        // Проверка здоровья
        const healthElement = document.querySelector('app-general-stat.profile-health .stats-line');
        if (healthElement) {
            const healthPercentage = parseFloat(healthElement.style.transform.match(/-?\d+(\.\d+)?/)[0]);
            if (healthPercentage <= -20) {
                await this.useHealthPotion();
                await window.BotUtils.delay(100);
                
                if (window.BotConfig.CLASS_SKILLS[window.BotConfig.selectedClass]?.heal) {
                    await this.useSkill(window.BotConfig.CLASS_SKILLS[window.BotConfig.selectedClass].heal);
                    await window.BotUtils.delay(100);
                }
            }
        }

        // Проверка маны
        if (window.BotConfig.CLASS_SKILLS[window.BotConfig.selectedClass]?.attack || 
            window.BotConfig.CLASS_SKILLS[window.BotConfig.selectedClass]?.heal || 
            window.BotConfig.CLASS_SKILLS[window.BotConfig.selectedClass]?.buff) {
            const manaElement = document.querySelector('app-general-stat.profile-mana .stats-line-mana');
            if (manaElement) {
                const manaPercentage = parseFloat(manaElement.style.transform.match(/-?\d+(\.\d+)?/)[0]);
                if (manaPercentage <= -50) {
                    await this.useManaPotion();
                    await window.BotUtils.delay(100);
                }
            }
        }
    },

    async useHealthPotion() {
        const healthPotionButtons = ['potion-health-epic', 'potion-health-rare', 'potion-health-common'];
        
        for (const potion of healthPotionButtons) {
            const potionButton = document.querySelector(`app-action-button .action-image[style*="${potion}"]`);
            if (potionButton) {
                potionButton.click();
                await window.BotUtils.delay(100);
                return true;
            }
        }
        return false;
    },

    async useManaPotion() {
        const manaPotionButtons = ['potion-mana-epic', 'potion-mana-rare', 'potion-mana-common'];
        
        for (const potion of manaPotionButtons) {
            const potionButton = document.querySelector(`app-action-button .action-image[style*="${potion}"]`);
            if (potionButton) {
                potionButton.click();
                await window.BotUtils.delay(100);
                return true;
            }
        }
        return false;
    },

    /**
     * Проверка и активация баффов
     */
    async checkAndActivateDefenseBuff() {
        const skills = window.BotConfig.CLASS_SKILLS[window.BotConfig.selectedClass];
        if (!skills || !skills.buff) return;
        
        try {
            // Для лучника проверяем оба баффа
            if (window.BotConfig.selectedClass === 'Лучник') {
                // Проверяем первый бафф (увеличение магического урона)
                const magicDamageBuff = document.querySelector('tui-icon.svg-icon[style*="magicGearDamageArcher.svg"]');
                if (!magicDamageBuff && skills.buff[0]) {
                    await this.useSkill(skills.buff[0].skill);
                    await window.BotUtils.delay(300);
                }
                
                // Проверяем второй бафф (увеличение уклонения)
                const evasionBuff = document.querySelector('tui-icon.svg-icon[style*="upEvasionArcher.svg"]');
                if (!evasionBuff && skills.buff[1]) {
                    await this.useSkill(skills.buff[1].skill);
                    await window.BotUtils.delay(300);
                }
            } 
            // Для воина оставляем старую логику
            else if (window.BotConfig.selectedClass === 'Воин') {
                const defenseIcon = document.querySelector('tui-icon.svg-icon[style*="upDefenseWarrior.svg"]');
                if (!defenseIcon && skills.buff) {
                    await this.useSkill(skills.buff);
                    await window.BotUtils.delay(100);
                }
            }
        } catch(error) {
            console.error('Ошибка при активации баффа:', error);
        }
    },

    async waitForEnemy(timeout = 7000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (!window.BotConfig.isScriptRunning) return false;

            const enemyIcon = document.querySelector('app-icon.profile-class tui-icon[style*="mob-class-"]');
            if (enemyIcon) {
                await window.BotUtils.delay(100);
                return true;
            }

            await window.BotUtils.delay(100);
        }
        return false;
    },

    async fightEnemies(isChampionHexagon = false) {
        window.BotConfig.vipStatus = window.BotUtils.autoDetectVipStatus();
        window.BotConfig.selectedClass = window.BotUtils.detectPlayerClass();
        
        let initialEnemyCount = 0;
        await window.BotNavigation.checkBattleMembersAndClickMap();

        const enemiesCountElement = document.querySelector('div.battle-bar-enemies-value');
        if (enemiesCountElement) {
            initialEnemyCount = parseInt(enemiesCountElement.textContent.trim(), 10) || 0;
        }

        if (window.BotConfig.selectedClass === 'Лучник') {
            let hasChampion = false;
            const currentHexagon = document.querySelector('g.hex-box.current');
            if (currentHexagon) {
                hasChampion = !!currentHexagon.querySelector('use[href="#champion"], use[xlink\\:href="#champion"]');
            }
            if (initialEnemyCount >= 2 || hasChampion) {
                await this.useSkill(window.BotConfig.CLASS_SKILLS['Лучник'].multitarget);
                await window.BotUtils.delay(100);
            }
        }

        if (isChampionHexagon && window.BotConfig.selectedClass === 'Лучник' && 
            window.BotConfig.CLASS_SKILLS[window.BotConfig.selectedClass].championSkill) {
            await this.useSkill(window.BotConfig.CLASS_SKILLS[window.BotConfig.selectedClass].championSkill);
            await window.BotUtils.delay(1500);
        }

        while (window.BotConfig.isScriptRunning) {
            if (window.BotConfig.vipStatus === 'Не VIP') {
                const enemiesCountElement = document.querySelector('div.battle-bar-enemies-value');
                if (enemiesCountElement && enemiesCountElement.textContent.trim() === '0') {
                    break;
                }

                let needSwitch = false;
                const enemyCard = document.querySelector('app-profile-card.target');
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
                }
                
                if ((!enemyCard || needSwitch)) {
                    const switchBtn = document.querySelector('div.button-icon-content tui-icon.svg-icon[style*="switch.svg"]');
                    if (switchBtn) {
                        switchBtn.closest('div.button-icon-content').click();
                        await window.BotUtils.delay(300);
                        continue;
                    } else {
                        await window.BotUtils.delay(300);
                        continue;
                    }
                }
            }

            const enemyIcon = document.querySelector('app-icon.profile-class tui-icon[style*="mob-class-"]');
            await window.BotNavigation.checkAndReturnToCity();
            if (!enemyIcon) break;

            const enemiesCountElement2 = document.querySelector('div.battle-bar-enemies-value');
            if (enemiesCountElement2 && enemiesCountElement2.textContent.trim() === '0') {
                break;
            }

            await this.checkManaAndHealth();
            await window.BotUtils.delay(100);
            await this.checkAndActivateDefenseBuff();
            await window.BotUtils.delay(100);
            await this.useSkills();
            await window.BotUtils.delay(100);
        }

        // Обновляем статистику
        if (window.BotStatistics) {
            window.BotStatistics.stats.mobsKilled += initialEnemyCount;
            if (isChampionHexagon) {
                window.BotStatistics.stats.championsKilled++;
            }
            window.BotStatistics.updateStatisticsDisplay();
        }

        const isSpecial = await window.BotNavigation.isSpecialHexagon();
        if (isSpecial) {
            await window.BotUtils.delay(5000);
        }
    }
}; 