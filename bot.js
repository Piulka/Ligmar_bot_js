let isScriptRunning = false; // Флаг для отслеживания состояния скрипта
let deaths = 0; // Количество смертей
let selectedLocation = 'Зеленые топи'; // Локация по умолчанию
let scriptPausedTime = 0; // Время, проведенное в паузе
let lastStartTime = Date.now(); // Время последнего запуска скрипта
let selectedClass = 'Лучник'; // Класс по умолчанию
let sellItemsSetting = 'Продавать вещи'; // По умолчанию
const SCRIPT_COMMIT = '1.19.1';

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
    settingsContainer.style.width = '170px';
    settingsContainer.style.background = 'linear-gradient(135deg, var(--black-dark) 85%, var(--gold-base) 100%)';
    settingsContainer.style.color = 'var(--white)';
    settingsContainer.style.border = '1.5px solid var(--gold-base)';
    settingsContainer.style.borderRadius = '12px';
    settingsContainer.style.padding = '10px 8px 8px 8px';
    settingsContainer.style.boxShadow = '0 6px 24px 0 rgba(0,0,0,0.18)';
    settingsContainer.style.zIndex = '1000';
    settingsContainer.style.display = 'none';
    settingsContainer.style.fontFamily = 'Segoe UI, Arial, sans-serif';
    settingsContainer.style.fontSize = '11px';
    settingsContainer.style.userSelect = 'none';

    // Заголовок
    const title = document.createElement('div');
    title.textContent = 'Настройки';
    title.style.fontSize = '13px';
    title.style.fontWeight = 'bold';
    title.style.color = 'var(--gold-base)';
    title.style.marginBottom = '8px';
    title.style.textAlign = 'center';
    settingsContainer.appendChild(title);

    // --- Универсальный генератор группы radio-переключателей ---
    function createRadioGroup({ label, name, options, selectedValue, onChange }) {
        const group = document.createElement('div');
        group.style.marginBottom = '10px';

        const groupLabel = document.createElement('div');
        groupLabel.textContent = label;
        groupLabel.style.fontWeight = '600';
        groupLabel.style.color = 'var(--gold-base)';
        groupLabel.style.fontSize = '11px';
        groupLabel.style.marginBottom = '3px';
        group.appendChild(groupLabel);

        const optionsContainer = document.createElement('div');
        optionsContainer.style.display = 'flex';
        optionsContainer.style.flexDirection = 'column';
        optionsContainer.style.gap = '3px';

        options.forEach(opt => {
            const optionLabel = document.createElement('label');
            optionLabel.style.display = 'flex';
            optionLabel.style.alignItems = 'center';
            optionLabel.style.cursor = 'pointer';
            optionLabel.style.padding = '2px 0';

            // Кастомная radio
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = name;
            radio.value = opt;
            radio.checked = selectedValue === opt;
            radio.style.accentColor = 'var(--gold-base)';
            radio.style.marginRight = '5px';
            radio.style.width = '12px';
            radio.style.height = '12px';
            radio.style.cursor = 'pointer';

            // Кастомный круглый чекбокс (поверх стандартного radio)
            const customRadio = document.createElement('span');
            customRadio.style.display = 'inline-block';
            customRadio.style.width = '12px';
            customRadio.style.height = '12px';
            customRadio.style.border = '1.5px solid var(--gold-base)';
            customRadio.style.borderRadius = '50%';
            customRadio.style.marginRight = '5px';
            customRadio.style.background = radio.checked ? 'var(--gold-base)' : 'transparent';
            customRadio.style.transition = 'background 0.2s, border 0.2s';

            // Скрыть стандартный radio, оставить только кастомный
            radio.style.opacity = '0';
            radio.style.position = 'absolute';

            // Текст опции
            const text = document.createElement('span');
            text.textContent = opt;
            text.style.color = radio.checked ? 'var(--gold-base)' : 'var(--white)';
            text.style.fontWeight = radio.checked ? '700' : '400';
            text.style.fontSize = '11px';

            // Обработка клика
            optionLabel.onclick = () => {
                // Снимаем выделение со всех radio в группе
                Array.from(optionsContainer.querySelectorAll('input[type="radio"]')).forEach(r => {
                    r.checked = false;
                    r.nextSibling.style.background = 'transparent';
                    r.nextSibling.nextSibling.style.color = 'var(--white)';
                    r.nextSibling.nextSibling.style.fontWeight = '400';
                });
                radio.checked = true;
                customRadio.style.background = 'var(--gold-base)';
                text.style.color = 'var(--gold-base)';
                text.style.fontWeight = '700';
                onChange(opt);
            };

            optionLabel.appendChild(radio);
            optionLabel.appendChild(customRadio);
            optionLabel.appendChild(text);

            optionsContainer.appendChild(optionLabel);
        });

        group.appendChild(optionsContainer);
        return group;
    }

    // --- Группа: Локация ---
    const locations = ['Пригород', 'Проклятый сад', 'Окраина леса', 'Озеро Королей', 'Зеленые топи', 'Старые рудники'];
    const locationGroup = createRadioGroup({
        label: 'Выбор локации',
        name: 'location',
        options: locations,
        selectedValue: selectedLocation,
        onChange: (val) => {
            selectedLocation = val;
            console.log(`Выбрана локация: ${selectedLocation}`);
        }
    });
    settingsContainer.appendChild(locationGroup);

    // --- Группа: Продажа вещей ---
    const sellOptions = ['Продавать вещи', 'Не продавать вещи'];
    const sellGroup = createRadioGroup({
        label: 'Продажа вещей',
        name: 'sell-setting',
        options: sellOptions,
        selectedValue: sellItemsSetting,
        onChange: (val) => {
            sellItemsSetting = val;
            console.log(`Настройка продажи изменена: ${sellItemsSetting}`);
        }
    });
    settingsContainer.appendChild(sellGroup);

    // --- Группа: Класс ---
    const classes = ['Воин', 'Убийца', 'Лучник'];
    const classGroup = createRadioGroup({
        label: 'Выбор класса',
        name: 'class',
        options: classes,
        selectedValue: selectedClass,
        onChange: (val) => {
            selectedClass = val;
            console.log(`Выбран класс: ${selectedClass}`);
        }
    });
    settingsContainer.appendChild(classGroup);

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
    // Удаляем старое окно, если оно есть
    const oldStats = document.getElementById('statistics-container');
    if (oldStats) oldStats.remove();
    const oldToggle = document.getElementById('statistics-toggle-btn');
    if (oldToggle) oldToggle.remove();

    // Контейнер статистики
    const statsContainer = document.createElement('div');
    statsContainer.id = 'statistics-container';
    statsContainer.style.position = 'fixed';
    statsContainer.style.top = '110px';
    statsContainer.style.right = '1px';
    statsContainer.style.zIndex = '1000';
    statsContainer.style.minWidth = '200px';
    statsContainer.style.maxWidth = '240px';
    statsContainer.style.background = 'linear-gradient(135deg, var(--black-dark) 85%, var(--gold-base) 100%)';
    statsContainer.style.border = '1.5px solid var(--gold-base)';
    statsContainer.style.borderRadius = '12px';
    statsContainer.style.boxShadow = '0 6px 24px 0 rgba(0,0,0,0.18)';
    statsContainer.style.padding = '14px 10px 10px 10px';
    statsContainer.style.fontFamily = 'Segoe UI, Arial, sans-serif';
    statsContainer.style.color = 'var(--white)';
    statsContainer.style.fontSize = '13px';
    statsContainer.style.transition = 'opacity 0.3s, visibility 0.3s';
    statsContainer.style.opacity = '0';
    statsContainer.style.visibility = 'hidden';
    statsContainer.style.overflow = 'hidden';
    statsContainer.style.userSelect = 'none';

    // Содержимое статистики
    const statsContent = document.createElement('div');
    statsContent.id = 'statistics-content';

    // Заголовок
    const header = document.createElement('div');
    header.style.fontSize = '15px';
    header.style.fontWeight = 'bold';
    header.style.color = 'var(--gold-base)';
    header.style.marginBottom = '10px';
    header.style.textAlign = 'center';
    header.textContent = 'Статистика';
    statsContent.appendChild(header);

    // Универсальный генератор строки-заголовка с крупным счетчиком и подчеркиванием
    function statHeaderRow(label, id) {
        return `
        <div style="display:flex;align-items:center;justify-content:space-between;margin:10px 0 0 0;
            border-bottom:1px solid var(--black-light);padding-bottom:2px;">
            <span style="font-weight:700;color:var(--gold-base);font-size:14px;">${label}</span>
            <span id="${id}" style="
                color:#fff;
                font-weight:800;
                font-size:21px;
                margin-left:8px;
            ">0</span>
        </div>`;
    }

    // Универсальный генератор подпункта
    function statSubRow(label, id) {
        return `
        <div style="display:flex;align-items:center;justify-content:space-between;
            padding:2px 0 2px 18px;
            border-bottom:1px solid var(--black-light);
            margin-bottom:2px;">
            <span style="color:var(--gray-light);font-size:12px;margin:0;padding:0;">${label}</span>
            <span id="${id}" style="
                display:inline-block;
                min-width:36px;
                text-align:right;
                color:#fff;
                font-weight:700;
                font-size:17px;
                margin-left:8px;
                background:none;
                border:none;
                border-radius:0;
                padding:0;
                box-shadow:none;
                transition:none;
            ">0</span>
        </div>`;
    }

    // Основная статистика (как заголовки)
    statsContent.innerHTML += statHeaderRow('Мобы', 'mobs-killed');
    statsContent.innerHTML += statHeaderRow('Чампы', 'champions-killed');
    statsContent.innerHTML += statHeaderRow('Смерти', 'deaths');

    // Оставлено (заголовок с выделением)
    statsContent.innerHTML += statHeaderRow('Оставлено', 'items-stored');
    statsContent.innerHTML += `
        <div style="margin-bottom:2px;">
            ${statSubRow('Древние', 'ancient-items')}
            ${statSubRow('ПМА/ВА', 'pma-va-items')}
            ${statSubRow('3+ стата', 'epic-stats-items')}
            ${statSubRow('Пухи', 'epic-weapons')}
            ${statSubRow('ГС > 650', 'high-gearscore-items')}
        </div>
    `;

    // Продано (заголовок с выделением)
    statsContent.innerHTML += statHeaderRow('Продано', 'items-sold');
    statsContent.innerHTML += `
        <div style="margin-bottom:2px;">
            ${statSubRow('Походы', 'sell-trips')}
        </div>
    `;

    // Время работы: подпись и таймер на новой строке в рамке
    statsContent.innerHTML += `
        <div style="margin-top:14px;">
            <div style="font-weight:600;color:var(--gold-base);font-size:13px;margin-bottom:4px;">Время работы:</div>
            <div style="
                padding:8px 10px;
                border:2px solid var(--gold-base);
                border-radius:8px;
                background:rgba(255,215,0,0.07);
                display:flex;
                align-items:center;
                justify-content:center;
            ">
                <span id="script-runtime" style="
                    color:#fff;
                    font-weight:800;
                    font-size:17px;
                ">0 сек</span>
            </div>
        </div>
    `;

    // Версия скрипта
    statsContent.innerHTML += `
        <div style="font-size:10px;color:var(--gray-light);text-align:right;margin-top:6px;">${typeof SCRIPT_COMMIT !== 'undefined' ? SCRIPT_COMMIT : ''}</div>
    `;

    statsContainer.appendChild(statsContent);

    // Кнопка сворачивания/разворачивания
    let isCollapsed = true;
    const toggleButton = document.createElement('button');
    toggleButton.id = 'statistics-toggle-btn';
    toggleButton.title = 'Показать/скрыть статистику';
    toggleButton.innerHTML = '<span style="font-size:16px;line-height:1;">+</span>';
    toggleButton.style.position = 'fixed';
    toggleButton.style.top = '50px';
    toggleButton.style.right = '20px';
    toggleButton.style.width = '20px';
    toggleButton.style.height = '20px';
    toggleButton.style.background = 'var(--gold-base)';
    toggleButton.style.color = 'var(--black-dark)';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.fontSize = '16px';
    toggleButton.style.fontWeight = 'bold';
    toggleButton.style.display = 'flex';
    toggleButton.style.alignItems = 'center';
    toggleButton.style.justifyContent = 'center';
    toggleButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
    toggleButton.style.zIndex = '1001';

    toggleButton.addEventListener('click', () => {
        if (isCollapsed) {
            statsContainer.style.opacity = '1';
            statsContainer.style.visibility = 'visible';
            toggleButton.innerHTML = '<span style="font-size:16px;line-height:1;">−</span>';
        } else {
            statsContainer.style.opacity = '0';
            statsContainer.style.visibility = 'hidden';
            toggleButton.innerHTML = '<span style="font-size:16px;line-height:1;">+</span>';
        }
        isCollapsed = !isCollapsed;
    });

    document.body.appendChild(statsContainer);
    document.body.appendChild(toggleButton);

    // Свернуто по умолчанию
    statsContainer.style.opacity = '0';
    statsContainer.style.visibility = 'hidden';
    toggleButton.innerHTML = '<span style="font-size:16px;line-height:1;">+</span>';

    await new Promise(resolve => setTimeout(resolve, 100));
}


function checkGearScore(dialog) {
    const gsElement = dialog.querySelector('.item-gearscore');
    if (!gsElement) return false;

    const gearScore = parseInt(gsElement.textContent.replace(/\D/g, ''), 10);
    if (gearScore > 650) {
        console.log(`Предмет с ГС ${gearScore} найден`);
        return true;
    }

    return false;
}

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
    let epicWeaponsStored = 0;
    let epicStatsItemsStored = 0;
    let highGearScoreItemsStored = 0;

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

        console.log(`Обрабатываем предмет ${i + 1}`);
        
        const isAncient = checkAncientItem(dialog);
        const isPmaVa = checkPmaVaItem(dialog);
        const isEpicWithStats = checkEpicItemWithStats(dialog);
        const isEpicWeapon = checkEpicWeapon(dialog);
        const hasHighGearScore = checkGearScore(dialog);

        if (isAncient || isPmaVa || isEpicWithStats || isEpicWeapon || hasHighGearScore) {
            const chestButton = dialog.querySelector('div.put-in-chest .button-content');
            if (chestButton && chestButton.textContent.trim() === 'В сундук') {
                chestButton.click();
                console.log('Вещь отправлена в сундук');
                itemsStoredInChest++;
                
                if (isAncient) ancientItemsStored++;
                if (isPmaVa) pmaVaItemsStored++;
                if (isEpicWithStats) epicStatsItemsStored++;
                if (isEpicWeapon) epicWeaponsStored++;
                if (hasHighGearScore) highGearScoreItemsStored++;
                
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
    epicStatsItems += epicStatsItemsStored;
    epicWeapons += epicWeaponsStored;
    highGearScoreItems += highGearScoreItemsStored;
    
    updateStatistics('items-stored', itemsStored);
    updateStatistics('ancient-items', ancientItems);
    updateStatistics('pma-va-items', pmaVaItems);
    updateStatistics('epic-stats-items', epicStatsItems);
    updateStatistics('epic-weapons', epicWeapons);

    const itemsSoldNow = itemsBeforeProcessing - itemsStoredInChest;
    itemsSold += itemsSoldNow;
    updateStatistics('items-sold', itemsSold);

    console.log(`Оставлено: ${itemsStoredInChest} (Древние: ${ancientItemsStored}, ПМА/ВА: ${pmaVaItemsStored}, 3+ стата: ${epicStatsItemsStored}, Пухи: ${epicWeaponsStored}, ГС > 650: ${highGearScoreItemsStored})`);
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
        const cityButton = document.querySelector('div.button-content');
        if (cityButton && cityButton.textContent.trim() === 'В город') {
            console.log('Найдена кнопка "В город", выполняем нажатие...');
            cityButton.click();
            await new Promise(resolve => setTimeout(resolve, 100));
            await delay(1000);

            // Обновляем статистику смертей
            stats.deaths++;
            updateStatisticsDisplay();
            console.log(`Смерть зафиксирована. Всего смертей: ${stats.deaths}`);

            // Возвращаемся к боям
            await clickByTextContent('Сражения');
            await new Promise(resolve => setTimeout(resolve, 100));
            await clickByLocationName(selectedLocation);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    } catch (error) {
        console.error('Ошибка в функции checkAndReturnToCity:', error);
    }
}
async function afterCombatProcessing(initialEnemyCount, isChampionHexagon = false) {
    // Обновляем статистику убийств
    stats.mobsKilled += initialEnemyCount;
    if (isChampionHexagon) {
        stats.championsKilled++;
    }
    updateStatisticsDisplay();
}

function initializeStatistics() {
    // Сбрасываем все значения
    stats = {
        mobsKilled: 0,
        championsKilled: 0,
        deaths: 0,
        items: {
            stored: 0,
            sold: 0,
            categories: {
                ancient: 0,
                pmaVa: 0,
                epicStats: 0,
                epicWeapons: 0,
                highGearScore: 0
            }
        },
        sellTrips: 0,
        scriptStartTime: Date.now(),
        lastPauseTime: 0,
        totalPausedTime: 0
    };
    
    updateStatisticsDisplay();
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

let stats = {
    mobsKilled: 0,
    championsKilled: 0,
    deaths: 0,
    items: {
        stored: 0,
        sold: 0,
        categories: {
            ancient: 0,
            pmaVa: 0,
            epicStats: 0,
            epicWeapons: 0,
            highGearScore: 0
        }
    },
    sellTrips: 0,
    scriptStartTime: Date.now(),
    lastPauseTime: 0,
    totalPausedTime: 0
};

function updateStatisticsDisplay() {
    // Основная статистика
    updateStatElement('mobs-killed', stats.mobsKilled);
    updateStatElement('champions-killed', stats.championsKilled);
    updateStatElement('deaths', stats.deaths);
    
    // Статистика предметов
    updateStatElement('items-stored', stats.items.stored);
    updateStatElement('ancient-items', stats.items.categories.ancient);
    updateStatElement('pma-va-items', stats.items.categories.pmaVa);
    updateStatElement('epic-stats-items', stats.items.categories.epicStats);
    updateStatElement('epic-weapons', stats.items.categories.epicWeapons);
    updateStatElement('high-gearscore-items', stats.items.categories.highGearScore);
    updateStatElement('items-sold', stats.items.sold);
    updateStatElement('sell-trips', stats.sellTrips);
    
    // Время работы
    updateRuntimeDisplay();
}

function updateRuntimeDisplay() {
    if (!isScriptRunning) {
        stats.lastPauseTime = Date.now();
        return;
    }

    // Если скрипт только что возобновил работу после паузы
    if (stats.lastPauseTime > 0) {
        stats.totalPausedTime += Date.now() - stats.lastPauseTime;
        stats.lastPauseTime = 0;
    }

    const runtimeInSeconds = Math.floor((Date.now() - stats.scriptStartTime - stats.totalPausedTime) / 1000);
    const hours = Math.floor(runtimeInSeconds / 3600);
    const minutes = Math.floor((runtimeInSeconds % 3600) / 60);
    const seconds = runtimeInSeconds % 60;

    const formattedTime = `${hours}ч ${minutes}м ${seconds}с`;
    updateStatElement('script-runtime', formattedTime);
}

// Обновление отдельного элемента статистики
function updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Специальный навык против чемпиона использован');
    }
    while (isScriptRunning) {
        const enemyIcon = document.querySelector('app-icon.profile-class tui-icon[style*="mob-class-"]');
        await checkAndReturnToCity();
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
    if (itemsBeforeProcessing === 0) {
        console.log('Предметы не найдены');
        return;
    }

    console.log(`Найдено ${itemsBeforeProcessing} предметов`);

    // Сбрасываем счетчики для текущей обработки
    const currentSessionStats = {
        stored: 0,
        ancient: 0,
        pmaVa: 0,
        epicStats: 0,
        epicWeapons: 0,
        highGearScore: 0
    };

    const items = equipmentGroup.querySelectorAll('app-item-card.backpack-item');
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.click();
        await new Promise(resolve => setTimeout(resolve, 300));

        const dialog = document.querySelector('app-dialog-container.dialog-container-item');
        if (!dialog) {
            console.log('Диалог не открылся');
            continue;
        }

        console.log(`Обрабатываем предмет ${i + 1}`);
        
        // Проверяем категории предмета
        const isAncient = checkAncientItem(dialog);
        const isPmaVa = checkPmaVaItem(dialog);
        const isEpicWithStats = checkEpicItemWithStats(dialog);
        const isEpicWeapon = checkEpicWeapon(dialog);
        const hasHighGearScore = checkGearScore(dialog);

        // Если предмет соответствует любой из категорий
        if (isAncient || isPmaVa || isEpicWithStats || isEpicWeapon || hasHighGearScore) {
            const chestButton = dialog.querySelector('div.put-in-chest .button-content');
            if (chestButton && chestButton.textContent.trim() === 'В сундук') {
                chestButton.click();
                console.log('Вещь отправлена в сундук');
                
                // Обновляем статистику
                currentSessionStats.stored++;
                if (isAncient) currentSessionStats.ancient++;
                if (isPmaVa) currentSessionStats.pmaVa++;
                if (isEpicWithStats) currentSessionStats.epicStats++;
                if (isEpicWeapon) currentSessionStats.epicWeapons++;
                if (hasHighGearScore) currentSessionStats.highGearScore++;
                
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        const closeBtn = dialog.querySelector('tui-icon.svg-icon[style*="close.svg"]');
        if (closeBtn) {
            closeBtn.click();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Обновляем глобальную статистику
    stats.items.stored += currentSessionStats.stored;
    stats.items.categories.ancient += currentSessionStats.ancient;
    stats.items.categories.pmaVa += currentSessionStats.pmaVa;
    stats.items.categories.epicStats += currentSessionStats.epicStats;
    stats.items.categories.epicWeapons += currentSessionStats.epicWeapons;
    stats.items.categories.highGearScore += currentSessionStats.highGearScore;
    
    // Рассчитываем количество проданных предметов
    const itemsSoldNow = itemsBeforeProcessing - currentSessionStats.stored;
    stats.items.sold += itemsSoldNow;
    
    // Обновляем отображение
    updateStatisticsDisplay();

    console.log(`Оставлено: ${currentSessionStats.stored} (Древние: ${currentSessionStats.ancient}, ПМА/ВА: ${currentSessionStats.pmaVa}, 3+ стата: ${currentSessionStats.epicStats}, Пухи: ${currentSessionStats.epicWeapons}, ГС > 650: ${currentSessionStats.highGearScore})`);
    console.log(`Продано: ${itemsSoldNow}`);

    if (sellItemsSetting === 'Продавать вещи') {
        stats.sellTrips++;
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

function checkEpicWeapon(dialog) {
    const qualityElement = dialog.querySelector('.item-quality');
    if (!qualityElement || !qualityElement.textContent.includes('Эпич')) {
        return false;
    }

    const itemTypeElement = dialog.querySelector('.item-name');
    if (!itemTypeElement) return false;

    const weaponTypes = [
        'Меч', 'Топор', 'Посох', 'Кинжал', 'Лук', 
        'Арбалет', 'Молот', 'Копье', 'Коса', 'Булава'
    ];

    return weaponTypes.some(type => itemTypeElement.textContent.includes(type));
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

function checkEpicItemWithStats(dialog) {
    const qualityElement = dialog.querySelector('.item-quality');
    if (!qualityElement || !qualityElement.textContent.includes('Эпич')) {
        return false;
    }

    const statsElements = dialog.querySelectorAll('.magic-prop-name');
    const requiredStats = [
        'Сила', 'Выживаемость', 'Ловкость', 'Уклонение', 'Скрытность',
        'Максимальный урон', 'Физ. атака', 'Живучесть', 'Защита',
        'Сопротивление', 'Интеллект', 'Здоровье', 'Точность', 'Требования', 'Мана', 'Меткость'
    ];

    let matchingStatsCount = 0;
    statsElements.forEach(statElement => {
        const statText = statElement.textContent.trim();
        if (requiredStats.some(required => statText.includes(required))) {
            matchingStatsCount++;
        }
    });

    // Добавляем логирование для отладки
    if (matchingStatsCount >= 3) {
        console.log(`Найден предмет с ${matchingStatsCount} подходящими статами:`, Array.from(statsElements).map(el => el.textContent.trim()));
    }

    return matchingStatsCount >= 3;
}

// Обновляем время работы каждые 5 секунд
setInterval(updateRuntimeDisplay, 5000);