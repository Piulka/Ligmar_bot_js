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

                        if (window.BotConfig.sellItemsSetting === 'Не продавать') {
                            console.log('Режим "Не продавать" - скрипт приостановлен');
                            window.BotConfig.isScriptRunning = false;
                            const controlButton = document.getElementById('control-button');
                            if (controlButton) {
                                const iconSpan = controlButton.querySelector('span');
                                if (iconSpan) {
                                    iconSpan.textContent = '▶';
                                }
                            }
                            alert('Рюкзак полон! Скрипт приостановлен. Режим "Не продавать"');
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

        if (window.BotConfig.sellItemsSetting === 'Продавать') {
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

        const modal = document.createElement('div');
        modal.id = 'drop-settings-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0, 0, 0, 0.7)';
        modal.style.zIndex = '2000';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';

        const content = document.createElement('div');
        content.style.background = 'var(--black-dark)';
        content.style.border = '2px solid var(--gold-base)';
        content.style.borderRadius = '12px';
        content.style.padding = '18px 20px 16px 20px';
        content.style.color = 'var(--white)';
        content.style.fontFamily = 'Segoe UI, Arial, sans-serif';
        content.style.minWidth = '340px';
        content.style.boxShadow = '0 8px 32px 0 rgba(0,0,0,0.25)';

        // Заголовок
        const title = document.createElement('div');
        title.textContent = 'Настройки дропа';
        title.style.fontSize = '17px';
        title.style.fontWeight = 'bold';
        title.style.color = 'var(--gold-base)';
        title.style.marginBottom = '12px';
        title.style.textAlign = 'center';
        content.appendChild(title);

        // Чекбоксы для фильтров
        const filters = [
            { key: 'ancient', label: 'Древние предметы' },
            { key: 'pmaVa', label: 'ПМА или ВА' },
            { key: 'epicStats', label: 'Топ статы для лучника' },
            { key: 'highGearScore', label: `ГС > ${window.BotConfig.dropMinGearScore}` },
            { key: 'custom', label: 'Кастомные настройки' }
        ];

        filters.forEach(f => {
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.cursor = 'pointer';
            label.style.fontSize = '13px';
            label.style.marginBottom = '4px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = window.BotConfig.dropFilters[f.key];
            checkbox.style.marginRight = '6px';
            checkbox.onchange = () => {
                window.BotConfig.dropFilters[f.key] = checkbox.checked;
                if (f.key === 'custom') {
                    customSettingsBlock.style.display = checkbox.checked ? '' : 'none';
                }
            };

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(f.label));
            content.appendChild(label);
        });

        // Кастомные настройки
        const customSettingsBlock = document.createElement('div');
        customSettingsBlock.style.margin = '10px 0 0 0';
        customSettingsBlock.style.padding = '10px 0 0 0';
        customSettingsBlock.style.borderTop = '1px solid var(--gold-base)';
        customSettingsBlock.style.display = window.BotConfig.dropFilters.custom ? '' : 'none';

        // Выбор типов вещей
        const typesLabel = document.createElement('div');
        typesLabel.textContent = 'Типы вещей:';
        typesLabel.style.fontWeight = '600';
        typesLabel.style.marginBottom = '4px';
        customSettingsBlock.appendChild(typesLabel);

        const typesContainer = document.createElement('div');
        typesContainer.style.display = 'flex';
        typesContainer.style.flexWrap = 'wrap';
        typesContainer.style.gap = '8px';
        typesContainer.style.marginBottom = '10px';

        const allTypes = ['Оружие', 'Плечи', 'Шея', 'Пояс', 'Палец', 'Ступни', 'Ноги', 'Руки', 'Грудь', 'Голова'];
        allTypes.forEach(type => {
            const typeLabel = document.createElement('label');
            typeLabel.style.display = 'flex';
            typeLabel.style.alignItems = 'center';
            typeLabel.style.cursor = 'pointer';
            typeLabel.style.fontSize = '12px';
            typeLabel.style.width = '48%';

            const typeCheckbox = document.createElement('input');
            typeCheckbox.type = 'checkbox';
            typeCheckbox.checked = window.BotConfig.dropSelectedTypes.includes(type);
            typeCheckbox.style.marginRight = '4px';
            typeCheckbox.onchange = () => {
                if (typeCheckbox.checked) {
                    if (!window.BotConfig.dropSelectedTypes.includes(type)) {
                        window.BotConfig.dropSelectedTypes.push(type);
                    }
                } else {
                    window.BotConfig.dropSelectedTypes = window.BotConfig.dropSelectedTypes.filter(t => t !== type);
                }
            };

            typeLabel.appendChild(typeCheckbox);
            typeLabel.appendChild(document.createTextNode(type));
            typesContainer.appendChild(typeLabel);
        });
        customSettingsBlock.appendChild(typesContainer);

        // Разделитель
        const separator2 = document.createElement('div');
        separator2.style.borderTop = '1px solid var(--gold-base)';
        separator2.style.margin = '10px 0';
        separator2.style.opacity = '0.3';
        customSettingsBlock.appendChild(separator2);

        // Выбор статов
        const statsLabel = document.createElement('div');
        statsLabel.textContent = 'Статы:';
        statsLabel.style.fontWeight = '600';
        statsLabel.style.marginBottom = '4px';
        customSettingsBlock.appendChild(statsLabel);

        const statsContainer = document.createElement('div');
        statsContainer.style.display = 'flex';
        statsContainer.style.flexWrap = 'wrap';
        statsContainer.style.gap = '8px';
        statsContainer.style.marginBottom = '10px';

        window.BotConfig.dropStats.forEach(stat => {
            const statLabel = document.createElement('label');
            statLabel.style.display = 'flex';
            statLabel.style.alignItems = 'center';
            statLabel.style.cursor = 'pointer';
            statLabel.style.fontSize = '12px';
            statLabel.style.width = '48%';

            const statCheckbox = document.createElement('input');
            statCheckbox.type = 'checkbox';
            statCheckbox.checked = window.BotConfig.dropSelectedStats.includes(stat);
            statCheckbox.style.marginRight = '4px';
            statCheckbox.onchange = () => {
                if (statCheckbox.checked) {
                    if (!window.BotConfig.dropSelectedStats.includes(stat)) {
                        window.BotConfig.dropSelectedStats.push(stat);
                    }
                } else {
                    window.BotConfig.dropSelectedStats = window.BotConfig.dropSelectedStats.filter(s => s !== stat);
                }
            };

            statLabel.appendChild(statCheckbox);
            statLabel.appendChild(document.createTextNode(stat));
            statsContainer.appendChild(statLabel);
        });
        customSettingsBlock.appendChild(statsContainer);

        // Разделитель
        const separator3 = document.createElement('div');
        separator3.style.borderTop = '1px solid var(--gold-base)';
        separator3.style.margin = '10px 0';
        separator3.style.opacity = '0.3';
        customSettingsBlock.appendChild(separator3);

        // Количество статов
        const statsCountLabel = document.createElement('div');
        statsCountLabel.textContent = 'Минимум статов:';
        statsCountLabel.style.fontWeight = '600';
        statsCountLabel.style.marginBottom = '4px';
        customSettingsBlock.appendChild(statsCountLabel);

        const statsCountInput = document.createElement('input');
        statsCountInput.type = 'number';
        statsCountInput.min = '1';
        statsCountInput.max = '10';
        statsCountInput.value = window.BotConfig.dropStatsCount;
        Object.assign(statsCountInput.style, {
            width: '60px',
            marginBottom: '10px',
            background: 'white',
            color: 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px 6px',
            fontSize: '12px'
        });
        statsCountInput.onchange = () => {
            window.BotConfig.dropStatsCount = parseInt(statsCountInput.value, 10);
        };
        customSettingsBlock.appendChild(statsCountInput);

        // Разделитель
        const separator1 = document.createElement('div');
        separator1.style.borderTop = '1px solid var(--gold-base)';
        separator1.style.margin = '10px 0';
        separator1.style.opacity = '0.3';
        customSettingsBlock.appendChild(separator1);

        // Минимальный ГС
        const gsLabel = document.createElement('div');
        gsLabel.textContent = 'Минимальный ГС:';
        gsLabel.style.fontWeight = '600';
        gsLabel.style.marginBottom = '4px';
        customSettingsBlock.appendChild(gsLabel);

        const gsInput = document.createElement('input');
        gsInput.type = 'number';
        gsInput.min = '100';
        gsInput.max = '1000';
        gsInput.value = window.BotConfig.dropMinGearScore;
        Object.assign(gsInput.style, {
            width: '80px',
            marginBottom: '10px',
            background: 'white',
            color: 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px 6px',
            fontSize: '12px'
        });
        gsInput.onchange = () => {
            window.BotConfig.dropMinGearScore = parseInt(gsInput.value, 10);
        };
        customSettingsBlock.appendChild(gsInput);

        content.appendChild(customSettingsBlock);

        // Кнопки
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'space-between';
        buttonsContainer.style.marginTop = '16px';
        buttonsContainer.style.gap = '10px';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Сохранить';
        saveBtn.style.flex = '1';
        saveBtn.style.padding = '8px 16px';
        saveBtn.style.background = 'var(--gold-base)';
        saveBtn.style.color = 'var(--black-dark)';
        saveBtn.style.border = 'none';
        saveBtn.style.borderRadius = '6px';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.fontWeight = 'bold';
        saveBtn.onclick = () => {
            modal.remove();
            console.log('Настройки дропа сохранены');
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Отмена';
        cancelBtn.style.flex = '1';
        cancelBtn.style.padding = '8px 16px';
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.color = 'var(--gold-base)';
        cancelBtn.style.border = '1px solid var(--gold-base)';
        cancelBtn.style.borderRadius = '6px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.onclick = () => {
            modal.remove();
        };

        buttonsContainer.appendChild(saveBtn);
        buttonsContainer.appendChild(cancelBtn);
        content.appendChild(buttonsContainer);

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Закрытие по клику вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    getGearScore(dialog) {
        const gsElement = dialog.querySelector('.gear-score-value');
        if (!gsElement) return 0;

        const gearScore = parseInt(gsElement.textContent.replace(/\D/g, ''), 10);
        return gearScore;
    }
}; 