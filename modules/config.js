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
    SCRIPT_COMMIT: 'v.2.4',

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