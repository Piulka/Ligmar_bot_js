// Конфигурация и константы бота
window.BotConfig = {
    // Состояние скрипта
    isScriptRunning: false,
    deaths: 0,
    selectedLocation: 'Зеленые топи',
    scriptPausedTime: 0,
    lastStartTime: Date.now(),
    selectedClass: 'Лучник',
    sellItemsSetting: 'Продавать вещи',
    attackChampionsSetting: 'Атаковать чампов',
    vipStatus: 'VIP',
    
    // Настройки дропа
    dropModeStandard: true,
    dropModeCustom: false,
    dropFilters: {
        ancient: true,
        pmaVa: true,
        epicStats: true,
        highGearScore: true,
        custom: true
    },
    dropStats: ['Сила', 'Ловкость', 'Интеллект', 'Защита', 'Сопротивление', 'Меткость', 'Здоровье', 'Живучесть', 'Мана', 'Уклонение', 'Скрытность', 'Максимальный урон', 'Физ. атака'],
    dropSelectedStats: ['Сила', 'Ловкость', 'Интеллект', 'Защита', 'Сопротивление', 'Меткость', 'Здоровье', 'Живучесть', 'Мана', 'Уклонение', 'Скрытность', 'Максимальный урон', 'Физ. атака'],
    dropStatsCount: 3,
    dropMinGearScore: 300,
    dropQuality: 'Эпические',
    dropSelectedTypes: ['Оружие', 'Плечи', 'Шея', 'Пояс', 'Палец', 'Ступни', 'Ноги', 'Руки', 'Грудь', 'Голова'],
    dropPotionEnabled: false,

    // Версия скрипта
    SCRIPT_COMMIT: 'v.3.9.5',

    // Google Sheets интеграция (оставьте пустым если не используете)
    googleSheetsUrl: 'https://script.google.com/macros/s/AKfycby5sCwNtZTO3Pt-_m9kVKq3e-BvvFfuhNNuOfjuQqaL1p72XCF2qQVYl7LMSMQIA-SLBw/exec',

    // Навыки для каждого класса
    CLASS_SKILLS: {
        'Воин': {
            attack: ['assets/images/skills/1421a679ae40807f87b6d8677e316a1f.webp', 'assets/images/skills/1491a679ae4080468358fcce4f0dfadd.webp'],
            heal: 'assets/images/skills/1491a679ae408091bc22c1b4ff900728.webp',
            buff: 'assets/images/skills/1441a679ae4080e0ac0ce466631bc99e.webp'
        },
        'Убийца': {
            attack: ['assets/images/icons/attack.webp'],
            heal: null,
            buff: null
        },
        'Лучник': {
            attack: [
                'assets/images/skills/1591a679ae40808cb79ff144baf28502.webp',
                'assets/images/skills/1591a679ae40808790d1dda8fe2e9779.webp',
                'assets/images/skills/1591a679ae40807a8b42fb31199a8297.webp',
                'assets/images/skills/1591a679ae4080c297f7d036916c3c06.webp'
            ],
            multitarget: 'assets/images/skills/1591a679ae4080169e8fedd380594e52.webp',
            championSkill: 'assets/images/skills/1591a679ae408027a26fc49c44136cc9.webp',
            buff: [
                {
                    skill: 'assets/images/skills/1591a679ae408063a77bd6ed4dd4ab05.webp',
                    effect: 'assets/icons/effects/magicGearDamageArcher.svg'
                },
                {
                    skill: 'assets/images/skills/1591a679ae4080eba8d2d67872073b85.webp',
                    effect: 'assets/icons/effects/upEvasionArcher.svg'
                }
            ]
        },
        'Маг': {
            attack: ['assets/images/skills/14b1a679ae4080b782ebf42072c73ab9.webp', 'assets/images/skills/14a1a679ae4080b4a37bedaec2d1c75e.webp', 'assets/images/skills/14b1a679ae4080b3931ccd0b9b0d7979.webp'],
            heal: null,
            buff: null
        }
    }
};

// Модуль конфигурации безопасности
window.BotSecurity = {
    // Зашифрованный пароль (base64 от "qweqw")
    encryptedPassword: 'cXdlcXc=',
    
    /**
     * Проверка пароля
     * @param {string} inputPassword - введенный пароль
     */
    checkPassword(inputPassword) {
        const correctPassword = atob(this.encryptedPassword);
        return inputPassword === correctPassword;
    },

    /**
     * Показать модальное окно для ввода пароля
     */
    async showPasswordModal(action = 'доступа') {
        return new Promise((resolve) => {
            // Создаем модальное окно
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: Arial, sans-serif;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: #2c2c2c;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                text-align: center;
                color: white;
                min-width: 300px;
            `;

            const title = document.createElement('h3');
            title.textContent = `Введите пароль для ${action}`;
            title.style.cssText = 'margin: 0 0 20px 0; color: #ffd700;';

            const input = document.createElement('input');
            input.type = 'password';
            input.placeholder = 'Пароль';
            input.style.cssText = `
                width: 100%;
                padding: 10px;
                border: 1px solid #555;
                border-radius: 4px;
                background: #1a1a1a;
                color: white;
                font-size: 14px;
                margin-bottom: 20px;
                box-sizing: border-box;
            `;

            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center;';

            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = 'Подтвердить';
            confirmBtn.style.cssText = `
                padding: 10px 20px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            `;

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Отмена';
            cancelBtn.style.cssText = `
                padding: 10px 20px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            `;

            // События
            const handleConfirm = () => {
                const password = input.value;
                if (this.checkPassword(password)) {
                    document.body.removeChild(modal);
                    resolve(true);
                } else {
                    input.style.borderColor = '#f44336';
                    input.value = '';
                    input.placeholder = 'Неверный пароль!';
                    setTimeout(() => {
                        input.style.borderColor = '#555';
                        input.placeholder = 'Пароль';
                    }, 2000);
                }
            };

            const handleCancel = () => {
                document.body.removeChild(modal);
                resolve(false);
            };

            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                }
            });

            // Сборка модального окна
            buttonContainer.appendChild(confirmBtn);
            buttonContainer.appendChild(cancelBtn);
            modalContent.appendChild(title);
            modalContent.appendChild(input);
            modalContent.appendChild(buttonContainer);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            // Фокус на поле ввода
            setTimeout(() => input.focus(), 100);
        });
    }
}; 