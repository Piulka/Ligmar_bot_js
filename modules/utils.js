// Утилиты и вспомогательные функции
window.BotUtils = {
    /**
     * Задержка выполнения
     * @param {number} ms - миллисекунды
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Ожидание появления элемента
     * @param {string} selector - CSS селектор
     * @param {string} text - текст для поиска (опционально)
     * @param {number} timeout - таймаут в миллисекундах
     */
    async waitForElement(selector, text = null, timeout = 5000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (!text || element.textContent.includes(text)) {
                    return element;
                }
            }
            await this.delay(100);
        }
        return null;
    },

    /**
     * Клик по элементу с текстом
     * @param {string} text - текст для поиска
     * @param {number} timeout - таймаут в миллисекундах
     */
    async clickByTextContent(text, timeout = 500) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const elements = document.querySelectorAll('div.button-content');
            for (const element of elements) {
                if (element.textContent.trim() === text) {
                    element.click();
                    await this.delay(100);
                    return true;
                }
            }
            await this.delay(100);
        }
        return false;
    },

    /**
     * Клик по названию локации
     * @param {string} text - название локации
     * @param {number} timeout - таймаут в миллисекундах
     */
    async clickByLocationName(text, timeout = 500) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const elements = document.querySelectorAll('div.location-name');
            for (const element of elements) {
                if (element.textContent.trim() === text) {
                    element.click();
                    await this.delay(100);
                    return true;
                }
            }
            await this.delay(100);
        }
        return false;
    },

    /**
     * Ожидание условия
     * @param {Function} predicate - функция-предикат
     * @param {number} interval - интервал проверки
     * @param {number} timeout - таймаут
     */
    async waitFor(predicate, interval = 200, timeout = 10000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (predicate()) {
                return true;
            }
            await this.delay(interval);
        }
        return false;
    },

    /**
     * Определение класса игрока
     */
    detectPlayerClass() {
        const playerCard = document.querySelector('app-profile-card.player');
        if (!playerCard) return window.BotConfig.selectedClass;

        const skillElements = playerCard.querySelectorAll('app-battle-skills-panel tui-avatar img');
        
        for (const img of skillElements) {
            const src = img.src;
            if (src.includes('1421a679ae40807f87b6d8677e316a1f') || src.includes('1491a679ae4080468358fcce4f0dfadd')) {
                return 'Воин';
            }
            if (src.includes('1591a679ae40808cb79ff144baf28502') || src.includes('1591a679ae40808790d1dda8fe2e9779')) {
                return 'Лучник';
            }
            if (src.includes('14b1a679ae4080b782ebf42072c73ab9') || src.includes('14a1a679ae4080b4a37bedaec2d1c75e')) {
                return 'Маг';
            }
        }
        
        return window.BotConfig.selectedClass;
    },

    /**
     * Автоматическое определение VIP статуса
     */
    autoDetectVipStatus() {
        // Проверяем наличие кнопки switch (переключения цели)
        const switchIcon = document.querySelector('tui-icon.svg-icon[style*="assets/icons/switch.svg"]');
        if (switchIcon) {
            console.log('🔍 Обнаружена кнопка switch - игрок НЕ ВИП');
            return 'Не VIP';
        }

        // Дополнительная проверка по выносливости (fallback)
        const enduranceElement = document.querySelector('app-status-panel .status-endurance');
        if (!enduranceElement) return window.BotConfig.vipStatus;

        const enduranceText = enduranceElement.textContent.trim();
        const match = enduranceText.match(/(\d+)\/(\d+)/);
        
        if (match) {
            const maxEndurance = parseInt(match[2], 10);
            return maxEndurance >= 300 ? 'VIP' : 'Не VIP';
        }
        
        return window.BotConfig.vipStatus;
    },

    /**
     * Добавление обработчика клика вне элемента
     * @param {HTMLElement} container - контейнер
     */
    addOutsideClickListener(container) {
        function handler(event) {
            if (!container.contains(event.target) && event.target.id !== 'settings-button') {
                container.style.display = 'none';
                document.removeEventListener('mousedown', handler);
            }
        }
        document.removeEventListener('mousedown', handler);
        setTimeout(() => {
            document.addEventListener('mousedown', handler);
        }, 0);
    },

    /**
     * Включение закрытия по клику вне элемента
     * @param {string} containerId - ID контейнера
     * @param {Function} onClose - функция закрытия
     */
    enableCloseOnOutsideClick(containerId, onClose) {
        function handler(event) {
            const container = document.getElementById(containerId);
            if (container && !container.contains(event.target)) {
                onClose();
                document.removeEventListener('click', handler);
            }
        }
        setTimeout(() => {
            document.addEventListener('click', handler);
        }, 100);
    },

    /**
     * Универсальный поиск кнопки "Перейти" с расширенными селекторами
     * @param {number} timeout - таймаут в миллисекундах
     */
    async findGoButton(timeout = 10000) {
        const start = Date.now();
        const selectors = [
            'div.button-content',
            'button',
            '[role="button"]',
            '.btn',
            '.button',
            'tui-button',
            'app-button'
        ];

        while (Date.now() - start < timeout) {
            for (const selector of selectors) {
                const elements = Array.from(document.querySelectorAll(selector));
                for (const element of elements) {
                    const text = element.textContent.trim();
                    if (text === 'Перейти' || text === 'Go' || text === 'Move') {
                        console.log(`✅ Найдена кнопка "Перейти" через селектор: ${selector}`);
                        return element;
                    }
                }
            }
            await this.delay(200);
        }
        return null;
    }
}; 