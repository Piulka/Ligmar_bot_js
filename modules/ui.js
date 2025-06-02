// Модуль пользовательского интерфейса
window.BotUI = {
    isAuthorized: false, // Флаг авторизации
    
    /**
     * Создание кнопки авторизации
     */
    async createAuthButton() {
        if (document.getElementById('auth-button') || this.isAuthorized) return;

        // Находим элемент с пингом для позиционирования
        const pingElement = document.querySelector('.header-ping');
        let baseLeftPosition = 350; // Значение по умолчанию
        
        if (pingElement) {
            const pingRect = pingElement.getBoundingClientRect();
            // Кнопка алмаза на 5px правее кнопки активности (которая на 5px правее пинга)
            // Кнопка активности: pingRect.right + 5
            // Кнопка алмаза: pingRect.right + 5 + 80 (ширина кнопки активности) + 5
            baseLeftPosition = pingRect.right + 90;
        }

        // Создание кнопки авторизации с алмазиком
        const authButton = this.createStyledButton('auth-button', '💎');
        authButton.style.position = 'fixed';
        authButton.style.left = baseLeftPosition + 'px';
        authButton.style.top = '2px';
        authButton.style.zIndex = '1001';
        
        authButton.addEventListener('click', async () => {
            // Проверяем пароль
            const isAuthorized = await window.BotSecurity.showPasswordModal('авторизации');
            if (isAuthorized) {
                this.isAuthorized = true;
                // Удаляем кнопку авторизации
                document.body.removeChild(authButton);
                // Создаем основные кнопки
                await this.createMainButtons();
            }
        });

        document.body.appendChild(authButton);
    },

    /**
     * Создание основных кнопок после авторизации
     */
    async createMainButtons() {
        await this.createSettingsButton();
        await this.createControlButton();
        
        // Обновляем видимость кнопок в меню боссов после авторизации
        if (window.BotGameLogic && window.BotGameLogic.updateBossButtonsVisibility) {
            window.BotGameLogic.updateBossButtonsVisibility();
        }
    },

    /**
     * Создание кнопки настроек
     */
    async createSettingsButton() {
        if (document.getElementById('settings-button')) return;

        // Находим элемент с пингом для позиционирования
        const pingElement = document.querySelector('.header-ping');
        let baseLeftPosition = 350; // Значение по умолчанию
        
        if (pingElement) {
            const pingRect = pingElement.getBoundingClientRect();
            // Кнопка настроек на 5px правее кнопки активности
            // Кнопка активности: pingRect.right + 5
            // Кнопка настроек: pingRect.right + 5 + 80 (ширина кнопки активности) + 5
            baseLeftPosition = pingRect.right + 90;
        }

        // Создание кнопки настроек
        const button = this.createStyledButton('settings-button', '⚙');
        button.style.position = 'fixed';
        button.style.left = baseLeftPosition + 'px';
        button.style.top = '2px';
        button.style.zIndex = '1001';
        
        button.addEventListener('click', () => {
            const settingsWindow = document.getElementById('settings-window');
            if (settingsWindow) {
                const isVisible = settingsWindow.style.display !== 'none';
                settingsWindow.style.display = isVisible ? 'none' : 'block';
            }
        });

        document.body.appendChild(button);
    },

    /**
     * Создание стилизованной кнопки
     * @param {string} id - ID кнопки
     * @param {string} icon - иконка
     */
    createStyledButton(id, icon) {
        const button = document.createElement('button');
        button.id = id;
        
        Object.assign(button.style, {
            width: '40px',
            height: '33px',
            background: 'radial-gradient(circle, rgba(20,15,30,0.95) 0%, rgba(10,8,15,0.98) 100%)',
            color: '#FFD700',
            border: '1px solid rgba(128,128,128,0.3)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
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
            position: 'relative',
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
            justifyContent: 'center'
        });

        const iconSpan = document.createElement('span');
        iconSpan.textContent = icon;
        iconSpan.style.fontSize = '16px';
        iconSpan.style.lineHeight = '1';

        content.appendChild(iconSpan);
        button.appendChild(content);

        // Добавление эффектов наведения и нажатия
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
            button.style.background = 'radial-gradient(circle, rgba(30,25,40,0.95) 0%, rgba(15,12,20,0.98) 100%)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            button.style.background = 'radial-gradient(circle, rgba(20,15,30,0.95) 0%, rgba(10,8,15,0.98) 100%)';
        });

        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(1px)';
        });

        button.addEventListener('mouseup', () => {
            button.style.transform = 'translateY(-1px)';
        });

        return button;
    },

    /**
     * Создание окна настроек
     */
    async createSettingsWindow() {
        if (document.getElementById('settings-window')) return;

        const settingsWindow = document.createElement('div');
        settingsWindow.id = 'settings-window';
        
        Object.assign(settingsWindow.style, {
            position: 'fixed',
            top: '110px',
            left: '10px',
            width: '170px',
            background: 'linear-gradient(135deg, #1a1a1a 85%, #FFD700 100%)',
            color: '#ffffff',
            border: '1.5px solid #FFD700',
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
        settingsWindow.appendChild(title);

        // Группы настроек
        const settingsGroups = this.createSettingsGroups();
        settingsGroups.forEach(group => settingsWindow.appendChild(group));

        // Кнопки управления
        const controlButtons = this.createControlButtons();
        controlButtons.forEach(button => settingsWindow.appendChild(button));

        document.body.appendChild(settingsWindow);
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
        title.style.color = '#FFD700';
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
            background: '#FFD700',
            color: '#1a1a1a',
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

        // Находим элемент с пингом для позиционирования
        const pingElement = document.querySelector('.header-ping');
        let baseLeftPosition = 350; // Значение по умолчанию
        
        if (pingElement) {
            const pingRect = pingElement.getBoundingClientRect();
            // Кнопка плей на 5px правее кнопки настроек
            // Кнопка активности: pingRect.right + 5
            // Кнопка настроек: pingRect.right + 5 + 80 + 5 = pingRect.right + 90
            // Кнопка плей: pingRect.right + 90 + 40 (ширина кнопки настроек) + 5
            baseLeftPosition = pingRect.right + 135;
        }

        const controlButton = this.createStyledButton('control-button', '▶');
        controlButton.style.position = 'fixed';
        controlButton.style.left = baseLeftPosition + 'px';
        controlButton.style.top = '2px';
        controlButton.style.zIndex = '1001';

        controlButton.addEventListener('click', async () => {
            const iconSpan = controlButton.querySelector('span');
            
            if (!window.BotConfig.isScriptRunning) {
                // Деактивируем все другие кнопки перед запуском
                this.deactivateAllButtons();
                
                window.BotConfig.isScriptRunning = true;
                window.BotConfig.lastStartTime = Date.now();
                iconSpan.textContent = '⏸';
                
                // Добавляем визуальную индикацию активности - зеленое свечение
                controlButton.style.background = 'radial-gradient(circle, rgba(30,40,15,0.95) 0%, rgba(15,20,8,0.98) 100%)';
                controlButton.style.boxShadow = '0 2px 8px rgba(0, 255, 0, 0.5)';
                
                console.log('▶️ Запуск основного бота...');
                if (window.BotGameLogic && window.BotGameLogic.runScript) {
                    window.BotGameLogic.runScript();
                }
            } else {
                window.BotConfig.isScriptRunning = false;
                iconSpan.textContent = '▶';
                
                // Убираем зеленое свечение, возвращаем обычный стиль
                controlButton.style.background = 'radial-gradient(circle, rgba(20,15,30,0.95) 0%, rgba(10,8,15,0.98) 100%)';
                controlButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                
                console.log('⏸️ Остановка основного бота...');
            }
        });

        document.body.appendChild(controlButton);
    },

    /**
     * Деактивация всех кнопок управления
     */
    deactivateAllButtons() {
        // Деактивируем кнопку плей
        const controlButton = document.getElementById('control-button');
        if (controlButton) {
            const iconSpan = controlButton.querySelector('span');
            if (iconSpan && iconSpan.textContent === '⏸') {
                window.BotConfig.isScriptRunning = false;
                iconSpan.textContent = '▶';
                // Убираем зеленое свечение при деактивации
                controlButton.style.background = 'radial-gradient(circle, rgba(20,15,30,0.95) 0%, rgba(10,8,15,0.98) 100%)';
                controlButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                console.log('⏸️ Основной скрипт остановлен');
            }
        }

        // Деактивируем кнопку боссов с выпадающим меню
        const bossDropdownButton = document.getElementById('boss-dropdown-button');
        if (bossDropdownButton && window.BotGameLogic) {
            // Останавливаем активный босс ВТ
            if (window.BotGameLogic.activeBossType === 'vt' && window.BotGameLogic.vtAbortController) {
                window.BotGameLogic.vtAbortController.abort();
                window.BotGameLogic.vtAbortController = null;
                console.log('⏸️ Фарм босса ВТ остановлен');
            }
            
            // Останавливаем активный босс ЧТ
            if (window.BotGameLogic.activeBossType === 'cht' && window.BotGameLogic.chtAbortController) {
                window.BotGameLogic.chtAbortController.abort();
                window.BotGameLogic.chtAbortController = null;
                console.log('⏸️ Фарм босса ЧТ остановлен');
            }
            
            // Сбрасываем кнопку к исходному состоянию
            const iconSpan = bossDropdownButton.querySelector('span');
            if (iconSpan) {
                iconSpan.textContent = 'БОССЫ';
            }
            bossDropdownButton.style.background = 'radial-gradient(circle, rgba(40,25,15,0.95) 0%, rgba(20,12,8,0.98) 100%)';
            bossDropdownButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            window.BotGameLogic.activeBossType = null;
            
            // Скрываем выпадающее меню
            const dropdown = document.getElementById('boss-dropdown-menu');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        }
    }
}; 