/**
 * Ligmar Bot - Модульная версия
 * Главный файл-загрузчик модулей
 * Версия: v.3.6.1
 */

(async function() {
    'use strict';
    
    console.log('🤖 Ligmar Bot v.3.6.1 - Запуск модульной версии...');
    
    // Базовый URL для загрузки модулей
    const BASE_URL = 'https://raw.githubusercontent.com/Piulka/Ligmar_bot_js/main';
    
    // Список модулей для загрузки
    const MODULES = [
        'modules/config.js',
        'modules/utils.js', 
        'modules/ui.js',
        'modules/navigation.js',
        'modules/combat.js',
        'modules/inventory.js',
        'modules/statistics.js',
        'modules/gameLogic.js'
    ];
    
    /**
     * Загрузка и выполнение модуля
     * @param {string} moduleUrl - URL модуля
     */
    async function loadModule(moduleUrl) {
        try {
            const response = await fetch(`${BASE_URL}/${moduleUrl}?nocache=${Date.now()}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const code = await response.text();
            eval(code);
            console.log(`✅ Модуль загружен: ${moduleUrl}`);
        } catch (error) {
            console.error(`❌ Ошибка загрузки модуля ${moduleUrl}:`, error);
            throw error;
        }
    }
    
    /**
     * Последовательная загрузка всех модулей
     */
    async function loadAllModules() {
        console.log('📦 Загрузка модулей...');
        
        for (const module of MODULES) {
            await loadModule(module);
            // Небольшая задержка между загрузками
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('✅ Все модули загружены успешно!');
    }
    
    /**
     * Проверка загрузки всех модулей
     */
    function verifyModules() {
        const requiredModules = [
            'BotConfig',
            'BotSecurity',
            'BotUtils', 
            'BotUI',
            'BotNavigation',
            'BotCombat',
            'BotInventory',
            'BotStatistics',
            'BotGameLogic'
        ];
        
        const missingModules = requiredModules.filter(module => !window[module]);
        
        if (missingModules.length > 0) {
            console.error('❌ Отсутствуют модули:', missingModules);
            return false;
        }
        
        console.log('✅ Все модули проверены и готовы к работе');
        return true;
    }
    
    /**
     * Инициализация бота
     */
    async function initializeBot() {
        console.log('🚀 Инициализация бота...');
        
        try {
            // Создание кнопки боссов (доступна до авторизации)
            if (window.BotGameLogic && window.BotGameLogic.createBossButtons) {
                await window.BotGameLogic.createBossButtons();
            }
            
            // Создание кнопки авторизации
            await window.BotUI.createAuthButton();
            
            // Создание окна настроек
            await window.BotUI.createSettingsWindow();
            
            // Создание элементов статистики
            if (window.BotStatistics) {
                await window.BotStatistics.createStatisticsElement();
                window.BotStatistics.initializeStatistics();
            }
            
            console.log('✅ Бот успешно инициализирован!');
            console.log('🎮 Используйте кнопку 💎 для авторизации');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации бота:', error);
        }
    }
    
    // Основной процесс запуска
    try {
        await loadAllModules();
        
        if (verifyModules()) {
            await initializeBot();
        } else {
            throw new Error('Не удалось загрузить все необходимые модули');
        }
        
    } catch (error) {
        console.error('💥 Критическая ошибка запуска бота:', error);
        alert('Ошибка запуска бота. Проверьте консоль для деталей.');
    }
    
})();
