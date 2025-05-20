let isScriptRunning = false; // Флаг для отслеживания состояния скрипта
let deaths = 0; // Количество смертей
let selectedLocation = 'Зеленые топи'; // Локация по умолчанию
let scriptPausedTime = 0; // Время, проведенное в паузе
let lastStartTime = Date.now(); // Время последнего запуска скрипта
let selectedClass = 'Лучник'; // Класс по умолчанию
let sellItemsSetting = 'Продавать вещи'; // По умолчанию
const SCRIPT_COMMIT = '1.14';

// Навыки для каждого класса
const CLASS_SKILLS = {
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
        attack: ['assets/images/skills/1591a679ae4080169e8fedd380594e52.webp', 'assets/images/skills/1591a679ae40808cb79ff144baf28502.webp','assets/images/skills/1591a679ae40808790d1dda8fe2e9779.webp', 'assets/images/skills/1591a679ae40807a8b42fb31199a8297.webp', 'assets/images/skills/1591a679ae4080c297f7d036916c3c06.webp'],
        heal: 'assets/images/skills/archer_heal_skill.webp',
        championSkill: 'assets/images/skills/1591a679ae408027a26fc49c44136cc9.webp', // Добавлен специальный навык для чемпиона

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
    }
};

// Функция для создания кнопки "Настройки"
async function createSettingsButton() {
    if (document.getElementById('settings-button')) return;

    const button = document.createElement('button');
    button.id = 'settings-button';
    button.style.position = 'fixed';
    button.style.top = '80px';
    button.style.right = '20px';
    button.style.width = '20px';
    button.style.height = '20px';
    button.style.backgroundColor = 'var(--gold-base)';
    button.style.color = 'var(--black-dark)';
    button.style.border = 'none';
    button.style.borderRadius = '50%';
    button.style.cursor = 'pointer';
    button.style.fontSize = '20px';
    button.style.lineHeight = '20px';
    button.style.fontWeight = 'bold';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    button.style.zIndex = '1000';
    button.textContent = '⚙';

    button.addEventListener('click', () => {
        const settingsContainer = document.getElementById('settings-container');
        if (settingsContainer.style.display === 'none') {
            settingsContainer.style.display = 'block';
        } else {
            settingsContainer.style.display = 'none';
        }
    });

    document.body.appendChild(button);
    
}

// Функция для создания окна настроек
async function createSettingsWindow() {
    if (document.getElementById('settings-container')) return;

    const settingsContainer = document.createElement('div');
    settingsContainer.id = 'settings-container';
    settingsContainer.style.position = 'fixed';
    settingsContainer.style.top = '110px';
    settingsContainer.style.right = '0px';
    settingsContainer.style.width = '200px';
    settingsContainer.style.backgroundColor = 'var(--black-dark)';
    settingsContainer.style.color = 'var(--white)';
    settingsContainer.style.border = '2px solid var(--black-light)';
    settingsContainer.style.borderRadius = '10px';
    settingsContainer.style.padding = '10px';
    settingsContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    settingsContainer.style.zIndex = '1000';
    settingsContainer.style.display = 'none';

    const title = document.createElement('div');
    title.textContent = 'Настройки';
    title.style.fontSize = '16px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '10px';
    settingsContainer.appendChild(title);

    // Выпадающее меню для выбора локации
    const locationLabel = document.createElement('label');
    locationLabel.textContent = 'Выбор локации:';
    locationLabel.style.display = 'block';
    locationLabel.style.marginBottom = '5px';
    settingsContainer.appendChild(locationLabel);

    const locationSelect = document.createElement('select');
    locationSelect.id = 'location-select';
    locationSelect.style.width = '100%';
    locationSelect.style.padding = '5px';
    locationSelect.style.border = '1px solid var(--black-light)';
    locationSelect.style.borderRadius = '5px';
    locationSelect.style.backgroundColor = 'var(--black-light)';
    locationSelect.style.color = 'var(--white)';

    const locations = ['Пригород', 'Проклятый сад', 'Окраина леса', 'Озеро Королей', 'Зеленые топи', 'Старые рудники'];
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
    });

    locationSelect.value = selectedLocation;
    locationSelect.addEventListener('change', (event) => {
        selectedLocation = event.target.value;
        console.log(`Выбрана локация: ${selectedLocation}`);
    });

    settingsContainer.appendChild(locationSelect);
    
    // Добавляем выпадающий список для настроек продажи
    const sellSettingLabel = document.createElement('label');
    sellSettingLabel.textContent = 'Продажа вещей:';
    sellSettingLabel.style.display = 'block';
    sellSettingLabel.style.marginTop = '10px';
    sellSettingLabel.style.marginBottom = '5px';
    settingsContainer.appendChild(sellSettingLabel);

    const sellSettingSelect = document.createElement('select');
    sellSettingSelect.id = 'sell-setting-select';
    sellSettingSelect.style.width = '100%';
    sellSettingSelect.style.padding = '5px';
    sellSettingSelect.style.border = '1px solid var(--black-light)';
    sellSettingSelect.style.borderRadius = '5px';
    sellSettingSelect.style.backgroundColor = 'var(--black-light)';
    sellSettingSelect.style.color = 'var(--white)';

    const sellOptions = ['Продавать вещи', 'Не продавать вещи'];
    sellOptions.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option;
        optElement.textContent = option;
        sellSettingSelect.appendChild(optElement);
    });

    sellSettingSelect.value = sellItemsSetting;
    sellSettingSelect.addEventListener('change', (event) => {
        sellItemsSetting = event.target.value;
        console.log(`Настройка продажи изменена: ${sellItemsSetting}`);
    });

    settingsContainer.appendChild(sellSettingSelect);

    // Выпадающее меню для выбора класса
    const classLabel = document.createElement('label');
    classLabel.textContent = 'Выбор класса:';
    classLabel.style.display = 'block';
    classLabel.style.marginTop = '10px';
    classLabel.style.marginBottom = '5px';
    settingsContainer.appendChild(classLabel);

    const classSelect = document.createElement('select');
    classSelect.id = 'class-select';
    classSelect.style.width = '100%';
    classSelect.style.padding = '5px';
    classSelect.style.border = '1px solid var(--black-light)';
    classSelect.style.borderRadius = '5px';
    classSelect.style.backgroundColor = 'var(--black-light)';
    classSelect.style.color = 'var(--white)';

    const classes = ['Воин', 'Убийца', 'Лучник'];
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        classSelect.appendChild(option);
    });

    classSelect.value = selectedClass;
    classSelect.addEventListener('change', (event) => {
        selectedClass = event.target.value;
        console.log(`Выбран класс: ${selectedClass}`);
    });

    settingsContainer.appendChild(classSelect);
    document.body.appendChild(settingsContainer);
}

// Обновляем функцию выбора локации
async function clickByLocationName(text = selectedLocation, timeout = 500) {
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

// Создаем кнопки и окно настроек при загрузке страницы
createControlButton();
createStatisticsElement();
createSettingsButton();
createSettingsWindow();

// Функция для создания кнопки "Старт/Стоп"
async function createControlButton() {
    // Проверяем, существует ли уже кнопка
    if (document.getElementById('control-button')) {
        console.log('Кнопка "Старт/Стоп" уже существует');
        return;
    }

    const button = document.createElement('button');
    button.id = 'control-button';
    button.style.position = 'fixed';
    button.style.top = '20px';
    button.style.right = '20px';
    button.style.width = '20px'; // Размер кнопки
    button.style.height = '20px'; // Размер кнопки
    button.style.backgroundColor = 'var(--gold-base)';
    button.style.color = 'var(--black-dark)';
    button.style.border = 'none';
    button.style.borderRadius = '50%'; // Круглая форма
    button.style.cursor = 'pointer';
    button.style.fontSize = '10px'; // Уменьшен значок в 2 раза
    button.style.fontWeight = 'bold';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    button.style.zIndex = '1000';
    button.textContent = '▶'; // Значок "Старт" (треугольник)

    button.addEventListener('click', async () => {
        if (isScriptRunning) {
            isScriptRunning = false;
            button.textContent = '▶'; // Значок "Старт"
            button.style.backgroundColor = 'var(--gold-base)';
            console.log('Скрипт остановлен');
            lastStartTime = Date.now(); // Фиксируем время остановки
        } else {
            isScriptRunning = true;
            button.textContent = '⏸'; // Значок "Стоп" (пауза)
            button.style.backgroundColor = 'var(--red-light)';
            console.log('Скрипт запущен');
            lastStartTime = Date.now(); // Фиксируем время запуска
            await runScript();
        }
    });

    document.body.appendChild(button);
}
// Функция для создания элемента статистики
async function createStatisticsElement() {
    const statsContainer = document.createElement('div');
    statsContainer.id = 'statistics-container';
    statsContainer.style.position = 'fixed';
    statsContainer.style.top = '110px';
    statsContainer.style.right = '1px';
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

    // Изначально окно статистики свернуто
    statsContainer.style.opacity = '0';
    statsContainer.style.visibility = 'hidden';

    // Содержимое статистики
    const statsContent = document.createElement('div');
    statsContent.id = 'statistics-content';
    statsContent.style.transition = 'opacity 0.3s ease';
    statsContent.style.opacity = '1';

    statsContent.innerHTML = `
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: var(--gold-base);">Статистика:</div>
        <div style="display: flex; justify-content: space-between;">
            <span>Мобы:</span>
            <span id="mobs-killed" style="color: var(--green-light); font-weight: bold;">0</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
            <span>Чампы:</span>
            <span id="champions-killed" style="color: var(--purple-light); font-weight: bold;">0</span>
        </div>
        <div style="margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>Оставлено:</span>
                <span id="items-stored" style="color: var(--gold-light);">0</span>
            </div>
            <div style="margin-left: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--red-light);">- Древние:</span>
                    <span id="ancient-items" style="color: var(--red-light); font-weight: bold;">0</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--red-light);">- ПМА/ВА:</span>
                    <span id="pma-va-items" style="color: var(--red-light); font-weight: bold;">0</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--gold-light);">- 3+ стата:</span>
                    <span id="epic-stats-items" style="color: var(--gold-light); font-weight: bold;">0</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--purple-light);">- Пухи:</span>
                    <span id="epic-weapons" style="color: var(--purple-light); font-weight: bold;">0</span>
                </div>
            </div>
        </div>
        <div style="margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>Продано:</span>
                <span id="items-sold" style="color: var(--white-light);">0</span>
            </div>
            <div style="margin-left: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--white-light);">- Походы:</span>
                    <span id="sell-trips" style="color: var(--white-light); font-weight: bold;">0</span>
                </div>
            </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
            <span>Смерти:</span>
            <span id="deaths" style="color: var(--red-light); font-weight: bold;">0</span>
        </div>
        <div style="margin-top: 10px;">
            <span>Время работы:</span>
            <div id="script-runtime" style="color: var(--white-light); font-weight: bold;">0 сек</div>
        </div>
        <div style="font-size: 10px; color: var(--gray-light); text-align: right; margin-top: 5px;">${SCRIPT_COMMIT}</div>
    `;

    // Логика сворачивания/разворачивания
    let isCollapsed = true;
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '+';
    toggleButton.style.position = 'fixed';
    toggleButton.style.top = '50px';
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
    toggleButton.style.zIndex = '1001';

    toggleButton.addEventListener('click', () => {
        if (isCollapsed) {
            statsContainer.style.opacity = '1';
            statsContainer.style.visibility = 'visible';
            toggleButton.textContent = '-';
        } else {
            statsContainer.style.opacity = '0';
            statsContainer.style.visibility = 'hidden';
            toggleButton.textContent = '+';
        }
        isCollapsed = !isCollapsed;
    });

    statsContainer.appendChild(statsContent);
    document.body.appendChild(statsContainer);
    document.body.appendChild(toggleButton);
    await new Promise(resolve => setTimeout(resolve, 100));
}

// Переменные для хранения статистики
let epicStatsItems = 0;
let epicWeapons = 0;


// Обновляем статистику при добавлении вещей в сундук
async function processBackpackItems() {
    const equipmentGroup = Array.from(document.querySelectorAll('app-items-group')).find(group => {
        const nameElement = group.querySelector('.items-group-name');
        return nameElement && nameElement.textContent.trim() === 'Снаряжение';
    });

    if (!equipmentGroup) {
        console.error('Вкладка "Снаряжение" не найдена');
        return;
    }

    const itemsBeforeProcessing = equipmentGroup.querySelectorAll('app-item-card.backpack-item').length;
    let itemsStoredInChest = 0;
    let ancientItemsStored = 0;
    let pmaVaItemsStored = 0;
    let epicStatsItemsStored = 0;
    let epicWeaponsStored = 0;

    const items = equipmentGroup.querySelectorAll('app-item-card.backpack-item');
    if (!items.length) {
        console.log('Предметы не найдены');
        return;
    }

    console.log(`Найдено ${items.length} предметов`);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.click();
        await new Promise(resolve => setTimeout(resolve, 300));

        const dialog = document.querySelector('app-dialog-container.dialog-container-item');
        if (!dialog) {
            console.log('Диалог не открылся');
            continue;
        }

        const isAncient = checkAncientItem(dialog);
        const isPmaVa = checkPmaVaItem(dialog);
        const isEpicWithStats = checkEpicItemWithStats(dialog);
        const isEpicWeapon = checkEpicWeapon(dialog);

        if (isAncient || isPmaVa || isEpicWithStats || isEpicWeapon) {
            const chestButton = dialog.querySelector('div.put-in-chest .button-content');
            if (chestButton && chestButton.textContent.trim() === 'В сундук') {
                chestButton.click();
                itemsStoredInChest++;
                
                if (isAncient) ancientItemsStored++;
                if (isPmaVa) pmaVaItemsStored++;
                if (isEpicWithStats) epicStatsItemsStored++;
                if (isEpicWeapon) epicWeaponsStored++;
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        const closeBtn = dialog.querySelector('tui-icon.svg-icon[style*="close.svg"]');
        if (closeBtn) {
            closeBtn.click();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Обновляем все счетчики
    itemsStored += itemsStoredInChest;
    ancientItems += ancientItemsStored;
    pmaVaItems += pmaVaItemsStored;
    epicStatsItems += epicStatsItemsStored;
    epicWeapons += epicWeaponsStored;
    
    updateStatistics('items-stored', itemsStored);
    updateStatistics('ancient-items', ancientItems);
    updateStatistics('pma-va-items', pmaVaItems);
    updateStatistics('epic-stats-items', epicStatsItems);
    updateStatistics('epic-weapons', epicWeapons);

    const itemsSoldNow = itemsBeforeProcessing - itemsStoredInChest;
    itemsSold += itemsSoldNow;
    updateStatistics('items-sold', itemsSold);

    console.log(`Оставлено: ${itemsStoredInChest} (Древние: ${ancientItemsStored}, ПМА/ВА: ${pmaVaItemsStored}, 3+ стата: ${epicStatsItemsStored}, Пухи: ${epicWeaponsStored})`);
    console.log(`Продано: ${itemsSoldNow}`);

    if (sellItemsSetting === 'Продавать вещи') {
        await navigateToSellItems();
    }
}

// Основной скрипт
async function runScript() {
    try {
        await clickByTextContent('Сражения');
        await new Promise(resolve => setTimeout(resolve, 100));
        await clickByLocationName(selectedLocation);
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

        const aimIcon = document.querySelector('tui-icon.svg-icon[style*="aim.svg"]');
        if (aimIcon) {
            aimIcon.click();
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        for (const priority of priorities) {
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

                        if (priority.type === 'champion') {
                            await fightEnemies(true);
                        } else {
                            await fightEnemies(false);
                        }

                        return true;
                    }
                }
            }

            if (priority.type === 'enemies') {
                const hexagons = Array.from(document.querySelectorAll('g.hex-box')).filter(hexagon => {
                    const textElement = hexagon.querySelector('text.enemies');
                    return textElement && textElement.textContent.trim() === String(priority.value);
                });

                if (hexagons.length > 0) {
                    // Всегда выбираем случайный гексагон
                    const selectedHexagon = hexagons[Math.floor(Math.random() * hexagons.length)];
                    clickHexagon(selectedHexagon);
                    await new Promise(resolve => setTimeout(resolve, 100));
                    await fightEnemies(false);
                    return true;
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

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
    checkAndReturnToCity();
    await new Promise(resolve => setTimeout(resolve, 100));

    await handleFullBackpack();
    await new Promise(resolve => setTimeout(resolve, 100));
    const hexagonFound = await clickHexagonWithPriority(priorities);
    if (!hexagonFound) return;

    const transitionSuccess = await clickByTextContent('Перейти');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!transitionSuccess) {
        const currentHexText = document.querySelector('div.hex-footer div.hex-current-text.ng-star-inserted');
        if (currentHexText && currentHexText.textContent.trim() === 'Вы здесь') {
            const closeButton = document.querySelector('tui-icon.svg-icon[style*="close.svg"]');
            if (closeButton) {
                closeButton.click();
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Нажимаем на иконку автоматического режима
                const autoSwitchIcon = document.querySelector(
                    'tui-icon.svg-icon[style*="switch-auto.svg"]'
                );
                
                if (autoSwitchIcon) {
                    autoSwitchIcon.click();
                    await new Promise(resolve => setTimeout(resolve, 100)); // Добавлен await
                } else {
                    console.error('Иконка автоматического режима не найдена');
                    return;
                }
                
                await fightEnemies(); // Добавлен await
            } else {
                console.error('Кнопка закрытия не найдена');
                return;
            }
            return;
        }
        return;
    }

    const enemyAppeared = await waitForEnemy();
    await new Promise(resolve => setTimeout(resolve, 100));
    if (!enemyAppeared) return;

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

    // Находим текущий гексагон (где находится игрок)
    const currentHexagon = document.querySelector('g.hex-box.current');
    if (!currentHexagon) {
        return false;
    }

    // Ищем специальные сущности (алтарь или сундук) только в текущем гексагоне
    const specialEntities = Array.from(currentHexagon.querySelectorAll('use')).find(use => {
        const href = use.getAttribute('href') || use.getAttribute('xlink:href');
        return href && (href.includes('shrine') || href.includes('chest'));
    });

    if (specialEntities) {
        return true;
    }

    return false;
}

// Функция использования навыков
async function useSkills() {
    const skills = CLASS_SKILLS[selectedClass];
    if (!skills) return;

    // Используем атакующие навыки
    if (skills.attack && skills.attack.length) {
        for (const skill of skills.attack) {
            await useSkill(skill);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

// Приоритеты
const priorities = [
    { type: 'champion', selector: '#champion' },
    { type: 'chest-epic', selector: '#chest-epic' },
    { type: 'shrine', selector: '#shrine' },
    { type: 'chest-rare', selector: '#chest-rare' },
    { type: 'chest-epic', selector: '#chest-common' },
    { type: 'enemies', value: '1' },
    { type: 'enemies', value: '2' }
];

// Навыки
const SKILLS = {
    KICK: 'assets/images/skills/1421a679ae40807f87b6d8677e316a1f.webp',
    TAUNTING_STRIKE: 'assets/images/skills/1491a679ae4080468358fcce4f0dfadd.webp',
    LIFE_LEECH: 'assets/images/skills/1491a679ae408091bc22c1b4ff900728.webp',
    DEF_BUFF: 'assets/images/skills/1441a679ae4080e0ac0ce466631bc99e.webp',
    ASSASSIN_ATTACK: 'assets/images/icons/attack.webp'
};

// Функция проверки и активации DEF_BUFF
async function checkAndActivateDefenseBuff() {
    const skills = CLASS_SKILLS[selectedClass];
    if (!skills || !skills.buff) return;
    
    try {
        // Для лучника проверяем оба баффа
        if (selectedClass === 'Лучник') {
            // Проверяем первый бафф (увеличение магического урона)
            const magicDamageBuff = document.querySelector('tui-icon.svg-icon[style*="magicGearDamageArcher.svg"]');
            if (!magicDamageBuff && skills.buff[0]) {
                await useSkill(skills.buff[0].skill);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // Проверяем второй бафф (увеличение уклонения)
            const evasionBuff = document.querySelector('tui-icon.svg-icon[style*="upEvasionArcher.svg"]');
            if (!evasionBuff && skills.buff[1]) {
                await useSkill(skills.buff[1].skill);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } 
        // Для воина оставляем старую логику
        else if (selectedClass === 'Воин') {
            const defenseIcon = document.querySelector('tui-icon.svg-icon[style*="upDefenseWarrior.svg"]');
            if (!defenseIcon && skills.buff) {
                await useSkill(skills.buff);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    } catch(error) {
        console.error('Ошибка при активации баффа:', error);
    }
}
// Функция использования любого зелья здоровья
async function useHealthPotion() {
    const healthPotionButtons = [
        'potion-health-epic',  // Эпическое
        'potion-health-rare',  // Рарное
        'potion-health-common' // Обычное
    ];

    for (const potion of healthPotionButtons) {
        const potionButton = document.querySelector(`app-action-button .action-image[style*="${potion}"]`);
        if (potionButton) {
            potionButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
        }
    }
    console.log('Не найдено зелий здоровья');
    return false;
}

async function useManaPotion() {
    const manaPotionButtons = [
        'potion-mana-epic',   // Эпическое
        'potion-mana-rare',   // Рарное
        'potion-mana-common'  // Обычное
    ];

    for (const potion of manaPotionButtons) {
        const potionButton = document.querySelector(`app-action-button .action-image[style*="${potion}"]`);
        if (potionButton) {
            potionButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            return true;
        }
    }
    console.log('Не найдено зелий маны');
    return false;
}

// Функция проверки маны и здоровья
async function checkManaAndHealth() {
    // Проверка здоровья для всех классов
    const healthElement = document.querySelector('app-general-stat.profile-health .stats-line');
    if (healthElement) {
        const healthPercentage = parseFloat(healthElement.style.transform.match(/-?\d+(\.\d+)?/)[0]);
        if (healthPercentage <= -20) {
            await useHealthPotion(); // Будет использовать любое доступное зелье
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (CLASS_SKILLS[selectedClass]?.heal) {
                await useSkill(CLASS_SKILLS[selectedClass].heal);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }

    // Проверка маны для классов, у которых есть навыки
    if (CLASS_SKILLS[selectedClass]?.attack || CLASS_SKILLS[selectedClass]?.heal || CLASS_SKILLS[selectedClass]?.buff) {
        const manaElement = document.querySelector('app-general-stat.profile-mana .stats-line-mana');
        if (manaElement) {
            const manaPercentage = parseFloat(manaElement.style.transform.match(/-?\d+(\.\d+)?/)[0]);
            if (manaPercentage <= -50) {
                await useManaPotion(); // Будет использовать любое доступное зелье
                await new Promise(resolve => setTimeout(resolve, 100));
            }
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
    const backpackIcon = document.querySelector('app-icon.header-backpack-icon tui-icon[style*="backpack.svg"]');
    if (!backpackIcon) return;

    const isBackpackFull = document.querySelector('div.backpack-capacity-danger') || 
                         backpackIcon.closest('app-icon').classList.contains('backpack-full');
    
    if (!isBackpackFull) return;

    console.log('Инвентарь переполнен, начинаем обработку...');

    try {
        // Нажимаем на кнопку "Портал"
        const portalButton = await waitForElement('app-button-icon[data-appearance="primary"] .button-icon-text', 'Портал', 5000);
        if (portalButton) {
            portalButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('Кнопка "Портал" нажата');
            await delay(10000);

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

                    // Проверяем настройку продажи
                    if (sellItemsSetting === 'Не продавать вещи') {
                        console.log('Режим "Не продавать вещи" - скрипт приостановлен');
                        
                        // Ставим скрипт на паузу
                        const controlButton = document.getElementById('control-button');
                        if (controlButton) {
                            controlButton.click(); // Эмулируем нажатие кнопки остановки
                        }
                        
                        // Можно добавить уведомление
                        alert('Рюкзак полон! Скрипт приостановлен. Режим "Не продавать вещи"');
                        return;
                    }
                    
                    // Продолжаем обычную обработку для режима "Продавать вещи"
                    await processBackpackItems();
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
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
                await clickByLocationName(selectedLocation);
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

function updateScriptRuntime() {
    if (!isScriptRunning) {
        // Если скрипт на паузе, фиксируем время паузы
        scriptPausedTime += Date.now() - lastStartTime;
        lastStartTime = Date.now(); // Обновляем время последней фиксации
        return;
    }

    // Вычисляем общее время работы скрипта
    const runtimeInSeconds = Math.floor((Date.now() - scriptStartTime - scriptPausedTime) / 1000);
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

    if (isChampionHexagon && selectedClass === 'Лучник' && CLASS_SKILLS[selectedClass].championSkill) {
        await useSkill(CLASS_SKILLS[selectedClass].championSkill);
        console.log('Специальный навык против чемпиона использован');
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

    // Проверяем, есть ли на гексагоне алтарь или сундук
    const isSpecial = await isSpecialHexagon();
    if (isSpecial) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Ожидание 5 секунд
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
    const equipmentGroup = Array.from(document.querySelectorAll('app-items-group')).find(group => {
        const nameElement = group.querySelector('.items-group-name');
        return nameElement && nameElement.textContent.trim() === 'Снаряжение';
    });

    if (!equipmentGroup) {
        console.error('Вкладка "Снаряжение" не найдена');
        return;
    }

    const itemsBeforeProcessing = equipmentGroup.querySelectorAll('app-item-card.backpack-item').length;
    let itemsStoredInChest = 0;
    let ancientItemsStored = 0;
    let pmaVaItemsStored = 0;
    let epicItemsStored = 0;
    let epicWeaponsStored = 0;

    const items = equipmentGroup.querySelectorAll('app-item-card.backpack-item');
    if (!items.length) {
        console.log('Предметы не найдены');
        return;
    }

    console.log(`Найдено ${items.length} предметов`);

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.click();
        await new Promise(resolve => setTimeout(resolve, 300)); // Увеличили задержку

        const dialog = document.querySelector('app-dialog-container.dialog-container-item');
        if (!dialog) {
            console.log('Диалог не открылся');
            continue;
        }

        console.log(`Обрабатываем предмет ${i + 1}`);
        
        const isAncient = checkAncientItem(dialog);
        const isPmaVa = checkPmaVaItem(dialog);
        const isEpicWithStats = checkEpicItemWithStats(dialog);
        const isEpicWeapon = checkEpicWeapon(dialog);

        if (isAncient || isPmaVa || isEpicWithStats || isEpicWeapon) {
            const chestButton = dialog.querySelector('div.put-in-chest .button-content');
            if (chestButton && chestButton.textContent.trim() === 'В сундук') {
                chestButton.click();
                console.log('Вещь отправлена в сундук');
                itemsStoredInChest++;
                
                if (isAncient) ancientItemsStored++;
                if (isPmaVa) pmaVaItemsStored++;
                if (isEpicWithStats) epicItemsStored++;
                if (isEpicWeapon) epicWeaponsStored++;
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        const closeBtn = dialog.querySelector('tui-icon.svg-icon[style*="close.svg"]');
        if (closeBtn) {
            closeBtn.click();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Обновляем статистику
    itemsStored += itemsStoredInChest;
    ancientItems += ancientItemsStored;
    pmaVaItems += pmaVaItemsStored;
    
    updateStatistics('items-stored', itemsStored);
    updateStatistics('ancient-items', ancientItems);
    updateStatistics('pma-va-items', pmaVaItems);

    const itemsSoldNow = itemsBeforeProcessing - itemsStoredInChest;
    itemsSold += itemsSoldNow;
    updateStatistics('items-sold', itemsSold);

    console.log(`Продано: ${itemsSoldNow}, Оставлено: ${itemsStoredInChest}`);
    console.log(`Из них: ${epicWeaponsStored} эпических оружий`);

    if (sellItemsSetting === 'Продавать вещи') {
        await navigateToSellItems();
    }
}

// Проверка, является ли предмет древним (>100%)
function checkAncientItem(dialog) {
    // Проверяем несколько возможных мест, где могут быть проценты
    const percentElements = [
        dialog.querySelector('.item-stats'),
        dialog.querySelector('.magic-prop-percent'),
        dialog.querySelector('.item-percent-value')
    ].filter(el => el); // Убираем null элементы
    
    for (const element of percentElements) {
        const text = element.textContent.trim();
        // Проверяем разные форматы процентов:
        // (>100%), 150%, +150%, >100% и т.д.
        if (text.match(/[>(]?\s*\d{3,}\s*%[<)]?/)) {
            const percentValue = parseInt(text.replace(/\D/g, ''), 10);
            if (percentValue > 100) {
                console.log(`Найден древний предмет: ${text}`);
                return true;
            }
        }
    }
    return false;
}

// Функция проверки, является ли предмет эпическим и имеет 3 стата из списка
function checkEpicItemWithStats(dialog) {
    const qualityElement = dialog.querySelector('.item-quality');
    if (!qualityElement || qualityElement.textContent.trim() !== 'Эпический') {
        return false;
    }

    const statsElements = dialog.querySelectorAll('.magic-prop-name');
    const requiredStats = [
        'Сила', 'Выживаемость', 'Ловкость', 'Уклонение', 'Скрытность',
        'Максимальный урон', 'Физ. атака', 'Живучесть', 'Защита',
        'Сопротивление', 'Интеллект', 'Здоровье', 'Точность', 'Требования', 'Мана', 'Меткость', 
    ];

    let matchingStatsCount = 0;
    statsElements.forEach(statElement => {
        if (requiredStats.includes(statElement.textContent.trim())) {
            matchingStatsCount++;
        }
    });

    return matchingStatsCount >= 3;
}

// Проверка, имеет ли предмет ПМА или ВА
function checkPmaVaItem(dialog) {
    const stats = dialog.querySelectorAll('.magic-prop-name');
    for (const stat of stats) {
        if (stat.textContent.includes('Пауза между атаками') || 
            stat.textContent.includes('Время активации')) {
            return true;
        }
    }
    return false;
}

function checkEpicWeapon(dialog) {
    const weaponTag = dialog.querySelector('.item-tags');
    if (!weaponTag || !weaponTag.textContent.includes('Оружие')) {
        return false;
    }

    const qualityElement = dialog.querySelector('.item-quality');
    if (!qualityElement || !qualityElement.textContent.includes('Эпич')) { // Ищем "Эпич" в начале
        return false;
    }

    const gearScoreElement = dialog.querySelector('.gear-score-value');
    if (gearScoreElement) {
        const gearScore = parseInt(gearScoreElement.textContent.trim(), 10);
        return !isNaN(gearScore) && gearScore > 550;
    }
    return false;
}
// Обновляем время работы скрипта каждые 5 секунд
setInterval(updateScriptRuntime, 5000);