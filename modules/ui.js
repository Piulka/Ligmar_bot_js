// Модуль пользовательского интерфейса
window.BotUI = {
    /**
     * Создание кнопки настроек
     */
    async createSettingsButton() {
        if (document.getElementById('settings-button')) return;

        // Ждем появления системного хедера
        let header = document.querySelector('app-system-header .header-relative');
        for (let i = 0; i < 30 && !header; i++) {
            await window.BotUtils.delay(100);
            header = document.querySelector('app-system-header .header-relative');
        }
        if (!header) return;

        // Находим или создаем контейнер для кнопок по центру
        let centerContainer = header.querySelector('.header-center-controls');
        if (!centerContainer) {
            centerContainer = document.createElement('div');
            centerContainer.className = 'header-center-controls';
            Object.assign(centerContainer.style, {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                position: 'absolute',
                left: '50%',
                top: '0',
                transform: 'translateX(-50%)',
                height: '100%',
                zIndex: '1001'
            });
            header.appendChild(centerContainer);
        }

        // Создание кнопки настроек
        const button = this.createStyledButton('settings-button', '⚙', 'Настройки');
        button.addEventListener('click', () => {
            const settingsContainer = document.getElementById('settings-container');
            if (!settingsContainer) return;
            
            if (settingsContainer.style.display === 'none' || settingsContainer.style.display === '') {
                settingsContainer.style.display = 'block';
                window.BotUtils.addOutsideClickListener(settingsContainer);
            } else {
                settingsContainer.style.display = 'none';
            }
        });

        if (!centerContainer.contains(button)) {
            centerContainer.appendChild(button);
        }
    },

    /**
     * Создание стилизованной кнопки
     * @param {string} id - ID кнопки
     * @param {string} icon - иконка
     * @param {string} text - текст
     */
    createStyledButton(id, icon, text) {
        const button = document.createElement('button');
        button.id = id;
        
        Object.assign(button.style, {
            width: '48px',
            height: '48px',
            background: 'radial-gradient(circle, rgba(20,15,30,0.95) 0%, rgba(10,8,15,0.98) 100%)',
            color: 'var(--gold-base)',
            border: '2px solid transparent',
            borderImage: 'linear-gradient(135deg, var(--gold-base), #8B6914, var(--gold-base)) 1',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            letterSpacing: '0.5px',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            userSelect: 'none',
            outline: 'none',
            margin: '0',
            position: 'relative',
            overflow: 'hidden'
        });

        // Создаем внутренний градиент
        const innerGlow = document.createElement('div');
        Object.assign(innerGlow.style, {
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
        });
        button.appendChild(innerGlow);

        // Контейнер для контента
        const content = document.createElement('div');
        Object.assign(content.style, {
            position: 'relative',
            zIndex: '2',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
        });

        const iconSpan = document.createElement('span');
        iconSpan.textContent = icon;
        iconSpan.style.fontSize = '16px';
        iconSpan.style.lineHeight = '1';

        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        textSpan.style.fontSize = '8px';
        textSpan.style.lineHeight = '1';
        textSpan.style.textTransform = 'uppercase';

        content.appendChild(iconSpan);
        content.appendChild(textSpan);
        button.appendChild(content);

        // Добавление эффектов наведения и нажатия
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
            button.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2)';
            button.style.background = 'radial-gradient(circle, rgba(30,25,40,0.95) 0%, rgba(15,12,20,0.98) 100%)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.1)';
            button.style.background = 'radial-gradient(circle, rgba(20,15,30,0.95) 0%, rgba(10,8,15,0.98) 100%)';
        });

        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
            button.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(0, 0, 0, 0.3)';
        });

        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1.05)';
        });

        return button;
    },

    /**
     * Создание окна настроек
     */
    async createSettingsWindow() {
        if (document.getElementById('settings-container')) return;

        const settingsContainer = document.createElement('div');
        settingsContainer.id = 'settings-container';
        
        Object.assign(settingsContainer.style, {
            position: 'fixed',
            top: '110px',
            left: '10px',
            width: '170px',
            background: 'linear-gradient(135deg, var(--black-dark) 85%, var(--gold-base) 100%)',
            color: 'var(--white)',
            border: '1.5px solid var(--gold-base)',
            borderRadius: '12px',
            padding: '10px 8px 8px 8px',
            boxShadow: '0 6px 24px 0 rgba(0,0,0,0.18)',
            zIndex: '1000',
            display: 'none',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            fontSize: '11px',
            userSelect: 'none'
        });

        // Заголовок
        const title = this.createTitle();
        settingsContainer.appendChild(title);

        // Группы настроек
        const settingsGroups = this.createSettingsGroups();
        settingsGroups.forEach(group => settingsContainer.appendChild(group));

        // Кнопки управления
        const controlButtons = this.createControlButtons();
        controlButtons.forEach(button => settingsContainer.appendChild(button));

        document.body.appendChild(settingsContainer);
    },

    /**
     * Создание заголовка настроек
     */
    createTitle() {
        const title = document.createElement('div');
        title.style.textAlign = 'center';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '8px';
        title.style.fontSize = '12px';
        title.style.color = 'var(--gold-base)';
        title.innerHTML = `⚙ Настройки ${window.BotConfig.SCRIPT_COMMIT}`;
        return title;
    },

    /**
     * Создание групп настроек
     */
    createSettingsGroups() {
        const groups = [];

        // Локация
        groups.push(this.createRadioGroup({
            label: 'Локация:',
            name: 'location',
            options: ['Пригород', 'Проклятый сад', 'Окраина леса', 'Озеро Королей', 'Зеленые топи', 'Старые рудники'],
            selectedValue: window.BotConfig.selectedLocation,
            onChange: (value) => { window.BotConfig.selectedLocation = value; }
        }));

        // Класс
        groups.push(this.createRadioGroup({
            label: 'Класс:',
            name: 'class',
            options: ['Воин', 'Убийца', 'Лучник', 'Маг'],
            selectedValue: window.BotConfig.selectedClass,
            onChange: (value) => { window.BotConfig.selectedClass = value; }
        }));

        // Продажа вещей
        groups.push(this.createRadioGroup({
            label: 'Продажа:',
            name: 'sell',
            options: ['Продавать вещи', 'Не продавать'],
            selectedValue: window.BotConfig.sellItemsSetting,
            onChange: (value) => { window.BotConfig.sellItemsSetting = value; }
        }));

        // Чемпионы
        groups.push(this.createRadioGroup({
            label: 'Чемпионы:',
            name: 'champions',
            options: ['Атаковать чампов', 'Игнорировать чампов'],
            selectedValue: window.BotConfig.attackChampionsSetting,
            onChange: (value) => { window.BotConfig.attackChampionsSetting = value; }
        }));

        return groups;
    },

    /**
     * Создание группы радио-кнопок
     */
    createRadioGroup({ label, name, options, selectedValue, onChange }) {
        const group = document.createElement('div');
        group.style.marginBottom = '8px';

        const labelElement = document.createElement('div');
        labelElement.textContent = label;
        labelElement.style.fontSize = '10px';
        labelElement.style.fontWeight = 'bold';
        labelElement.style.marginBottom = '3px';
        labelElement.style.color = 'var(--gold-base)';
        group.appendChild(labelElement);

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '2px';

        options.forEach(option => {
            const optionContainer = document.createElement('div');
            optionContainer.style.display = 'flex';
            optionContainer.style.alignItems = 'center';
            optionContainer.style.gap = '4px';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = name;
            radio.value = option;
            radio.checked = option === selectedValue;
            radio.style.margin = '0';
            radio.style.width = '12px';
            radio.style.height = '12px';

            const optionLabel = document.createElement('label');
            optionLabel.textContent = option;
            optionLabel.style.fontSize = '9px';
            optionLabel.style.cursor = 'pointer';
            optionLabel.style.flex = '1';

            radio.addEventListener('change', () => {
                if (radio.checked) {
                    onChange(option);
                }
            });

            optionLabel.addEventListener('click', () => {
                radio.checked = true;
                onChange(option);
            });

            optionContainer.appendChild(radio);
            optionContainer.appendChild(optionLabel);
            container.appendChild(optionContainer);
        });

        group.appendChild(container);
        return group;
    },

    /**
     * Создание кнопок управления
     */
    createControlButtons() {
        const buttons = [];

        // Кнопка настроек дропа
        const dropButton = document.createElement('button');
        dropButton.textContent = 'Настройки дропа';
        Object.assign(dropButton.style, {
            width: '100%',
            padding: '4px',
            fontSize: '9px',
            background: 'var(--gold-base)',
            color: 'var(--black-dark)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '8px'
        });
        dropButton.addEventListener('click', () => {
            if (window.BotInventory && window.BotInventory.showDropSettingsModal) {
                window.BotInventory.showDropSettingsModal();
            }
        });
        buttons.push(dropButton);

        return buttons;
    },

    /**
     * Создание кнопки управления ботом
     */
    async createControlButton() {
        if (document.getElementById('control-button')) return;

        let header = document.querySelector('app-system-header .header-relative');
        for (let i = 0; i < 30 && !header; i++) {
            await window.BotUtils.delay(100);
            header = document.querySelector('app-system-header .header-relative');
        }
        if (!header) return;

        let centerContainer = header.querySelector('.header-center-controls');
        if (!centerContainer) {
            centerContainer = document.createElement('div');
            centerContainer.className = 'header-center-controls';
            Object.assign(centerContainer.style, {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                position: 'absolute',
                left: '50%',
                top: '0',
                transform: 'translateX(-50%)',
                height: '100%',
                zIndex: '1001'
            });
            header.appendChild(centerContainer);
        }

        const controlButton = this.createStyledButton('control-button', '▶', 'Старт');
        
        controlButton.addEventListener('click', async () => {
            const iconSpan = controlButton.querySelector('span:first-child');
            const textSpan = controlButton.querySelector('span:last-child');
            
            if (!window.BotConfig.isScriptRunning) {
                window.BotConfig.isScriptRunning = true;
                window.BotConfig.lastStartTime = Date.now();
                iconSpan.textContent = '⏸';
                textSpan.textContent = 'СТОП';
                
                if (window.BotGameLogic && window.BotGameLogic.runScript) {
                    await window.BotGameLogic.runScript();
                }
            } else {
                window.BotConfig.isScriptRunning = false;
                iconSpan.textContent = '▶';
                textSpan.textContent = 'СТАРТ';
            }
        });

        if (!centerContainer.contains(controlButton)) {
            centerContainer.appendChild(controlButton);
        }
    }
}; 