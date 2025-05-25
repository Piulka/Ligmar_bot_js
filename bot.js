let isScriptRunning = false; // Флаг для отслеживания состояния скрипта
let deaths = 0; // Количество смертей
let selectedLocation = 'Зеленые топи'; // Локация по умолчанию
let scriptPausedTime = 0; // Время, проведенное в паузе
let lastStartTime = Date.now(); // Время последнего запуска скрипта
let selectedClass = 'Лучник'; // Класс по умолчанию
let sellItemsSetting = 'Продавать вещи'; // По умолчанию
let attackChampionsSetting = 'Атаковать чампов'; // По умолчанию атакуем чампов
let vipStatus = 'VIP'; // По умолчанию VIP
let dropModeStandard = true;
let dropModeCustom = false;
let dropFilters = {
    ancient: true,
    pmaVa: true,
    epicStats: true,
    highGearScore: true,
    custom: false
};
let dropStats = ['Сила', 'Ловкость', 'Интеллект', 'Защита', 'Сопротивление', 'Меткость', 'Здоровье', 'Живучесть', 'Мана', 'Уклонение', 'Скрытность', 'Максимальный урон', 'Физ. атака'];
let dropSelectedStats = ['Сила', 'Ловкость', 'Интеллект', 'Защита', 'Сопротивление', 'Меткость', 'Здоровье', 'Живучесть', 'Мана', 'Уклонение', 'Скрытность', 'Максимальный урон', 'Физ. атака'];
let dropStatsCount = 3;
let dropMinGearScore = 650;
let dropQuality = 'Эпические';
let dropSelectedTypes = [
    'Оружие', 'Плечи', 'Шея', 'Пояс', 'Палец', 'Ступни', 'Ноги', 'Руки', 'Грудь', 'Голова'
];
let dropPotionEnabled = false;

const SCRIPT_COMMIT = 'v.2.2';

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
        attack: [
            'assets/images/skills/1591a679ae40808cb79ff144baf28502.webp',
            'assets/images/skills/1591a679ae40808790d1dda8fe2e9779.webp',
            'assets/images/skills/1591a679ae40807a8b42fb31199a8297.webp',
            'assets/images/skills/1591a679ae4080c297f7d036916c3c06.webp'
        ],
        multitarget: 'assets/images/skills/1591a679ae4080169e8fedd380594e52.webp', // Мультискилл        heal: 'assets/images/skills/archer_heal_skill.webp',
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
    },
    'Маг': {
        attack: ['assets/images/skills/14b1a679ae4080b782ebf42072c73ab9.webp', 'assets/images/skills/14a1a679ae4080b4a37bedaec2d1c75e.webp', 'assets/images/skills/14b1a679ae4080b3931ccd0b9b0d7979.webp'],
        heal: null,
        buff: null
    }
};

// Функция для создания кнопки "Настройки"
async function createSettingsButton() {
    if (document.getElementById('settings-button')) return;

    // Ждем появления системного хедера
    let header = document.querySelector('app-system-header .header-relative');
    for (let i = 0; i < 30 && !header; i++) {
        await new Promise(r => setTimeout(r, 100));
        header = document.querySelector('app-system-header .header-relative');
    }
    if (!header) return;

    // Находим или создаем контейнер для кнопок по центру
    let centerContainer = header.querySelector('.header-center-controls');
    if (!centerContainer) {
        centerContainer = document.createElement('div');
        centerContainer.className = 'header-center-controls';
        centerContainer.style.display = 'flex';
        centerContainer.style.justifyContent = 'center';
        centerContainer.style.alignItems = 'center';
        centerContainer.style.gap = '10px';
        centerContainer.style.position = 'absolute';
        centerContainer.style.left = '50%';
        centerContainer.style.top = '0';
        centerContainer.style.transform = 'translateX(-50%)';
        centerContainer.style.height = '100%';
        centerContainer.style.zIndex = '1001';
        header.appendChild(centerContainer);
    }

    // --- Кнопка Настройки ---
    const baseWidth = 90;
    const baseHeight = 26;
    const button = document.createElement('button');
    button.id = 'settings-button';
    button.style.width = (baseWidth * 1.1) + 'px';   // +10%
    button.style.height = (baseHeight * 0.8) + 'px'; // +15%
    button.style.background = 'transparent';
    button.style.color = 'var(--gold-base)';
    button.style.border = '1.5px solid var(--gold-base)';
    button.style.borderRadius = '6px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '13px';
    button.style.fontWeight = 'bold';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = 'none';
    button.style.transition = 'background 0.2s, color 0.2s, border 0.2s, transform 0.12s cubic-bezier(.4,2,.6,1)';
    button.style.letterSpacing = '0.5px';
    button.style.fontFamily = 'Segoe UI, Arial, sans-serif';
    button.style.userSelect = 'none';
    button.style.outline = 'none';
    button.style.margin = '0';

    button.innerHTML = '<span style="font-size:15px;margin-right:6px;">⚙</span>Настройки';

    button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(255, 215, 0, 0.08)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.background = 'transparent';
    });

    // Анимация нажатия
    button.addEventListener('mousedown', () => {
        button.style.transform = 'scale(0.93)';
    });
    button.addEventListener('mouseup', () => {
        button.style.transform = 'scale(1)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', () => {
        const settingsContainer = document.getElementById('settings-container');
        if (!settingsContainer) return;
        if (settingsContainer.style.display === 'none' || settingsContainer.style.display === '') {
            settingsContainer.style.display = 'block';
            addOutsideClickListener(settingsContainer);
        } else {
            settingsContainer.style.display = 'none';
        }
    });

    // Добавляем кнопку в центр хедера (если еще не добавлена)
    if (!centerContainer.contains(button)) {
        centerContainer.appendChild(button);
    }
}

function addOutsideClickListener(container) {
    function handler(event) {
        // Если клик вне контейнера и не по кнопке настроек
        if (!container.contains(event.target) && event.target.id !== 'settings-button') {
            container.style.display = 'none';
            document.removeEventListener('mousedown', handler);
        }
    }
    // Удаляем старый обработчик, если есть
    document.removeEventListener('mousedown', handler);
    setTimeout(() => {
        document.addEventListener('mousedown', handler);
    }, 0);
}
// Функция для создания окна настроек
async function createSettingsWindow() {
    if (document.getElementById('settings-container')) return;

    const settingsContainer = document.createElement('div');
    settingsContainer.id = 'settings-container';
    settingsContainer.style.position = 'fixed';
    settingsContainer.style.top = '110px';
    settingsContainer.style.left = '10px'; // <-- изменено
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
        groupLabel.style.fontWeight = '700';
        groupLabel.style.color = 'var(--gold-base)';
        groupLabel.style.fontSize = '15px';
        groupLabel.style.marginBottom = '6px';
        groupLabel.style.textAlign = 'left';
        groupLabel.style.borderBottom = '1.5px solid var(--black-light)'; // Подчеркивание как в статистике
        groupLabel.style.paddingBottom = '2px'; // Отступ подчеркивания
        groupLabel.style.letterSpacing = '0.5px';
    
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
    
    // --- Группа: Дроп ---
    const dropGroup = document.createElement('div');
    dropGroup.style.marginBottom = '10px';

    const dropGroupLabel = document.createElement('div');
    dropGroupLabel.textContent = 'Дроп';
    dropGroupLabel.style.fontWeight = '700';
    dropGroupLabel.style.color = 'var(--gold-base)';
    dropGroupLabel.style.fontSize = '15px';
    dropGroupLabel.style.marginBottom = '6px';
    dropGroupLabel.style.textAlign = 'left';
    dropGroupLabel.style.borderBottom = '1.5px solid var(--black-light)';
    dropGroupLabel.style.paddingBottom = '2px';
    dropGroupLabel.style.letterSpacing = '0.5px';
    dropGroup.appendChild(dropGroupLabel);

    // Кнопка "Настроить"
    const dropSettingsBtn = document.createElement('button');
    dropSettingsBtn.textContent = 'Настроить';
    dropSettingsBtn.style.background = 'var(--gold-base)';
    dropSettingsBtn.style.color = 'var(--black-dark)';
    dropSettingsBtn.style.fontWeight = 'bold';
    dropSettingsBtn.style.border = 'none';
    dropSettingsBtn.style.borderRadius = '6px';
    dropSettingsBtn.style.padding = '4px 14px';
    dropSettingsBtn.style.cursor = 'pointer';
    dropSettingsBtn.style.fontSize = '13px';
    dropSettingsBtn.style.marginTop = '4px';
    dropSettingsBtn.onclick = showDropSettingsModal;
    dropGroup.appendChild(dropSettingsBtn);

    settingsContainer.appendChild(dropGroup);
    // --- Группа: Атаковать чампов ---
    const championAttackOptions = ['Атаковать чампов', 'Игнорировать чампов'];
    const championAttackGroup = createRadioGroup({
        label: 'Чампы',
        name: 'champion-attack-setting',
        options: championAttackOptions,
        selectedValue: attackChampionsSetting,
        onChange: (val) => {
            attackChampionsSetting = val;
            console.log(`Настройка атаки чампов: ${attackChampionsSetting}`);
        }
    });
    settingsContainer.appendChild(championAttackGroup);

    document.body.appendChild(settingsContainer);
    enableCloseOnOutsideClick('settings-container');

}

function enableCloseOnOutsideClick(containerId, onClose) {
    function handler(event) {
        const container = document.getElementById(containerId);
        if (!container) return;
        // Если клик вне контейнера
        if (!container.contains(event.target)) {
            container.style.display = 'none';
            if (onClose) onClose();
            document.removeEventListener('mousedown', handler);
        }
    }
    // Сначала удаляем старый обработчик (на всякий случай)
    document.removeEventListener('mousedown', handler);
    setTimeout(() => {
        document.addEventListener('mousedown', handler);
    }, 0);
}

function showDropSettingsModal() {
    // Удалить старое окно, если оно есть
    let oldModal = document.getElementById('drop-settings-modal');
    if (oldModal) oldModal.remove();

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

    // Заголовок
    const title = document.createElement('div');
    title.textContent = 'Настройки дропа';
    title.style.fontSize = '17px';
    title.style.fontWeight = 'bold';
    title.style.color = 'var(--gold-base)';
    title.style.marginBottom = '12px';
    title.style.textAlign = 'center';
    modal.appendChild(title);

    // --- Чекбоксы стандартных фильтров ---
    const filters = [
        { key: 'ancient', label: 'Древние' },
        { key: 'pmaVa', label: 'ПМА/ВА' },
        { key: 'epicStats', label: '3+ стата (мои личные настройки)' },
        { key: 'highGearScore', label: 'ГС > 650' }
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
        checkbox.checked = dropFilters[f.key];
        checkbox.style.marginRight = '6px';
        checkbox.onchange = () => {
            dropFilters[f.key] = checkbox.checked;
        };

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(f.label));
        modal.appendChild(label);
    });

    // --- Чекбокс кастомного фильтра ---
    const customLabel = document.createElement('label');
    customLabel.style.display = 'flex';
    customLabel.style.alignItems = 'center';
    customLabel.style.cursor = 'pointer';
    customLabel.style.fontSize = '13px';
    customLabel.style.marginBottom = '4px';

    const customCheckbox = document.createElement('input');
    customCheckbox.type = 'checkbox';
    customCheckbox.checked = dropFilters.custom;
    customCheckbox.style.marginRight = '6px';
    customCheckbox.onchange = () => {
        dropFilters.custom = customCheckbox.checked;
        customSettingsBlock.style.display = dropFilters.custom ? '' : 'none';
    };

    customLabel.appendChild(customCheckbox);
    customLabel.appendChild(document.createTextNode('Кастомные'));
    modal.appendChild(customLabel);

    // --- Кастомные настройки (по умолчанию скрыты) ---
    const customSettingsBlock = document.createElement('div');
    customSettingsBlock.style.margin = '10px 0 0 0';
    customSettingsBlock.style.padding = '10px 0 0 0';
    customSettingsBlock.style.borderTop = '1px solid var(--gold-base)';
    customSettingsBlock.style.display = dropFilters.custom ? '' : 'none';

    // --- Выбор типов вещей ---
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

    const allTypes = [
        'Оружие', 'Плечи', 'Шея', 'Пояс', 'Палец', 'Ступни', 'Ноги', 'Руки', 'Грудь', 'Голова'
    ];
    allTypes.forEach(type => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.cursor = 'pointer';
        label.style.fontSize = '13px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = type;
        checkbox.checked = dropSelectedTypes.includes(type);
        checkbox.style.marginRight = '4px';

        checkbox.onchange = () => {
            if (checkbox.checked) {
                if (!dropSelectedTypes.includes(type)) dropSelectedTypes.push(type);
            } else {
                dropSelectedTypes = dropSelectedTypes.filter(s => s !== type);
            }
        };

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(type));
        typesContainer.appendChild(label);
    });
    customSettingsBlock.appendChild(typesContainer);

    // --- Чекбокс для зелья ---
    const potionLabel = document.createElement('label');
    potionLabel.style.display = 'flex';
    potionLabel.style.alignItems = 'center';
    potionLabel.style.cursor = 'pointer';
    potionLabel.style.fontSize = '13px';
    potionLabel.style.marginBottom = '8px';

    const potionCheckbox = document.createElement('input');
    potionCheckbox.type = 'checkbox';
    potionCheckbox.checked = dropPotionEnabled;
    potionCheckbox.style.marginRight = '6px';
    potionCheckbox.onchange = () => {
        dropPotionEnabled = potionCheckbox.checked;
    };

    potionLabel.appendChild(potionCheckbox);
    potionLabel.appendChild(document.createTextNode('Зелье (класть все зелья)'));
    customSettingsBlock.appendChild(potionLabel);

    // --- Выбор статов ---
    const statsLabel = document.createElement('div');
    statsLabel.textContent = 'Статы для отбора:';
    statsLabel.style.fontWeight = '600';
    statsLabel.style.marginBottom = '4px';
    customSettingsBlock.appendChild(statsLabel);

    const statsContainer = document.createElement('div');
    statsContainer.style.display = 'flex';
    statsContainer.style.flexWrap = 'wrap';
    statsContainer.style.gap = '8px';
    statsContainer.style.marginBottom = '10px';

    dropStats.forEach(stat => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.cursor = 'pointer';
        label.style.fontSize = '13px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = stat;
        checkbox.checked = dropSelectedStats.includes(stat);
        checkbox.style.marginRight = '4px';

        checkbox.onchange = () => {
            if (checkbox.checked) {
                dropSelectedStats.push(stat);
            } else {
                dropSelectedStats = dropSelectedStats.filter(s => s !== stat);
            }
        };

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(stat));
        statsContainer.appendChild(label);
    });
    customSettingsBlock.appendChild(statsContainer);

    // --- Количество совпадений ---
    const countLabel = document.createElement('div');
    countLabel.textContent = 'Минимум совпадающих статов:';
    countLabel.style.fontWeight = '600';
    countLabel.style.marginBottom = '4px';
    customSettingsBlock.appendChild(countLabel);

    const countSelect = document.createElement('select');
    [1, 2, 3].forEach(num => {
        const option = document.createElement('option');
        option.value = num;
        option.textContent = num;
        if (dropStatsCount === num) option.selected = true;
        countSelect.appendChild(option);
    });
    countSelect.onchange = () => {
        dropStatsCount = parseInt(countSelect.value, 10);
    };
    countSelect.style.marginBottom = '10px';
    countSelect.style.fontSize = '13px';
    countSelect.style.padding = '2px 6px';
    customSettingsBlock.appendChild(countSelect);

    // --- Минимальный Gear Score ---
    const gsLabel = document.createElement('div');
    gsLabel.textContent = 'Минимальный Gear Score:';
    gsLabel.style.fontWeight = '600';
    gsLabel.style.margin = '8px 0 4px 0';
    customSettingsBlock.appendChild(gsLabel);

    const gsInput = document.createElement('input');
    gsInput.type = 'number';
    gsInput.value = dropMinGearScore;
    gsInput.min = 0;
    gsInput.style.width = '70px';
    gsInput.style.fontSize = '13px';
    gsInput.style.padding = '2px 6px';
    gsInput.style.background = '#fff';
    gsInput.style.color = '#222';
    gsInput.onchange = () => {
        dropMinGearScore = parseInt(gsInput.value, 10) || 0;
    };
    customSettingsBlock.appendChild(gsInput);

    // --- Качество предмета ---
    const qualityLabel = document.createElement('div');
    qualityLabel.textContent = 'Качество предмета:';
    qualityLabel.style.fontWeight = '600';
    qualityLabel.style.margin = '8px 0 4px 0';
    customSettingsBlock.appendChild(qualityLabel);

    const qualitySelect = document.createElement('select');
    ['Эпические', 'Все'].forEach(q => {
        const option = document.createElement('option');
        option.value = q;
        option.textContent = q;
        if (dropQuality === q) option.selected = true;
        qualitySelect.appendChild(option);
    });
    qualitySelect.onchange = () => {
        dropQuality = qualitySelect.value;
    };
    qualitySelect.style.fontSize = '13px';
    qualitySelect.style.padding = '2px 6px';
    customSettingsBlock.appendChild(qualitySelect);

    modal.appendChild(customSettingsBlock);

    // --- Кнопка "Сохранить" справа и закрывает окно ---
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Сохранить';
    saveBtn.style.marginTop = '16px';
    saveBtn.style.background = 'var(--gold-base)';
    saveBtn.style.color = 'var(--black-dark)';
    saveBtn.style.fontWeight = 'bold';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '6px';
    saveBtn.style.padding = '6px 18px';
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.float = 'right';
    saveBtn.onclick = () => {
        // Все значения уже обновляются onChange
        modal.remove(); // Закрыть окно
    };
    modal.appendChild(saveBtn);

    document.body.appendChild(modal);
    enableCloseOnOutsideClick('drop-settings-modal', () => {
        // Если нужно что-то еще при закрытии окна дропа — добавить здесь
    });
}
function checkDropCustomRules(dialog) {
    // Если выбрано "Зелье" — кладём все зелья, вне зависимости от статов и ГС
    if (dropPotionEnabled) {
        const tagDivs = dialog.querySelectorAll('.item-tags');
        for (const tagDiv of tagDivs) {
            if (tagDiv.textContent.trim() === 'Зелье') {
                return true;
            }
        }
    }

    // Проверка типа вещи
    if (dropSelectedTypes && dropSelectedTypes.length > 0) {
        const tagDivs = dialog.querySelectorAll('.item-tags');
        let hasType = false;
        for (const tagDiv of tagDivs) {
            if (dropSelectedTypes.includes(tagDiv.textContent.trim())) {
                hasType = true;
                break;
            }
        }
        if (!hasType) return false;
    }

    // Качество
    if (dropQuality === 'Эпические') {
        const qualityElement = dialog.querySelector('.item-quality');
        if (!qualityElement || !qualityElement.textContent.includes('Эпич')) {
            return false;
        }
    }
    // Gear Score
    if (dropMinGearScore > 0) {
        const gsElement = dialog.querySelector('.gear-score-value');
        if (!gsElement) return false;
        const gearScore = parseInt(gsElement.textContent.replace(/\D/g, ''), 10);
        if (gearScore < dropMinGearScore) return false;
    }
    // Совпадение статов
    const statsElements = dialog.querySelectorAll('.magic-prop-name');
    let matchingStatsCount = 0;
    statsElements.forEach(statElement => {
        const statText = statElement.textContent.trim();
        if (dropSelectedStats.some(required => statText.includes(required))) {
            matchingStatsCount++;
        }
    });
    return matchingStatsCount >= dropStatsCount;
}
function autoDetectVipStatus() {
    // Если есть иконка switch-auto.svg — VIP, если только switch.svg — не VIP
    const autoIcon = document.querySelector('tui-icon.svg-icon[style*="switch-auto.svg"]');
    if (autoIcon) return 'VIP';
    const switchIcon = document.querySelector('tui-icon.svg-icon[style*="switch.svg"]');
    if (switchIcon) return 'Не VIP';
    // Если ничего не найдено, по умолчанию VIP (или можно вернуть прошлое значение)
    return 'VIP';
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
    if (document.getElementById('control-button')) return;

    // Ждем появления системного хедера
    let header = document.querySelector('app-system-header .header-relative');
    for (let i = 0; i < 30 && !header; i++) {
        await new Promise(r => setTimeout(r, 100));
        header = document.querySelector('app-system-header .header-relative');
    }
    if (!header) return;

    // Находим или создаем контейнер для кнопок по центру
    let centerContainer = header.querySelector('.header-center-controls');
    if (!centerContainer) {
        centerContainer = document.createElement('div');
        centerContainer.className = 'header-center-controls';
        centerContainer.style.display = 'flex';
        centerContainer.style.justifyContent = 'center';
        centerContainer.style.alignItems = 'center';
        centerContainer.style.gap = '10px';
        centerContainer.style.position = 'absolute';
        centerContainer.style.left = '50%';
        centerContainer.style.top = '0';
        centerContainer.style.transform = 'translateX(-50%)';
        centerContainer.style.height = '100%';
        centerContainer.style.zIndex = '1001';
        header.appendChild(centerContainer);
    }

    // --- Кнопка Старт/Стоп ---
    const baseWidth = 68;
    const baseHeight = 26;
    const button = document.createElement('button');
    button.id = 'control-button';
    button.style.width = (baseWidth * 1.1) + 'px';   // +10%
    button.style.height = (baseHeight * 0.8) + 'px'; // +15%
    button.style.background = 'transparent';
    button.style.color = 'var(--gold-base)';
    button.style.border = '1.5px solid var(--gold-base)';
    button.style.borderRadius = '6px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '13px';
    button.style.fontWeight = 'bold';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = 'none';
    button.style.transition = 'background 0.2s, color 0.2s, border 0.2s, transform 0.12s cubic-bezier(.4,2,.6,1)';
    button.style.letterSpacing = '0.5px';
    button.style.fontFamily = 'Segoe UI, Arial, sans-serif';
    button.style.userSelect = 'none';
    button.style.outline = 'none';
    button.style.margin = '0';

    button.textContent = isScriptRunning ? '⏸ Стоп' : '▶ Старт';

    button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(255, 215, 0, 0.08)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.background = 'transparent';
    });

    // Анимация нажатия
    button.addEventListener('mousedown', () => {
        button.style.transform = 'scale(0.93)';
    });
    button.addEventListener('mouseup', () => {
        button.style.transform = 'scale(1)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', async () => {
        if (isScriptRunning) {
            isScriptRunning = false;
            button.textContent = '▶ Старт';
        } else {
            isScriptRunning = true;
            button.textContent = '⏸ Стоп';
            await runScript();
        }
    });

    // Добавляем кнопку в центр хедера (если еще не добавлена)
    if (!centerContainer.contains(button)) {
        centerContainer.appendChild(button);
    }
}


function detectPlayerClass() {
    // Ищем аватар игрока на экране боя
    const avatarImg = document.querySelector(
        'app-profile-avatar img[src*="portrait.webp"]'
    );
    if (!avatarImg) return selectedClass; // fallback

    const src = avatarImg.getAttribute('src');
    if (src.includes('warrior')) return 'Воин';
    if (src.includes('mage')) return 'Маг';
    if (src.includes('assassin')) return 'Убийца';
    return selectedClass; // fallback
}

// Функция для создания элемента статистики


async function createStatisticsElement() {
    // Удаляем старое окно, если оно есть
    const oldStats = document.getElementById('statistics-container');
    if (oldStats) oldStats.remove();

    // Новый контейнер статистики
    const statsContainer = document.createElement('div');
    statsContainer.id = 'statistics-container';
    statsContainer.style.display = 'flex';
    statsContainer.style.flexDirection = 'column';
    statsContainer.style.boxSizing = 'border-box';
    statsContainer.style.width = '320px';
    statsContainer.style.background = '#060315';
    statsContainer.style.border = '1px solid #060315';
    statsContainer.style.borderRadius = '3px';
    statsContainer.style.position = 'fixed';
    statsContainer.style.right = '0px';
    statsContainer.style.top = '163px';
    statsContainer.style.zIndex = '1002';
    statsContainer.style.color = 'var(--white)';
    statsContainer.style.fontFamily = 'Segoe UI, Arial, sans-serif';
    statsContainer.style.fontSize = '12px';
    statsContainer.style.opacity = '0'; // По умолчанию скрыто
    statsContainer.style.visibility = 'hidden';
    statsContainer.style.overflow = 'hidden';
    statsContainer.style.userSelect = 'none';
    statsContainer.style.boxShadow = '0 6px 24px 0 rgba(0,0,0,0.18)';
    statsContainer.style.padding = '0';
    statsContainer.style.marginBottom = '60px';
    statsContainer.style.maxHeight = 'none';

    // Верхняя часть: две колонки
    const mainRow = document.createElement('div');
    mainRow.style.display = 'flex';
    mainRow.style.flexDirection = 'row';
    mainRow.style.width = '100%';
    mainRow.style.padding = '10px 10px 0 10px';
    mainRow.style.boxSizing = 'border-box';

    // Левая колонка
    const leftColumn = document.createElement('div');
    leftColumn.style.flex = '1';
    leftColumn.style.minWidth = '110px';
    leftColumn.style.marginRight = '10px';

    // Правая колонка
    const rightColumn = document.createElement('div');
    rightColumn.style.flex = '1';
    rightColumn.style.minWidth = '110px';

    // --- Левая колонка ---
    leftColumn.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
            <span style="color:var(--gold-base);font-size:13px;">Мобов убито:</span>
            <span id="mobs-killed" style="color:#fff;font-weight:700;font-size:14px;">0</span>
        </div>
        <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
            <span style="color:var(--gold-base);font-size:13px;">Чемпионов убито:</span>
            <span id="champions-killed" style="color:#fff;font-weight:700;font-size:14px;">0</span>
        </div>
        <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
            <span style="color:var(--gold-base);font-size:13px;">Смертей:</span>
            <span id="deaths" style="color:#fff;font-weight:700;font-size:14px;">0</span>
        </div>
        <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
            <span style="color:var(--gold-base);font-size:13px;">Продано вещей: </span>
            <span id="items-sold" style="color:#fff;font-weight:700;font-size:14px;">0</span>
        </div>
        <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
            <span style="color:var(--gold-base);font-size:13px;">Кол-во походов в магазин:</span>
            <span id="sell-trips" style="color:#fff;font-weight:700;font-size:14px;">0</span>
        </div>
    `;

    // --- Правая колонка ---
    rightColumn.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
            <span style="color:var(--gold-base);font-size:13px;">Вещи в сундуке:</span>
            <span id="items-stored" style="color:#fff;font-weight:700;font-size:14px;">0</span>
        </div>
        <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
            <span style="color:var(--gray-light);font-size:11px;">Древние вещии</span>
            <span id="ancient-items" style="color:#fff;font-weight:600;font-size:13px;">0</span>
        </div>
        <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
            <span style="color:var(--gray-light);font-size:11px;">Вещи с ПМА или ВА:</span>
            <span id="pma-va-items" style="color:#fff;font-weight:600;font-size:13px;">0</span>
        </div>
        <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
            <span style="color:var(--gray-light);font-size:11px;">Топ вещи для лучника</span>
            <span id="epic-stats-items" style="color:#fff;font-weight:600;font-size:13px;">0</span>
        </div>
        <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
            <span style="color:var(--gray-light);font-size:11px;">Вещи с БМ больше 650:</span>
            <span id="high-gearscore-items" style="color:#fff;font-weight:600;font-size:13px;">0</span>
        </div>
        <div style="border-bottom:1px solid var(--black-light);margin:0 0 2px 0;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
            <span style="color:var(--gray-light);font-size:11px;">Кастомный дроп</span>
            <span id="custom-drop-items" style="color:#fff;font-weight:600;font-size:13px;">0</span>
        </div>
    `;

    mainRow.appendChild(leftColumn);
    mainRow.appendChild(rightColumn);

    // Нижняя часть: таймер по центру, без рамки, крупный, белый шрифт
    const bottomRow = document.createElement('div');
    bottomRow.style.display = 'flex';
    bottomRow.style.flexDirection = 'row';
    bottomRow.style.justifyContent = 'center';
    bottomRow.style.alignItems = 'center';
    bottomRow.style.width = '100%';
    bottomRow.style.padding = '12px 0 16px 0';
    bottomRow.style.boxSizing = 'border-box';
    bottomRow.style.background = 'rgba(0,0,0,0.10)';
    bottomRow.style.borderTop = '1px solid var(--black-light)';

    const runtimeBox = document.createElement('div');
    runtimeBox.style.display = 'inline-block';
    runtimeBox.style.padding = '0';
    runtimeBox.style.background = 'transparent';
    runtimeBox.style.border = 'none';
    runtimeBox.style.borderRadius = '0';
    runtimeBox.style.boxShadow = 'none';
    runtimeBox.style.fontSize = '28px';
    runtimeBox.style.fontWeight = 'bold';
    runtimeBox.style.color = '#fff';
    runtimeBox.style.textAlign = 'center';
    runtimeBox.style.letterSpacing = '1px';

    const runtimeDisplay = document.createElement('div');
    runtimeDisplay.id = 'script-runtime';
    runtimeDisplay.textContent = '0 сек';
    runtimeDisplay.style.color = '#fff';
    runtimeDisplay.style.fontSize = '28px';
    runtimeDisplay.style.fontWeight = 'bold';
    runtimeDisplay.style.textAlign = 'center';

    runtimeBox.appendChild(runtimeDisplay);
    bottomRow.appendChild(runtimeBox);

    // Собираем всё вместе
    statsContainer.appendChild(mainRow);
    statsContainer.appendChild(bottomRow);
    document.body.appendChild(statsContainer);

    // По умолчанию скрыто, открывается только через openStatisticsPanelAndAttach
    statsContainer.style.opacity = '0';
    statsContainer.style.visibility = 'hidden';

    await new Promise(resolve => setTimeout(resolve, 100));
}

function checkGearScore(dialog) {
    const gsElement = dialog.querySelector('.gear-score-value');
    if (!gsElement) return false;

    const gearScore = parseInt(gsElement.textContent.replace(/\D/g, ''), 10);
    if (gearScore > 650) {
        console.log(`Предмет с ГС ${gearScore} найден`);
        return true;
    }

    return false;
}

// Основной скрипт
async function runScript() {
    try {
        selectedClass = detectPlayerClass();
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

        let championHexes = [];
        if (attackChampionsSetting === 'Игнорировать чампов') {
            championHexes = Array.from(document.querySelectorAll('g.hex-box')).filter(hex => {
                return !!hex.querySelector('use[href="#champion"], use[xlink\\:href="#champion"]');
            });
        }

        for (const priority of priorities) {
            let hexagons = [];
            if (
                priority.type === 'champion' ||
                priority.type === 'shrine' ||
                priority.type === 'boss' ||
                priority.type === 'chest-epic' ||
                priority.type === 'chest-rare' ||
                priority.type === 'chest-common'
            ) {
                const targetUses = Array.from(document.querySelectorAll('use')).filter(use => {
                    const href = use.getAttribute('xlink:href') || use.getAttribute('href');
                    return href === priority.selector.replace('use[xlink\\:href="', '').replace('"]', '');
                });

                hexagons = targetUses.map(use => use.closest('g.hex-box'));
            }

            if (priority.type === 'enemies') {
                hexagons = Array.from(document.querySelectorAll('g.hex-box')).filter(hexagon => {
                    const textElement = hexagon.querySelector('text.enemies');
                    return textElement && textElement.textContent.trim() === String(priority.value);
                });
            }

            if (attackChampionsSetting === 'Игнорировать чампов' && championHexes.length > 0) {
                hexagons = hexagons.filter(hex => hex && !championHexes.includes(hex));
            }

            for (const hexagon of hexagons) {
                if (!hexagon) continue;
                // --- ДО захода на гексагон: если класс Лучник и (врагов 2+ или есть чемпион), используем мультискилл ---
                if (selectedClass === 'Лучник') {
                    const enemiesText = hexagon.querySelector('text.enemies');
                    const enemiesCount = enemiesText ? parseInt(enemiesText.textContent.trim(), 10) : 0;
                    const hasChampion = !!hexagon.querySelector('use[href="#champion"], use[xlink\\:href="#champion"]');
                    if (enemiesCount >= 2 || hasChampion) {
                        await useSkill(CLASS_SKILLS['Лучник'].multitarget);
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
                console.log(`Найден гексагон по приоритету: ${priority.type}`);
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
    selectedClass = detectPlayerClass();
    await checkBattleMembersAndClickMap();
    await new Promise(resolve => setTimeout(resolve, 100));

    await handleFullBackpack();
    await new Promise(resolve => setTimeout(resolve, 100));

    // --- Автоматически определяем VIP/Не VIP ---
    vipStatus = autoDetectVipStatus();

    // 1. Всегда ищем и переходим на гексагон по приоритету
    const hexagonFound = await clickHexagonWithPriority(getPriorities());
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
                    await new Promise(resolve => setTimeout(resolve, 100));
                } else {
                    console.error('Иконка автоматического режима не найдена');
                    return;
                }
                
                await fightEnemies();
            } else {
                console.error('Кнопка закрытия не найдена');
                return;
            }
            return;
        }
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // --- Автоматически определяем VIP/Не VIP перед боем ---
    vipStatus = autoDetectVipStatus();

    // 2. После перехода: логика для VIP и не-VIP
    if (vipStatus === 'VIP') {
        // Ждем появления врага стандартно
        const enemyAppeared = await waitForEnemy();
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!enemyAppeared) return;
        await fightEnemies();
        await new Promise(resolve => setTimeout(resolve, 100));
    } else {
        // Не VIP: крутим switch.svg до появления любого врага, если HP врага = 0 или если враг мертв (dead.svg)
        let enemyAppeared = false;
        let maxTries = 50; // чтобы не зациклиться
        while (!enemyAppeared && maxTries-- > 0 && isScriptRunning) {
            // Проверяем наличие врага
            const enemyCard = document.querySelector('app-profile-card.target');
            let needSwitch = false;

            if (enemyCard) {
                // Проверяем HP врага
                const hpText = enemyCard.querySelector('.profile-health .stats-text');
                if (hpText) {
                    // Пример: "0 / 1,678"
                    const hpMatch = hpText.textContent.trim().match(/^(\d+)\s*\/\s*[\d, ]+$/);
                    if (hpMatch && parseInt(hpMatch[1], 10) === 0) {
                        needSwitch = true;
                    }
                }
                // Проверяем статус "мертв" (dead.svg)
                const deadIcon = enemyCard.querySelector('tui-icon.svg-icon[style*="dead.svg"]');
                if (deadIcon) {
                    needSwitch = true;
                }
                if (!needSwitch) {
                    enemyAppeared = true;
                    break;
                }
            }

            // Если врага нет, HP=0 или враг мертв, жмем switch.svg
            const switchBtn = document.querySelector('div.button-icon-content tui-icon.svg-icon[style*="switch.svg"]');
            if (switchBtn) {
                switchBtn.closest('div.button-icon-content').click();
                await new Promise(resolve => setTimeout(resolve, 300));
            } else {
                // Если кнопка не найдена, возможно, нужно открыть меню или подождать
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        if (!enemyAppeared) {
            console.log('Враг не найден после переключений');
            return;
        }
        // После появления врага — бой
        await fightEnemies();
        await new Promise(resolve => setTimeout(resolve, 100));
    }
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

function getPriorities() {
    // Если выбрано "Игнорировать чампов", не включаем champion в приоритеты
    const basePriorities = [
        { type: 'chest-epic', selector: '#chest-epic' },
        { type: 'shrine', selector: '#shrine' },
        { type: 'chest-rare', selector: '#chest-rare' },
        { type: 'chest-epic', selector: '#chest-common' },
        { type: 'enemies', value: '1' },
        { type: 'enemies', value: '2' }
    ];
    if (attackChampionsSetting === 'Атаковать чампов') {
        // Champion в самом начале
        return [{ type: 'champion', selector: '#champion' }, ...basePriorities];
    }
    return basePriorities;
}

// Навыки
const SKILLS = {
    KICK: 'assets/images/skills/1421a679ae40807f87b6d8677e316a1f.webp',
    TAUNTING_STRIKE: 'assets/images/skills/1491a679ae4080468358fcce4f0dfadd.webp',
    LIFE_LEECH: 'assets/images/skills/1491a679ae408091bc22c1b4ff900728.webp',
    DEF_BUFF: 'assets/images/skills/1441a679ae4080e0ac0ce466631bc99e.webp',
    ASSASSIN_ATTACK: 'assets/images/icons/attack.webp'
};

async function checkBattleMembersAndClickMap() {
    // Проверяем наличие экрана с battle-members
    const battleMembers = document.querySelector('div.battle-members');
    if (battleMembers && battleMembers.offsetParent !== null) {
        // Ищем кнопку с иконкой map.svg
        const mapBtn = document.querySelector('div.button-icon-content tui-icon.svg-icon[style*="map.svg"]');
        if (mapBtn) {
            mapBtn.closest('div.button-icon-content').click();
            await new Promise(resolve => setTimeout(resolve, 200));
            console.log('Обнаружен экран battle-members, выполнен клик по карте');
            return true;
        }
    }
    return false;
}

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
            await claimRewardButton();

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

async function claimRewardButton(timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        // Ищем кнопку по тексту
        const rewardBtn = Array.from(document.querySelectorAll('div.button-content'))
            .find(btn => btn.textContent.trim() === 'Забрать награду');
        if (rewardBtn && rewardBtn.offsetParent !== null) {
            rewardBtn.click();
            await new Promise(resolve => setTimeout(resolve, 200));
            console.log('Кнопка "Забрать награду" нажата');
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    return false;
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
                highGearScore: 0,
                dropCustom: 0
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
    updateStatElement('high-gearscore-items', stats.items.categories.highGearScore);
    updateStatElement('custom-drop-items', stats.items.categories.dropCustom);
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
    vipStatus = autoDetectVipStatus();
    selectedClass = detectPlayerClass();
    let initialEnemyCount = 0;
    await checkBattleMembersAndClickMap();

    // Получаем количество врагов перед боем
    const enemiesCountElement = document.querySelector('div.battle-bar-enemies-value');
    if (enemiesCountElement) {
        initialEnemyCount = parseInt(enemiesCountElement.textContent.trim(), 10) || 0;
    }

    // --- Используем мультискилл лучника если врагов 2+ или есть чемпион ---
    if (selectedClass === 'Лучник') {
        // Проверяем есть ли чемпион на гексе (текущий гекс)
        let hasChampion = false;
        const currentHexagon = document.querySelector('g.hex-box.current');
        if (currentHexagon) {
            hasChampion = !!currentHexagon.querySelector('use[href="#champion"], use[xlink\\:href="#champion"]');
        }
        if (initialEnemyCount >= 2 || hasChampion) {
            await useSkill(CLASS_SKILLS['Лучник'].multitarget);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    if (isChampionHexagon && selectedClass === 'Лучник' && CLASS_SKILLS[selectedClass].championSkill) {
        await useSkill(CLASS_SKILLS[selectedClass].championSkill);
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Специальный навык против чемпиона использован');
    }

    while (isScriptRunning) {
        if (vipStatus === 'Не VIP') {
            const enemiesCountElement = document.querySelector('div.battle-bar-enemies-value');
            if (enemiesCountElement && enemiesCountElement.textContent.trim() === '0') {
                break;
            }

            let needSwitch = false;
            const enemyCard = document.querySelector('app-profile-card.target');
            if (enemyCard) {
                const hpText = enemyCard.querySelector('.profile-health .stats-text');
                if (hpText) {
                    const hpMatch = hpText.textContent.trim().match(/^(\d+)\s*\/\s*[\d, ]+$/);
                    if (hpMatch && parseInt(hpMatch[1], 10) === 0) {
                        needSwitch = true;
                    }
                }
                const deadIcon = enemyCard.querySelector('tui-icon.svg-icon[style*="dead.svg"]');
                if (deadIcon) {
                    needSwitch = true;
                }
            }
            if ((!enemyCard || needSwitch)) {
                const switchBtn = document.querySelector('div.button-icon-content tui-icon.svg-icon[style*="switch.svg"]');
                if (switchBtn) {
                    switchBtn.closest('div.button-icon-content').click();
                    await new Promise(resolve => setTimeout(resolve, 300));
                    continue;
                } else {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    continue;
                }
            }
        }

        const enemyIcon = document.querySelector('app-icon.profile-class tui-icon[style*="mob-class-"]');
        await checkAndReturnToCity();
        if (!enemyIcon) break;

        const enemiesCountElement2 = document.querySelector('div.battle-bar-enemies-value');
        if (enemiesCountElement2 && enemiesCountElement2.textContent.trim() === '0') {
            break;
        }

        // --- Во время боя: если класс Лучник и (врагов 2+ или есть чемпион), используем мультискилл ---
        if (selectedClass === 'Лучник') {
            let hasChampion = false;
            const currentHexagon = document.querySelector('g.hex-box.current');
            if (currentHexagon) {
                hasChampion = !!currentHexagon.querySelector('use[href="#champion"], use[xlink\\:href="#champion"]');
            }
            const enemiesCount = enemiesCountElement2 ? parseInt(enemiesCountElement2.textContent.trim(), 10) : 0;
            if (enemiesCount >= 2 || hasChampion) {
                await useSkill(CLASS_SKILLS['Лучник'].multitarget);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        await checkManaAndHealth();
        await new Promise(resolve => setTimeout(resolve, 100));
        await checkAndActivateDefenseBuff();
        await new Promise(resolve => setTimeout(resolve, 100));
        await useSkills([SKILLS.KICK, SKILLS.TAUNTING_STRIKE], [1.1, 1.3]);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    mobsKilled += initialEnemyCount;
    updateStatistics('mobs-killed', mobsKilled);

    if (isChampionHexagon) {
        championsKilled++;
        updateStatistics('champions-killed', championsKilled);
    }

    const isSpecial = await isSpecialHexagon();
    if (isSpecial) {
        await new Promise(resolve => setTimeout(resolve, 5000));
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
            await claimRewardButton();

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



async function processBackpackItems() {
    // --- Логирование настроек кастомного фильтра ---
    if (dropFilters.custom) {
        console.log('Текущие настройки кастомного фильтра:');
        console.log('  Минимальный Gear Score:', dropMinGearScore);
        console.log('  Минимум совпадающих статов:', dropStatsCount);
        console.log('  Качество:', dropQuality);
        console.log('  Выбранные статы:', dropSelectedStats.join(', '));
    }

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
        highGearScore: 0,
        dropCustom: 0
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
        let isAncient = false, isPmaVa = false, isEpicWithStats = false, hasHighGearScore = false, isDropCustom = false;
        if (dropFilters.ancient) isAncient = checkAncientItem(dialog);
        if (dropFilters.pmaVa) isPmaVa = checkPmaVaItem(dialog);
        if (dropFilters.epicStats) isEpicWithStats = checkEpicItemWithStats(dialog);
        if (dropFilters.highGearScore) hasHighGearScore = checkGearScore(dialog);
        if (dropFilters.custom) isDropCustom = checkDropCustomRules(dialog);

        // Логирование результата кастомного фильтра
        if (dropFilters.custom) {
            if (isDropCustom) {
                console.log(`Вещь ${i + 1}: ПОДХОДИТ под кастомный фильтр`);
            } else {
                console.log(`Вещь ${i + 1}: НЕ подходит под кастомный фильтр`);
            }
        }

        const shouldStore = (dropFilters.ancient && isAncient)
                         || (dropFilters.pmaVa && isPmaVa)
                         || (dropFilters.epicStats && isEpicWithStats)
                         || (dropFilters.highGearScore && hasHighGearScore)
                         || (dropFilters.custom && isDropCustom);

        if (shouldStore) {
            const chestButton = dialog.querySelector('div.put-in-chest .button-content');
            if (chestButton && chestButton.textContent.trim() === 'В сундук') {
                chestButton.click();
                console.log('Вещь отправлена в сундук');
                
                // Обновляем статистику
                currentSessionStats.stored++;
                if (isAncient) currentSessionStats.ancient++;
                if (isPmaVa) currentSessionStats.pmaVa++;
                if (isEpicWithStats) currentSessionStats.epicStats++;
                if (hasHighGearScore) currentSessionStats.highGearScore++;
                if (isDropCustom) currentSessionStats.dropCustom++;
                
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
    stats.items.categories.highGearScore += currentSessionStats.highGearScore;
    if (!stats.items.categories.dropCustom) stats.items.categories.dropCustom = 0;
    stats.items.categories.dropCustom += currentSessionStats.dropCustom;
    
    // Рассчитываем количество проданных предметов
    const itemsSoldNow = itemsBeforeProcessing - currentSessionStats.stored;
    stats.items.sold += itemsSoldNow;
    
    // Обновляем отображение
    updateStatisticsDisplay();

    console.log(`Оставлено: ${currentSessionStats.stored} (Древние: ${currentSessionStats.ancient}, ПМА/ВА: ${currentSessionStats.pmaVa}, 3+ стата: ${currentSessionStats.epicStats}, ГС > 650: ${currentSessionStats.highGearScore}, Кастомный дроп: ${currentSessionStats.dropCustom})`);
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
        'Сила', 'Ловкость', 'Уклонение', 'Скрытность',
        'Максимальный урон', 'Физ. атака'
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


(function() {
    let lastShrinkedPanel = null;
    let lastPanelVisible = false;

    function openStatisticsPanelAndAttach() {
        const statsContainer = document.getElementById('statistics-container');
        const mapWrapper = document.querySelector('.auto-map-wrapper');
        if (!statsContainer || !mapWrapper) return;
    
        // Показываем окно статистики
        statsContainer.style.opacity = '1';
        statsContainer.style.visibility = 'visible';
    
        // Позиционируем окно статистики справа от карты
        positionStatisticsPanel(statsContainer, mapWrapper);
    
        // Следим за изменением размера/позиции карты (например, при ресайзе окна)
        window.addEventListener('resize', () => positionStatisticsPanel(statsContainer, mapWrapper));
    }

    function closeStatisticsPanel() {
        const statsContainer = document.getElementById('statistics-container');
        if (!statsContainer) return;
    
        statsContainer.style.transition = 'none';
        statsContainer.style.opacity = '0';
        statsContainer.style.visibility = 'hidden';
    }

    

    function positionStatisticsPanel(statsContainer, mapWrapper) {
        // Получаем координаты и размеры карты
        const rect = mapWrapper.getBoundingClientRect();
    
        // Получаем контейнер battle-top
        const battleTop = document.querySelector('.battle-top.page-container.ng-tns-c3091494937-7');
        if (!battleTop) return;
        const battleRect = battleTop.getBoundingClientRect();
    
        // Высота окна статистики = высота карты (без дополнительных пикселей)
        const statsHeight = rect.height +10;
    
        // Левая граница окна статистики = правый край карты + 10px
        const statsLeft = rect.right + 10;
    
        // Правая граница окна статистики = правый край battle-top - 30px (оставляем ваш отступ)
        const statsRight = battleRect.right - 10;
    
        // Ширина окна статистики = statsRight - statsLeft
        const statsWidth = Math.max(0, statsRight - statsLeft);
    
        // Позиционируем statsContainer фиксировано справа от карты
        statsContainer.style.position = 'fixed';
        statsContainer.style.left = statsLeft + 'px';
        statsContainer.style.top = (rect.top - 5) + 'px'; // на 5px ниже карты
        statsContainer.style.width = statsWidth + 'px';
        statsContainer.style.height = statsHeight + 'px';
        statsContainer.style.minWidth = statsWidth + 'px';
        statsContainer.style.maxWidth = statsWidth + 'px';
        statsContainer.style.minHeight = statsHeight + 'px';
        statsContainer.style.maxHeight = statsHeight + 'px';
        statsContainer.style.overflowY = 'auto';
        statsContainer.style.transition = 'left 0.7s cubic-bezier(.4,2,.6,1), width 0.7s cubic-bezier(.4,2,.6,1), height 0.7s cubic-bezier(.4,2,.6,1), opacity 0.3s, visibility 0.3s';
        statsContainer.style.zIndex = '1002';
    }
    

    function shrinkBattleMapPanel(panel) {
        if (!panel) return;
        if (lastShrinkedPanel === panel) return;
        lastShrinkedPanel = panel;

        const map = panel.querySelector('app-battle-map');
        if (!map) return;

        if (map.parentNode && map.parentNode.classList && map.parentNode.classList.contains('auto-map-wrapper')) {
            panel.style.transition = 'width 0.7s cubic-bezier(.4,2,.6,1), margin-right 0.7s cubic-bezier(.4,2,.6,1)';
            panel.style.marginRight = '240px';
            panel.style.width = '40%';
            // После анимации позиционируем статистику
            setTimeout(openStatisticsPanelAndAttach, 700);
            return;
        }

        const mapWrapper = document.createElement('div');
        mapWrapper.className = 'auto-map-wrapper';
        mapWrapper.style.width = '100%';
        mapWrapper.style.height = '100%';
        mapWrapper.style.overflow = 'hidden';

        map.parentNode.insertBefore(mapWrapper, map);
        mapWrapper.appendChild(map);

        panel.style.transition = 'width 0.7s cubic-bezier(.4,2,.6,1), margin-right 0.7s cubic-bezier(.4,2,.6,1)';
        panel.style.marginRight = '';
        panel.style.width = '';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                panel.style.marginRight = '240px';
                panel.style.width = '40%';
                // После анимации позиционируем статистику
                setTimeout(openStatisticsPanelAndAttach, 700);
            });
        });
    }

    // MutationObserver для отслеживания появления и исчезновения карты
    const observer = new MutationObserver(() => {
        const panel = document.querySelector('app-battle-middle-panel');
        const panelVisible = panel && panel.offsetParent !== null;

        if (panelVisible) {
            shrinkBattleMapPanel(panel);
            lastPanelVisible = true;
        } else if (lastPanelVisible) {
            closeStatisticsPanel();
            lastPanelVisible = false;
            lastShrinkedPanel = null;
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Если карта уже есть при загрузке
    const initialPanel = document.querySelector('app-battle-middle-panel');
    if (initialPanel && initialPanel.offsetParent !== null) {
        shrinkBattleMapPanel(initialPanel);
        lastPanelVisible = true;
    }
})();
