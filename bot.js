let isScriptRunning = false; // Флаг для отслеживания состояния скрипта
let deaths = 0; // Количество смертей

// Функция для создания кнопки "Старт/Стоп"
async function createControlButton() {
    // Проверяем, существует ли уже кнопка
    if (document.getElementById('control-button')) {
        console.log('Кнопка "Старт/Стоп" уже существует');
        return;
    }

    const button = document.createElement('button');
    button.id = 'control-button';
    button.textContent = 'Старт';
    button.style.position = 'fixed';
    button.style.top = '20px';
    button.style.right = '20px';
    button.style.zIndex = '1000';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = 'var(--black-light)'; // Цвет кнопки под стиль игры
    button.style.color = 'var(--white)';
    button.style.border = '2px solid var(--gold-base)';
    button.style.borderRadius = '8px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '16px';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    button.style.transition = 'background-color var(--animation-duration), transform var(--animation-duration)';
    button.style.maxHeight = '50px'; // Ограничение высоты кнопки

    button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = 'var(--gold-light)'; // Цвет при наведении
        button.style.transform = 'scale(1.05)';
        setTimeout(() => {}, 100);
    });

    button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'var(--black-light)'; // Возвращаем цвет
        button.style.transform = 'scale(1)';
        setTimeout(() => {}, 100);
    });

    button.addEventListener('click', async () => {
        if (isScriptRunning) {
            isScriptRunning = false;
            button.textContent = 'Старт';
            button.style.backgroundColor = 'var(--black-light)';
            console.log('Скрипт остановлен');
            await new Promise(resolve => setTimeout(resolve, 100));
        } else {
            isScriptRunning = true;
            button.textContent = 'Стоп';
            button.style.backgroundColor = 'var(--red-light)';
            console.log('Скрипт запущен');
            await new Promise(resolve => setTimeout(resolve, 100));
            await runScript();
        }
    });

    document.body.appendChild(button);
    await new Promise(resolve => setTimeout(resolve, 100));
}

// Функция для создания элемента статистики
async function createStatisticsElement() {
    const statsContainer = document.createElement('div');
    statsContainer.id = 'statistics-container';
    statsContainer.style.position = 'fixed';
    statsContainer.style.top = '80px';
    statsContainer.style.right = '20px';
    statsContainer.style.zIndex = '1000';
    statsContainer.style.padding = '15px';
    statsContainer.style.backgroundColor = 'var(--black-dark)';
    statsContainer.style.border = '2px solid var(--black-light)';
    statsContainer.style.borderRadius = '10px';
    statsContainer.style.fontSize = '14px';
    statsContainer.style.color = 'var(--white)';
    statsContainer.style.fontFamily = 'Arial, sans-serif';
    statsContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    statsContainer.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
    statsContainer.style.overflow = 'hidden';

    // Кнопка сворачивания
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '-';
    toggleButton.style.position = 'fixed';
    toggleButton.style.top = '80px';
    toggleButton.style.right = '20px';
    toggleButton.style.width = '20px';
    toggleButton.style.height = '20px';
    toggleButton.style.backgroundColor = 'var(--gold-base)';
    toggleButton.style.color = 'var(--black-dark)';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.fontSize = '14px';
    toggleButton.style.fontWeight = 'bold';
    toggleButton.style.display = 'flex';
    toggleButton.style.alignItems = 'center';
    toggleButton.style.justifyContent = 'center';
    toggleButton.style.zIndex = '1001'; // Поверх окна статистики

    // Содержимое статистики
    const statsContent = document.createElement('div');
    statsContent.id = 'statistics-content';
    statsContent.style.transition = 'opacity 0.3s ease';
    statsContent.style.opacity = '1'; // Полностью видимое содержимое

    statsContent.innerHTML = `
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: var(--gold-base);">Статистика:</div>
        <div>Мобы: <span id="mobs-killed" style="color: var(--green-light);">0</span></div>
        <div>Чампы: <span id="champions-killed" style="color: var(--purple-light);">0</span></div>
        <div>Продано: <span id="items-sold" style="color: var(--gold-light);">0</span></div>
        <div>Оставлено: <span id="items-stored" style="color: var(--gold-light);">0</span></div>
        <div>Древние вещи: <span id="ancient-items" style="color: var(--red-light);">0</span></div>
        <div>ПМА/ВА: <span id="pma-va-items" style="color: var(--red-light);">0</span></div>
        <div>Походы в магаз: <span id="sell-trips" style="color: var(--white-light);">0</span></div>
        <div>Смерти: <span id="deaths" style="color: var(--red-light);">0</span></div>
        <div>Время работы: <span id="script-runtime" style="color: var(--white-light);">0</span> сек</div>
    `;

    // Логика сворачивания/разворачивания
    let isCollapsed = false; // Флаг состояния окна
    toggleButton.addEventListener('click', () => {
        if (isCollapsed) {
            // Разворачиваем окно
            statsContainer.style.opacity = '1';
            statsContainer.style.visibility = 'visible';
            toggleButton.textContent = '-';
        } else {
            // Сворачиваем окно
            statsContainer.style.opacity = '0';
            statsContainer.style.visibility = 'hidden';
            toggleButton.textContent = '+';
        }
        isCollapsed = !isCollapsed; // Переключаем состояние
    });

    statsContainer.appendChild(statsContent);
    document.body.appendChild(statsContainer);
    document.body.appendChild(toggleButton); // Добавляем кнопку отдельно
    await new Promise(resolve => setTimeout(resolve, 100));
}
// Основной скрипт
async function runScript() {
    try {
        await clickByTextContent('Сражения');
        await new Promise(resolve => setTimeout(resolve, 100));
        await clickByLocationName('Зеленые топи');
        await new Promise(resolve => setTimeout(resolve, 100));
        while (isScriptRunning) {
            await mainLoop();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    } catch (error) {
        console.error('Ошибка в скрипте:', error);
    }
}

// Функция клика по тексту
async function clickByTextContent(text, timeout = 500) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const elements = document.querySelectorAll('div.button-content');
        for (const element of elements) {
            if (element.textContent.trim() === text) {
                element.click();
                await new Promise(resolve => setTimeout(resolve, 100));
                return true;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
}

// Функция клика по названию локации
async function clickByLocationName(text, timeout = 500) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const elements = document.querySelectorAll('div.location-name');
        for (const element of elements) {
            if (element.textContent.trim() === text) {
                element.click();
                await new Promise(resolve => setTimeout(resolve, 100));
                return true;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
}

// Функция поиска и клика по гексагону
async function clickHexagonWithPriority(priorities, timeout = 5000) {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        if (!isScriptRunning) return false;

        // Нажимаем на иконку "aim.svg" перед поиском гексагона
        const aimIcon = document.querySelector('tui-icon.svg-icon[style*="aim.svg"]');
        if (aimIcon) {
            aimIcon.click();
            await new Promise(resolve => setTimeout(resolve, 100)); // Задержка после нажатия
        }

        for (const priority of priorities) {
            // Универсальный поиск для приоритетных сущностей (алтарь, сундук, чемпион, босс)
            if (priority.type === 'champion' || priority.type === 'shrine' || priority.type === 'boss' || priority.type === 'chest-epic' || priority.type === 'chest-rare' || priority.type === 'chest-common') {
                const targetUse = Array.from(document.querySelectorAll('use')).find(use => {
                    const href = use.getAttribute('xlink:href') || use.getAttribute('href');
                    return href === priority.selector.replace('use[xlink\\:href="', '').replace('"]', '');
                });

                if (targetUse) {
                    const hexagon = targetUse.closest('g.hex-box');
                    if (hexagon) {
                        console.log(`Найден ${priority.type === 'champion' ? 'чемпион' : priority.type === 'shrine' ? 'алтарь' : 'сундук'}!`);
                        clickHexagon(hexagon);
                        await new Promise(resolve => setTimeout(resolve, 100));

                        // Если это чемпион, передаем флаг в fightEnemies
                        if (priority.type === 'champion') {
                            await fightEnemies(true);
                        } else {
                            await fightEnemies(false);
                        }

                        return true;
                    }
                }
            }

            // Проверяем врагов
            if (priority.type === 'enemies') {
                const hexagons = document.querySelectorAll('g.hex-box');
                for (const hexagon of hexagons) {
                    const currentHexText = hexagon.querySelector('div.hex-current-text.ng-star-inserted');
                    if (currentHexText && currentHexText.textContent.trim() === 'Вы здесь') {
                        console.log('Пропускаем гексагон с текстом "Вы здесь"');
                        continue;
                    }

                    const textElement = hexagon.querySelector('text.enemies');
                    if (textElement && textElement.textContent.trim() === String(priority.value)) {
                        clickHexagon(hexagon);
                        await new Promise(resolve => setTimeout(resolve, 100));
                        await fightEnemies(false);
                        return true;
                    }
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 100)); // Задержка перед повторной проверкой
    }

    console.error('Гексагон с указанными приоритетами не найден');
    return false;
}

// Универсальная функция клика по гексагону
function clickHexagon(hexagon) {
    const rect = hexagon.getBoundingClientRect();

    // Создаем и отправляем события mousedown, mouseup и click
    const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
    });
    const mouseupEvent = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
    });
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
    });

    // Отправляем события
    hexagon.dispatchEvent(mousedownEvent);
    hexagon.dispatchEvent(mouseupEvent);
    hexagon.dispatchEvent(clickEvent);
    setTimeout(() => {}, 100);
}

// Функция клика по полигону
function clickPolygon(polygon) {
    const rect = polygon.getBoundingClientRect();
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
    });
    polygon.dispatchEvent(clickEvent);
    setTimeout(() => {}, 100);
}

// Основной цикл
async function mainLoop() {
    // Проверяем и возвращаемся в город, если нужно
    checkAndReturnToCity();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Обрабатываем переполненный рюкзак
    await handleFullBackpack();
    await new Promise(resolve => setTimeout(resolve, 100));
    const hexagonFound = await clickHexagonWithPriority(priorities);
    if (!hexagonFound) return;

    const transitionSuccess = await clickByTextContent('Перейти');
    await new Promise(resolve => setTimeout(resolve, 100));
    if (!transitionSuccess) {
        // Проверяем, находится ли мы в текущем гексагоне
        const currentHexText = document.querySelector('div.hex-footer div.hex-current-text.ng-star-inserted');
        if (currentHexText && currentHexText.textContent.trim() === 'Вы здесь') {

            // Нажимаем на кнопку закрытия
            const closeButton = document.querySelector('tui-icon.svg-icon[style*="close.svg"]');
            if (closeButton) {
                closeButton.click();
                await new Promise(resolve => setTimeout(resolve, 100));
                await fightEnemies();
            } else {
                console.error('Кнопка закрытия не найдена');
                return;
            }

            return;
        }

        console.error('Не удалось определить текущий гексагон, продолжаем поиск');
        return;
    }

    const enemyAppeared = await waitForEnemy();
    await new Promise(resolve => setTimeout(resolve, 100));
    if (!enemyAppeared) {
        return;
    }

    await fightEnemies();
    await new Promise(resolve => setTimeout(resolve, 100));
}

// Функция ожидания появления врага
async function waitForEnemy(timeout = 7000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (!isScriptRunning) return false;

        const enemyIcon = document.querySelector('app-icon.profile-class tui-icon[style*="mob-class-"]');
        if (enemyIcon) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
}

// Функция проверки наличия алтаря или сундука на текущем гексагоне
async function isSpecialHexagon() {
    console.log('Поиск специальных сущностей...'); // Добавьте для отладки
    
    // Современный вариант поиска SVG use элементов
    const specialEntities = Array.from(document.querySelectorAll('use')).find(use => {
        const href = use.getAttribute('href') || use.getAttribute('xlink:href');
        return href && (href.includes('shrine') || href.includes('chest'));
    });

    if (specialEntities) {
        console.log('Найдена специальная сущность:', specialEntities);
        return true;
    }
    
    return false;
}

// Функция использования навыков
async function useSkills(skillOrder, activationTimes) {
    for (let i = 0; i < skillOrder.length; i++) {
        const skill = skillOrder[i];
        await useSkill(skill);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// Приоритеты
const priorities = [
    { type: 'champion', selector: '#champion' },
    { type: 'chest-epic', selector: '#chest-epic' },      // Эпик сундук
    { type: 'shrine', selector: '#shrine' },
    { type: 'chest-rare', selector: '#chest-rare' },     // Рар сундук
    { type: 'chest-epic', selector: '#chest-common' },      // Эпик сундук
    { type: 'enemies', value: '1' },
    { type: 'enemies', value: '2' }
];

// Навыки
const SKILLS = {
    KICK: 'assets/images/skills/1421a679ae40807f87b6d8677e316a1f.webp',
    TAUNTING_STRIKE: 'assets/images/skills/1491a679ae4080468358fcce4f0dfadd.webp',
    LIFE_LEECH: 'assets/images/skills/1491a679ae408091bc22c1b4ff900728.webp', // Жажда жизни
    DEF_BUFF: 'assets/images/skills/1441a679ae4080e0ac0ce466631bc99e.webp'
};

// Функция проверки и активации DEF_BUFF
async function checkAndActivateDefenseBuff() {
    try {
        // Ищем иконку "upDefenseWarrior.svg"
        const defenseIcon = document.querySelector('tui-icon.svg-icon[style*="upDefenseWarrior.svg"]');
        if (!defenseIcon) {
            await useSkill(SKILLS.DEF_BUFF); // Используем навык DEF_BUFF
            await new Promise(resolve => setTimeout(resolve, 100));
        } else {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    } catch (error) {
        console.error('Ошибка в функции checkAndActivateDefenseBuff:', error);
    }
}

// Функция использования Зелья маны
async function useManaPotion() {
    const manaPotionButton = document.querySelector('app-action-button .action-image[style*="potion-mana-epic"]');
    if (manaPotionButton) {
        manaPotionButton.click();
        await new Promise(resolve => setTimeout(resolve, 100)); // Задержка для применения
    } else {
        console.error('Кнопка Зелья маны не найдена');
    }
}

// Функция использования Зелья здоровья
async function useHealthPotion() {
    const healthPotionButton = document.querySelector('app-action-button .action-image[style*="potion-health-epic"]');
    if (healthPotionButton) {
        healthPotionButton.click();
        await new Promise(resolve => setTimeout(resolve, 100)); // Задержка для применения
    } else {
        console.error('Кнопка Зелья здоровья не найдена');
    }
}

// Функция проверки маны и здоровья
async function checkManaAndHealth() {
    // Проверка маны
    const manaElement = document.querySelector('app-general-stat.profile-mana .stats-line-mana');
    if (manaElement) {
        const manaPercentage = parseFloat(manaElement.style.transform.match(/-?\d+(\.\d+)?/)[0]);
        if (manaPercentage <= -50) { // Если мана <= 50%
            await useManaPotion();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Проверка здоровья
    const healthElement = document.querySelector('app-general-stat.profile-health .stats-line');
    if (healthElement) {
        const healthPercentage = parseFloat(healthElement.style.transform.match(/-?\d+(\.\d+)?/)[0]);
        if (healthPercentage <= -20) { // Если здоровье <= 50%
            await useHealthPotion();
            await new Promise(resolve => setTimeout(resolve, 100));
            await useSkill(SKILLS.LIFE_LEECH); // Жажда жизни
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

// Функция использования навыка
async function useSkill(skill) {
    const skillButton = document.querySelector(`div.action-image[style*="${skill}"]`);
    if (skillButton) {
        skillButton.click();
        await new Promise(resolve => setTimeout(resolve, 100)); // Задержка для применения
    }
}

async function handleFullBackpack() {
    // Проверяем наличие иконки рюкзака в шапке
    const backpackIcon = document.querySelector('app-icon.header-backpack-icon tui-icon[style*="backpack.svg"]');
    if (!backpackIcon) {
        return;
    }

    // Проверяем, переполнен ли инвентарь (по иконке или тексту)
    const isBackpackFull = document.querySelector('div.backpack-capacity-danger') || 
                         backpackIcon.closest('app-icon').classList.contains('backpack-full');
    
    if (!isBackpackFull) {
        return;
    }

    console.log('Инвентарь переполнен, начинаем обработку...');

    try {
        // Нажимаем на кнопку "Портал"
        const portalButton = await waitForElement('app-button-icon[data-appearance="primary"] .button-icon-text', 'Портал', 5000);
        if (portalButton) {
            portalButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('Кнопка "Портал" нажата');
            await delay(10000); // Ждем завершения перехода через портал

            // Нажимаем на кнопку "Персонаж"
            const characterButton = await waitForElement('div.footer-button-content .footer-button-text', 'Персонаж', 5000);
            if (characterButton) {
                characterButton.click();
                await new Promise(resolve => setTimeout(resolve, 100));
                console.log('Кнопка "Персонаж" нажата');

                // Ждем и активируем вкладку "Рюкзак"
                const backpackTab = await waitForElement('div.tab-content', 'Рюкзак', 5000);
                if (backpackTab) {
                    backpackTab.click();
                    await new Promise(resolve => setTimeout(resolve, 100));
                    console.log('Вкладка "Рюкзак" выбрана');

                    // Обрабатываем предметы
                    await processBackpackItems();
                    await new Promise(resolve => setTimeout(resolve, 100));
                } else {
                    console.error('Вкладка "Рюкзак" не найдена');
                }
            } else {
                console.error('Кнопка "Персонаж" не найдена');
            }
        } else {
            console.error('Кнопка "Портал" не найдена');
        }
    } catch (error) {
        console.error('Ошибка при обработке переполненного инвентаря:', error);
    }
}

// Вспомогательная функция задержки
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Вспомогательная функция для ожидания элемента с текстом
async function waitForElement(selector, text, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            if (element.textContent.trim() === text) {
                await new Promise(resolve => setTimeout(resolve, 100));
                return element;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return null;
}

// Вспомогательная функция для ожидания элемента
async function waitForElement(selector, text = null, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            if (!text || element.textContent.trim() === text) {
                await new Promise(resolve => setTimeout(resolve, 100));
                return element;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return null;
}

// Функция для поиска и нажатия на кнопку "В город"
async function checkAndReturnToCity() {
    try {
        while (isScriptRunning) {
            const cityButton = document.querySelector('div.button-content');
            if (cityButton && cityButton.textContent.trim() === 'В город') {
                console.log('Найдена кнопка "В город", выполняем нажатие...');
                cityButton.click();
                await new Promise(resolve => setTimeout(resolve, 100));
                await delay(1000);

                // Увеличиваем счетчик смертей
                deaths++;
                updateStatistics('deaths', deaths);
                console.log(`Смерть зафиксирована. Всего смертей: ${deaths}`);

                // Выполняем переход в "Сражения" и "Зеленые топи"
                await clickByTextContent('Сражения');
                await new Promise(resolve => setTimeout(resolve, 100));
                await clickByLocationName('Зеленые топи');
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Задержка перед повторной проверкой
            await delay(1000);
        }
    } catch (error) {
        console.error('Ошибка в функции checkAndReturnToCity:', error);
    }
}

// Обновляем статистику
function updateStatistics(stat, value) {
    const statElement = document.getElementById(stat);
    if (statElement) {
        statElement.textContent = value;
        setTimeout(() => {}, 100);
    }
}

// Переменные для хранения статистики
let mobsKilled = 0;
let championsKilled = 0;
let itemsSold = 0;
let itemsStored = 0;
let ancientItems = 0;
let pmaVaItems = 0;
let sellTrips = 0;
let scriptStartTime = Date.now();

// Функция для обновления времени работы скрипта
function updateScriptRuntime() {
    const runtimeInSeconds = Math.floor((Date.now() - scriptStartTime) / 1000);
    const hours = Math.floor(runtimeInSeconds / 3600);
    const minutes = Math.floor((runtimeInSeconds % 3600) / 60);
    const seconds = runtimeInSeconds % 60;

    const formattedTime = `${hours}ч ${minutes}м ${seconds}с`;
    updateStatistics('script-runtime', formattedTime);
}

async function fightEnemies(isChampionHexagon = false) {
    let initialEnemyCount = 0;

    // Получаем количество врагов перед боем
    const enemiesCountElement = document.querySelector('div.battle-bar-enemies-value');
    if (enemiesCountElement) {
        initialEnemyCount = parseInt(enemiesCountElement.textContent.trim(), 10) || 0;
    }

    while (isScriptRunning) {
        const enemyIcon = document.querySelector('app-icon.profile-class tui-icon[style*="mob-class-"]');
        if (!enemyIcon) break;

        const enemiesCountElement = document.querySelector('div.battle-bar-enemies-value');
        if (enemiesCountElement && enemiesCountElement.textContent.trim() === '0') {
            break;
        }

        // Проверяем состояние маны и здоровья
        await checkManaAndHealth();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Проверяем и активируем DEF_BUFF, если нужно
        await checkAndActivateDefenseBuff();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Используем навыки
        await useSkills([SKILLS.KICK, SKILLS.TAUNTING_STRIKE], [1.1, 1.3]);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Увеличиваем счетчик мобов после боя
    mobsKilled += initialEnemyCount;
    updateStatistics('mobs-killed', mobsKilled);

    // Если это клетка с чемпионом, увеличиваем счетчик чемпионов
    if (isChampionHexagon) {
        championsKilled++;
        updateStatistics('champions-killed', championsKilled);
    }
}

async function navigateToSellItems() {
    try {
        sellTrips++; // Увеличиваем счетчик походов в магазин
        updateStatistics('sell-trips', sellTrips);

        // Нажимаем на "Город"
        const townButton = await waitForElement('div.footer-button-content .footer-button-text', 'Город', 5000);
        if (townButton) {
            townButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('Перешли в Город');
        } else {
            console.error('Кнопка "Город" не найдена');
            return;
        }

        // Нажимаем на кнопку "Строения"
        const buildingsButton = await waitForElement('div.button-content', 'Строения', 5000);
        if (buildingsButton) {
            buildingsButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('Нажата кнопка "Строения"');
        } else {
            console.error('Кнопка "Строения" не найдена');
            return;
        }

        // Нажимаем на "Торговая лавка"
        const shopButton = await waitForElement('div.location-name', 'Торговая лавка', 5000);
        if (shopButton) {
            shopButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('Перешли в Торговую лавку');
        } else {
            console.error('Кнопка "Торговая лавка" не найдена');
            return;
        }

        // Нажимаем на "Продать снаряжение"
        const sellButton = await waitForElement('div.button-content', 'Продать снаряжение', 5000);
        if (sellButton) {
            sellButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('Нажата кнопка "Продать снаряжение"');
        } else {
            console.error('Кнопка "Продать снаряжение" не найдена');
            return;
        }

        // Подтверждаем продажу
        const confirmSellButton = await waitForElement('div.button-content', 'Да, продать', 5000);
        if (confirmSellButton) {
            confirmSellButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('Продажа подтверждена');
        } else {
            console.error('Кнопка "Да, продать" не найдена');
            return;
        }

        // Нажимаем на "Город" перед возвращением в бой
        const returnToTownButton = await waitForElement('div.footer-button-content .footer-button-text', 'Город', 5000);
        if (returnToTownButton) {
            returnToTownButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('Нажата кнопка "Город" перед возвращением в бой');
        } else {
            console.error('Кнопка "Город" не найдена перед возвращением в бой');
            return;
        }

        // Нажимаем на кнопку "Вернуться в бой"
        const returnToBattleButton = await waitForElement('div.button-content', 'Вернуться в бой', 5000);
        if (returnToBattleButton) {
            returnToBattleButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('Нажата кнопка "Вернуться в бой"');
        } else {
            console.error('Кнопка "Вернуться в бой" не найдена');
        }
    } catch (error) {
        console.error('Ошибка при выполнении последовательности действий:', error);
    }
}

// Вспомогательная функция для получения количества предметов в рюкзаке
async function getBackpackItemCount() {
    const equipmentGroup = Array.from(document.querySelectorAll('app-items-group')).find(group => {
        const nameElement = group.querySelector('.items-group-name');
        return nameElement && nameElement.textContent.trim() === 'Снаряжение';
    });

    if (!equipmentGroup) {
        console.error('Вкладка "Снаряжение" не найдена');
        return 0;
    }

    const items = equipmentGroup.querySelectorAll('app-item-card.backpack-item');
    await new Promise(resolve => setTimeout(resolve, 100));
    return items.length;
}

// Обновляем статистику при добавлении вещей в сундук
async function processBackpackItems() {
    // Ищем вкладку "Снаряжение"
    const equipmentGroup = Array.from(document.querySelectorAll('app-items-group')).find(group => {
        const nameElement = group.querySelector('.items-group-name');
        return nameElement && nameElement.textContent.trim() === 'Снаряжение';
    });

    if (!equipmentGroup) {
        console.error('Вкладка "Снаряжение" не найдена');
        return;
    }

    // Получаем все предметы в рюкзаке перед обработкой
    const itemsBeforeProcessing = equipmentGroup.querySelectorAll('app-item-card.backpack-item').length;

    let itemsStoredInChest = 0; // Количество вещей, положенных в сундук
    let ancientItemsStored = 0; // Количество древних вещей, положенных в сундук
    let pmaVaItemsStored = 0;   // Количество ПМА/ВА вещей, положенных в сундук

    const items = equipmentGroup.querySelectorAll('app-item-card.backpack-item');
    if (!items.length) {
        console.log('Предметы не найдены');
        return;
    }

    console.log(`Найдено ${items.length} предметов`);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.click();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Получаем диалоговое окно
        const dialog = document.querySelector('app-dialog-container.dialog-container-item');
        if (!dialog) {
            console.log('Диалог не открылся');
            continue;
        }

        console.log(`Обрабатываем предмет ${i + 1}`);

        // Проверяем параметры предмета
        const isAncient = checkAncientItem(dialog);
        const isPmaVa = checkPmaVaItem(dialog);

        if (isAncient) {
            ancientItemsStored++;
        }

        if (isPmaVa) {
            pmaVaItemsStored++;
        }

        // Закрываем диалог
        const closeBtn = dialog.querySelector('tui-icon.svg-icon[style*="close.svg"]');
        if (closeBtn) {
            closeBtn.click();
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        itemsStoredInChest++;
    }

    console.log('Обработка завершена');

    // Обновляем статистику
    itemsStored += itemsStoredInChest; // Оставленные вещи (в сундуке)
    updateStatistics('items-stored', itemsStored);

    ancientItems += ancientItemsStored; // Древние вещи
    updateStatistics('ancient-items', ancientItems);

    pmaVaItems += pmaVaItemsStored; // ПМА/ВА вещи
    updateStatistics('pma-va-items', pmaVaItems);

    const itemsSoldNow = itemsBeforeProcessing - itemsStoredInChest; // Проданные вещи
    itemsSold += itemsSoldNow;
    updateStatistics('items-sold', itemsSold);

    console.log(`Продано: ${itemsSoldNow}, Оставлено: ${itemsStoredInChest}`);

    // После обработки вещей вызываем функцию для продажи
    await navigateToSellItems();
    await new Promise(resolve => setTimeout(resolve, 100));
}

// Проверка, является ли предмет древним (>100%)
function checkAncientItem(dialog) {
    const stats = dialog.querySelector('.item-stats');
    if (stats && stats.textContent.includes('>100%')) {
        setTimeout(() => {}, 100);
        return true;
    }
    setTimeout(() => {}, 100);
    return false;
}

// Проверка, имеет ли предмет ПМА или ВА
function checkPmaVaItem(dialog) {
    const stats = dialog.querySelector('.item-stats');
    if (stats && (stats.textContent.includes('ПМА') || stats.textContent.includes('ВА'))) {
        setTimeout(() => {}, 100);
        return true;
    }
    setTimeout(() => {}, 100);
    return false;
}

// Создаем кнопку и статистику при загрузке страницы
createControlButton();
createStatisticsElement();

// Обновляем время работы скрипта каждые 5 секунд
setInterval(updateScriptRuntime, 5000);