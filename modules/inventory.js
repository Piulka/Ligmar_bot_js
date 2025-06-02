// Модуль управления инвентарем
window.BotInventory = {
    async handleFullBackpack() {
        const backpackIcon = document.querySelector('app-icon.header-backpack-icon tui-icon[style*="backpack.svg"]');
        if (!backpackIcon) return;

        const isBackpackFull = document.querySelector('div.backpack-capacity-danger') || 
                             backpackIcon.closest('app-icon').classList.contains('backpack-full');
        
        if (!isBackpackFull) return;

        console.log('Инвентарь переполнен, начинаем обработку...');

        try {
            const portalButton = await window.BotUtils.waitForElement('app-button-icon[data-appearance="primary"] .button-icon-text', 'Портал', 5000);
            if (portalButton) {
                portalButton.click();
                await window.BotUtils.delay(10000);

                const characterButton = await window.BotUtils.waitForElement('div.footer-button-content .footer-button-text', 'Персонаж', 5000);
                if (characterButton) {
                    characterButton.click();
                    await window.BotUtils.delay(100);

                    const backpackTab = await window.BotUtils.waitForElement('div.tab-content', 'Рюкзак', 5000);
                    if (backpackTab) {
                        backpackTab.click();
                        await window.BotUtils.delay(100);

                        if (window.BotConfig.sellItemsSetting === 'Не продавать вещи') {
                            console.log('Режим "Не продавать вещи" - скрипт приостановлен');
                            const controlButton = document.getElementById('control-button');
                            if (controlButton) {
                                controlButton.click();
                            }
                            alert('Рюкзак полон! Скрипт приостановлен. Режим "Не продавать вещи"');
                            return;
                        }
                        
                        await this.processBackpackItems();
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка при обработке переполненного инвентаря:', error);
        }
    },

    async processBackpackItems() {
        const equipmentGroup = Array.from(document.querySelectorAll('app-items-group')).find(group => {
            const nameElement = group.querySelector('.items-group-name');
            return nameElement && nameElement.textContent.trim() === 'Снаряжение';
        });

        if (!equipmentGroup) {
            console.error('Вкладка "Снаряжение" не найдена');
            return;
        }

        const items = equipmentGroup.querySelectorAll('app-item-card.backpack-item');
        console.log(`Найдено ${items.length} предметов`);

        let storedCount = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            item.click();
            await window.BotUtils.delay(300);

            const dialog = document.querySelector('app-dialog-container.dialog-container-item');
            if (!dialog) continue;

            let shouldStore = false;
            
            if (window.BotConfig.dropFilters.ancient) shouldStore = shouldStore || this.checkAncientItem(dialog);
            if (window.BotConfig.dropFilters.pmaVa) shouldStore = shouldStore || this.checkPmaVaItem(dialog);
            if (window.BotConfig.dropFilters.epicStats) shouldStore = shouldStore || this.checkEpicItemWithStats(dialog);
            if (window.BotConfig.dropFilters.highGearScore) shouldStore = shouldStore || this.checkHighGearScore(dialog);
            if (window.BotConfig.dropFilters.custom) shouldStore = shouldStore || this.checkDropCustomRules(dialog);

            if (shouldStore) {
                const chestButton = dialog.querySelector('div.put-in-chest .button-content');
                if (chestButton && chestButton.textContent.trim() === 'В сундук') {
                    chestButton.click();
                    storedCount++;
                    await window.BotUtils.delay(300);
                }
            }

            const closeBtn = dialog.querySelector('tui-icon.svg-icon[style*="close.svg"]');
            if (closeBtn) {
                closeBtn.click();
                await window.BotUtils.delay(100);
            }
        }

        console.log(`Сохранено предметов: ${storedCount}, продано: ${items.length - storedCount}`);

        if (window.BotConfig.sellItemsSetting === 'Продавать вещи') {
            await this.navigateToSellItems();
        }
    },

    checkAncientItem(dialog) {
        const percentElements = [
            dialog.querySelector('.item-stats'),
            dialog.querySelector('.magic-prop-percent'),
            dialog.querySelector('.item-percent-value')
        ].filter(el => el);
        
        for (const element of percentElements) {
            const text = element.textContent.trim();
            if (text.match(/[>(]?\s*\d{3,}\s*%[<)]?/)) {
                const percentValue = parseInt(text.replace(/\D/g, ''), 10);
                if (percentValue > 100) {
                    return true;
                }
            }
        }
        return false;
    },

    checkPmaVaItem(dialog) {
        const stats = dialog.querySelectorAll('.magic-prop-name');
        for (const stat of stats) {
            if (stat.textContent.includes('Пауза между атаками') || 
                stat.textContent.includes('Время активации')) {
                return true;
            }
        }
        return false;
    },

    checkEpicItemWithStats(dialog) {
        const qualityElement = dialog.querySelector('.item-quality');
        if (!qualityElement || !qualityElement.textContent.includes('Эпич')) {
            return false;
        }

        const statsElements = dialog.querySelectorAll('.magic-prop-name');
        const requiredStats = ['Сила', 'Ловкость', 'Уклонение', 'Скрытность', 'Максимальный урон', 'Физ. атака'];

        let matchingStatsCount = 0;
        statsElements.forEach(statElement => {
            const statText = statElement.textContent.trim();
            if (requiredStats.some(required => statText.includes(required))) {
                matchingStatsCount++;
            }
        });

        return matchingStatsCount >= 3;
    },

    checkHighGearScore(dialog) {
        const gearScore = this.getGearScore(dialog);
        return gearScore > window.BotConfig.dropMinGearScore;
    },

    checkDropCustomRules(dialog) {
        // Проверяем качество
        const qualityElement = dialog.querySelector('.item-quality');
        if (!qualityElement) return false;
        
        const quality = qualityElement.textContent.trim();
        if (window.BotConfig.dropQuality && quality !== window.BotConfig.dropQuality) {
            return false;
        }

        // Проверяем тип вещи
        const typeElement = dialog.querySelector('.item-type');
        if (typeElement && window.BotConfig.dropSelectedTypes.length > 0) {
            const itemType = typeElement.textContent.trim();
            if (!window.BotConfig.dropSelectedTypes.some(type => itemType.includes(type))) {
                return false;
            }
        }

        // Проверяем статы
        const statsElements = dialog.querySelectorAll('.magic-prop-name');
        if (statsElements.length === 0) return false;

        let matchingStatsCount = 0;
        statsElements.forEach(statElement => {
            const statText = statElement.textContent.trim();
            if (window.BotConfig.dropSelectedStats.some(stat => statText.includes(stat))) {
                matchingStatsCount++;
            }
        });

        // Проверяем минимальное количество статов
        if (matchingStatsCount < window.BotConfig.dropStatsCount) {
            return false;
        }

        // Проверяем минимальный ГС
        const gsElement = dialog.querySelector('.gear-score-value');
        if (gsElement) {
            const gearScore = parseInt(gsElement.textContent.replace(/\D/g, ''), 10);
            if (gearScore < window.BotConfig.dropMinGearScore) {
                return false;
            }
        }

        return true;
    },

    async navigateToSellItems() {
        try {
            const townButton = await window.BotUtils.waitForElement('div.footer-button-content .footer-button-text', 'Город', 5000);
            if (townButton) {
                townButton.click();
                await window.BotUtils.delay(100);

                const buildingsButton = await window.BotUtils.waitForElement('div.button-content', 'Строения', 5000);
                if (buildingsButton) {
                    buildingsButton.click();
                    await window.BotUtils.delay(100);

                    const shopButton = await window.BotUtils.waitForElement('div.location-name', 'Торговая лавка', 5000);
                    if (shopButton) {
                        shopButton.click();
                        await window.BotUtils.delay(100);

                        const sellButton = await window.BotUtils.waitForElement('div.button-content', 'Продать снаряжение', 5000);
                        if (sellButton) {
                            sellButton.click();
                            await window.BotUtils.delay(100);

                            const confirmSellButton = await window.BotUtils.waitForElement('div.button-content', 'Да, продать', 5000);
                            if (confirmSellButton) {
                                confirmSellButton.click();
                                await window.BotUtils.delay(100);
                            }
                        }
                    }
                }

                const returnToBattleButton = await window.BotUtils.waitForElement('div.button-content', 'Вернуться в бой', 5000);
                if (returnToBattleButton) {
                    returnToBattleButton.click();
                    await window.BotUtils.delay(100);
                }
            }
        } catch (error) {
            console.error('Ошибка при продаже предметов:', error);
        }
    },

    async claimRewardButton(timeout = 5000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const rewardBtn = Array.from(document.querySelectorAll('div.button-content'))
                .find(btn => btn.textContent.trim() === 'Забрать награду');
            if (rewardBtn && rewardBtn.offsetParent !== null) {
                rewardBtn.click();
                await window.BotUtils.delay(200);
                console.log('Кнопка "Забрать награду" нажата');
                return true;
            }
            await window.BotUtils.delay(200);
        }
        return false;
    },

    /**
     * Получение количества предметов в рюкзаке
     */
    async getBackpackItemCount() {
        const equipmentGroup = Array.from(document.querySelectorAll('app-items-group')).find(group => {
            const nameElement = group.querySelector('.items-group-name');
            return nameElement && nameElement.textContent.trim() === 'Снаряжение';
        });

        if (!equipmentGroup) {
            console.error('Вкладка "Снаряжение" не найдена');
            return 0;
        }

        const items = equipmentGroup.querySelectorAll('app-item-card.backpack-item');
        return items.length;
    },

    showDropSettingsModal() {
        const existingModal = document.getElementById('drop-settings-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = this.createDropModal();
        const content = this.createDropModalContent();
        
        // Создаем чекбоксы для фильтров
        const filters = [
            { key: 'ancient', label: 'Древние предметы' },
            { key: 'pmaVa', label: 'ПМА или ВА' },
            { key: 'epicStats', label: 'Топ статы для лучника' },
            { key: 'highGearScore', label: `ГС > ${window.BotConfig.dropMinGearScore}` },
            { key: 'custom', label: 'Кастомные настройки' }
        ];

        // ... остальные части функции ...
    },

    createDropModal() {
        const modal = document.createElement('div');
        modal.id = 'drop-settings-modal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = 'var(--black-dark)';
        modal.style.border = '2px solid var(--gold-base)';
        modal.style.borderRadius = '12px';
        modal.style.padding = '18px 20px 16px 20px';
        modal.style.zIndex = '2000';
        modal.style.color = 'var(--white)';
        modal.style.fontFamily = 'Segoe UI, Arial, sans-serif';
        modal.style.minWidth = '340px';
        modal.style.boxShadow = '0 8px 32px 0 rgba(0,0,0,0.25)';

        return modal;
    },

    createDropModalContent() {
        // ... implementation of createDropModalContent method ...
    },

    getGearScore(dialog) {
        const gsElement = dialog.querySelector('.gear-score-value');
        if (!gsElement) return 0;

        const gearScore = parseInt(gsElement.textContent.replace(/\D/g, ''), 10);
        return gearScore;
    }
}; 