let isScriptRunning = false; // Флаг для отслеживания состояния скрипта

// Функция для создания кнопки "Старт/Стоп"
function createControlButton() {
    const button = document.createElement('button');
    button.id = 'control-button';
    button.textContent = 'Старт';
    button.style.position = 'fixed';
    button.style.top = '40px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    button.style.padding = '5px 10px';
    button.style.height = '36px';
    button.style.backgroundColor = '#28a745';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';

    button.addEventListener('click', async () => {
        if (isScriptRunning) {
            isScriptRunning = false;
            button.textContent = 'Старт';
            button.style.backgroundColor = '#28a745';
            console.log('Скрипт остановлен');
        } else {
            isScriptRunning = true;
            button.textContent = 'Стоп';
            button.style.backgroundColor = '#dc3545';
            console.log('Скрипт запущен');
            await runScript();
        }
    });

    document.body.appendChild(button);
}

// Основной скрипт
async function runScript() {
    try {
        await clickByTextContent('Сражения');
        await clickByLocationName('Зеленые топи');
        while (isScriptRunning) {
            await mainLoop();
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
                return true;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.error(`Элемент с текстом "${text}" не найден`);
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
                console.log(`Клик по локации: "${text}"`);
                return true;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.error(`Локация "${text}" не найдена`);
    return false;
}

// Функция поиска и клика по гексагону
async function clickHexagonWithPriority(priorities, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (!isScriptRunning) return false;

        console.log('Ищем гексагон по приоритетам...');

        for (const priority of priorities) {
            // Универсальный поиск для приоритетных сущностей (алтарь, сундук, чемпион, босс)
            if (priority.type === 'shrine' || priority.type === 'boss' || priority.type === 'champion' || priority.type === 'chest') {
                const targetUse = Array.from(document.querySelectorAll('use')).find(use => {
                    const href = use.getAttribute('xlink:href') || use.getAttribute('href');
                    return href === priority.selector.replace('use[xlink\\:href="', '').replace('"]', '');
                });

                if (targetUse) {
                    const hexagon = targetUse.closest('g.hex-box');
                    if (hexagon) {
                        console.log(`Найден гексагон с приоритетом: ${priority.type}`);
                        clickHexagon(hexagon);
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
                        console.log(`Найден гексагон с врагами: ${priority.value}`);
                        clickHexagon(hexagon);
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

    console.log('Клик выполнен по гексагону');
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
}

// Основной цикл
async function mainLoop() {

    await handleFullBackpack();
    const hexagonFound = await clickHexagonWithPriority(priorities);
    if (!hexagonFound) return;

    const transitionSuccess = await clickByTextContent('Перейти');
    if (!transitionSuccess) {
        console.error('Элемент с текстом "Перейти" не найден, проверяем текущий гексагон');

        // Проверяем, находится ли мы в текущем гексагоне
        const currentHexText = document.querySelector('div.hex-footer div.hex-current-text.ng-star-inserted');
        if (currentHexText && currentHexText.textContent.trim() === 'Вы здесь') {
            console.log('Находимся в текущем гексагоне, нажимаем на кнопку закрытия и начинаем бой');

            // Нажимаем на кнопку закрытия
            const closeButton = document.querySelector('tui-icon.svg-icon[style*="close.svg"]');
            if (closeButton) {
                closeButton.click();
                console.log('Кнопка закрытия нажата');
            } else {
                console.error('Кнопка закрытия не найдена');
                return;
            }

            // Начинаем бой
            await fightEnemies();
            return;
        }

        console.error('Не удалось определить текущий гексагон, продолжаем поиск');
        return;
    }

    const enemyAppeared = await waitForEnemy();
    if (!enemyAppeared) {
        console.error('Враг не появился, продолжаем поиск');
        return;
    }

    await fightEnemies();
}

// Функция ожидания появления врага
async function waitForEnemy(timeout = 7000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (!isScriptRunning) return false;

        const enemyIcon = document.querySelector('app-icon.profile-class tui-icon[style*="mob-class-"]');
        if (enemyIcon) {
            console.log('Враг появился');
            return true;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.error('Враг не появился за отведенное время');
    return false;
}

async function fightEnemies() {
    while (isScriptRunning) {
        const enemyIcon = document.querySelector('app-icon.profile-class tui-icon[style*="mob-class-"]');
        if (!enemyIcon) break;

        const enemiesCountElement = document.querySelector('div.battle-bar-enemies-value');
        if (enemiesCountElement && enemiesCountElement.textContent.trim() === '0') {
            break;
        }

        // Проверяем состояние маны и здоровья
        await checkManaAndHealth();

        // Используем навыки
        await useSkills([SKILLS.KICK, SKILLS.TAUNTING_STRIKE], [1.1, 1.3]);
    }
}

// Функция использования навыков
async function useSkills(skillOrder, activationTimes) {
    for (let i = 0; i < skillOrder.length; i++) {
        const skill = skillOrder[i];
        await useSkill(skill);
        await new Promise(resolve => setTimeout(resolve, activationTimes[i] * 1000));
    }
}

// Приоритеты
const priorities = [
    { type: 'boss', selector: '#boss' },
    { type: 'champion', selector: '#champion' },
    { type: 'chest', selector: '#chest' },
    { type: 'shrine', selector: '#shrine' },
    { type: 'enemies', value: '1' },
    { type: 'enemies', value: '2' }
];

// Навыки
const SKILLS = {
    KICK: 'assets/images/skills/1421a679ae40807f87b6d8677e316a1f.webp',
    TAUNTING_STRIKE: 'assets/images/skills/1491a679ae4080468358fcce4f0dfadd.webp',
    LIFE_LEECH: 'assets/images/skills/life-leech.webp' // Жажда жизни
};

// Функция использования Зелья маны
async function useManaPotion() {
    const manaPotionButton = document.querySelector('app-action-button .action-image[style*="potion-mana-epic"]');
    if (manaPotionButton) {
        manaPotionButton.click();
        console.log('Использовано Зелье маны');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Задержка для применения
    } else {
        console.error('Кнопка Зелья маны не найдена');
    }
}

// Функция использования Зелья здоровья
async function useHealthPotion() {
    const healthPotionButton = document.querySelector('app-action-button .action-image[style*="potion-health-epic"]');
    if (healthPotionButton) {
        healthPotionButton.click();
        console.log('Использовано Зелье здоровья');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Задержка для применения
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
            console.log('Мана ниже 50%, используем Зелье маны');
            await useManaPotion();
        }
    }

    // Проверка здоровья
    const healthElement = document.querySelector('app-general-stat.profile-health .stats-line');
    if (healthElement) {
        const healthPercentage = parseFloat(healthElement.style.transform.match(/-?\d+(\.\d+)?/)[0]);
        if (healthPercentage <= -50) { // Если здоровье <= 50%
            console.log('Здоровье ниже 50%, используем Зелье здоровья и Жажду жизни');
            await useHealthPotion();
            await useSkill(SKILLS.LIFE_LEECH); // Жажда жизни
        }
    }
}

// Функция использования навыка
async function useSkill(skill) {
    const skillButton = document.querySelector(`div.action-image[style*="${skill}"]`);
    if (skillButton) {
        skillButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Задержка для применения
    }
}

async function handleFullBackpack() {
    // Проверяем наличие иконки рюкзака в шапке
    const backpackIcon = document.querySelector('app-icon.header-backpack-icon tui-icon[style*="backpack.svg"]');
    if (!backpackIcon) {
        console.log('Иконка рюкзака не найдена');
        return;
    }

    // Проверяем, переполнен ли инвентарь (по иконке или тексту)
    const isBackpackFull = document.querySelector('div.backpack-capacity-danger') || 
                         backpackIcon.closest('app-icon').classList.contains('backpack-full');
    
    if (!isBackpackFull) {
        console.log('Инвентарь не переполнен');
        return;
    }

    console.log('Инвентарь переполнен, начинаем обработку...');

    try {
        // Нажимаем на кнопку "Портал"
        const portalButton = await waitForElement('app-button-icon[data-appearance="primary"] .button-icon-text', 'Портал', 5000);
        if (portalButton) {
            portalButton.click();
            console.log('Кнопка "Портал" нажата');
            await delay(10000);

            // Нажимаем на кнопку "Персонаж"
            const characterButton = await waitForElement('div.footer-button-content .footer-button-text', 'Персонаж', 5000);
            if (characterButton) {
                characterButton.click();
                console.log('Кнопка "Персонаж" нажата');

                // Ждем и активируем вкладку "Рюкзак"
                const backpackTab = await waitForElement('div.tab-content', 'Рюкзак', 5000);
                if (backpackTab) {
                    backpackTab.click();
                    console.log('Вкладка "Рюкзак" выбрана');

                    // Обрабатываем предметы
                    await processBackpackItems();
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
                return element;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return null;
}

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

    // Получаем все предметы
    const items = equipmentGroup.querySelectorAll('app-item-card.backpack-item');
    if (!items.length) {
        console.log('Предметы не найдены');
        return;
    }

    console.log(`Найдено ${items.length} предметов`);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.click();

        // Получаем диалоговое окно
        const dialog = document.querySelector('app-dialog-container.dialog-container-item');
        if (!dialog) {
            console.log('Диалог не открылся');
            continue;
        }

        console.log(`Обрабатываем предмет ${i + 1}`);

        // Проверяем параметры предмета
        let shouldSend = false;
        const reasons = [];

        // 1. Проверяем только магические свойства из item-magic-props
        const magicPropsContainer = dialog.querySelector('div.item-magic-props');
        if (magicPropsContainer) {
            const magicProps = magicPropsContainer.querySelectorAll('app-magic-prop');
            
            // Приоритетные статы для сохранения
            const priorityStats = ['Защита', 'Ловкость', 'Сила', 'Интеллект', 'Живучесть', 
                                 'Здоровье', 'Уклонение', 'Скрытность', 'Сопротивление'];
            
            // Нежелательные статы
            const unwantedStats = ['Пауза между атаками', 'Время активации'];
            
            let goodStatsCount = 0;
            
            for (const prop of magicProps) {
                const name = prop.querySelector('.magic-prop-name')?.textContent.trim();
                const percentText = prop.querySelector('.magic-prop-percent')?.textContent.trim();
                const percent = parseInt(percentText?.match(/\d+/)?.[0]) || 0;

                // Проверяем нежелательные статы
                if (unwantedStats.includes(name)) {
                    shouldSend = true;
                    reasons.push(`нежелательный стат: ${name}`);
                    break;
                }

                // Проверяем статы с высоким процентом (>100%)
                if (percent > 100) {
                    shouldSend = true;
                    reasons.push(`высокий процент: ${name} (${percent}%)`);
                    break;
                }

                // Считаем хорошие статы
                if (priorityStats.includes(name)) {
                    goodStatsCount++;
                }
            }

            // Проверяем эпические предметы с 3+ хорошими статами
            if (!shouldSend) {
                const isEpic = dialog.querySelector('.item-quality-epic');
                if (isEpic && goodStatsCount >= 3) {
                    shouldSend = true;
                    reasons.push(`эпический с ${goodStatsCount} хорошими статами`);
                }
            }
        }

        // Если нужно отправить в сундук
        if (shouldSend) {
            console.log(`Отправляем в сундук: ${reasons.join(', ')}`);
            const chestBtn = dialog.querySelector('app-button.put-in-chest-button');
            if (chestBtn) {
                chestBtn.click();
            } else {
                console.log('Кнопка "В сундук" не найдена');
            }
        }

        // Закрываем диалог
        const closeBtn = dialog.querySelector('tui-icon.svg-icon[style*="close.svg"]');
        if (closeBtn) {
            closeBtn.click();
        }
    }

    console.log('Обработка завершена');
}

// Вспомогательная функция для ожидания элемента
async function waitForElement(selector, text = null, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            if (!text || element.textContent.trim() === text) {
                return element;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return null;
}

// Создаем кнопку при загрузке страницы
createControlButton();