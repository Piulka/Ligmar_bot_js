// IDs таблиц Google Sheets
const SPREADSHEET_ID = '1N2SdlN86wDzEsuzQ7Hlnv-91IAXhNmNMeRuSVtwD-zQ'; // Таблица для "Вещи Г" (гильдийские вещи)
const GUILD_SPREADSHEET_ID = '1Ygi2GzE6MB0_9im_npM6N1Im-jHiXVbpIQ_V4CkxeaQ'; // Таблица для "Вещи ТОП"
const BASE_IMAGE_URL = 'https://ligmar.io/game'; // Базовый URL для изображений Ligmar

function requestPermissions() {
  SpreadsheetApp.openById(SPREADSHEET_ID);
  ContentService.createTextOutput('test');
  Logger.log('✅ Разрешения запрошены успешно!');
}

// Обработка GET запросов
function doGet(e) {
  try {
    return ContentService
      .createTextOutput('Google Apps Script работает! Версия: v.4.0.1 - Поддержка столбцов "Статус" и "Отдал"')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    Logger.log('Ошибка в doGet:', error);
    return ContentService
      .createTextOutput('Ошибка: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// Обработка POST запросов
function doPost(e) {
  try {
    var data;
    
    // Пытаемся получить данные из разных источников
    if (e.postData) {
      if (e.postData.type === 'application/json') {
        data = JSON.parse(e.postData.contents);
      } else if (e.postData.type === 'text/plain') {
        data = JSON.parse(e.postData.contents);
      } else {
        // Form data
        data = JSON.parse(e.parameter.data);
      }
    } else if (e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    } else {
      throw new Error('Нет данных в запросе');
    }
    
    Logger.log('Получены данные:', data);
    
    if (data.action === 'addItems') {
      return addItemsToSheet(data.items, data.spreadsheetId);
    }
    
    return createSuccessResponse({error: 'Неизвестное действие'});
      
  } catch (error) {
    Logger.log('Ошибка в doPost:', error);
    return createSuccessResponse({error: error.toString()});
  }
}

// Обработка OPTIONS запросов для CORS
function doOptions() {
  return createSuccessResponse('OK');
}

// Создание ответа с правильными заголовками
function createSuccessResponse(data) {
  return ContentService
    .createTextOutput(typeof data === 'string' ? data : JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Добавление предметов в таблицу
function addItemsToSheet(items, targetSpreadsheetId = null) {
  try {
    // Определяем, какую таблицу использовать
    var spreadsheetId = targetSpreadsheetId || SPREADSHEET_ID;
    
    Logger.log('Используем таблицу ID: ' + spreadsheetId);
    
    // Создаем или получаем таблицу
    var spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    } catch (e) {
      Logger.log('Ошибка открытия таблицы ' + spreadsheetId + ': ' + e.toString());
      // Если не удалось открыть конкретную таблицу, создаем новую
      spreadsheet = SpreadsheetApp.create('Арсенал Гильдии Ligmar - ' + new Date().toLocaleDateString());
      Logger.log('Создана новая таблица:', spreadsheet.getUrl());
    }
    
    var sheet = spreadsheet.getSheetByName('Арсенал');
    
    // Создаем лист если не существует
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Арсенал');
      // Настраиваем заголовки для нового листа
      setupSheetHeaders(sheet);
    }
    
    // Получаем существующие данные
    var existingData = sheet.getDataRange().getValues();
    var existingItemsMap = {};
    var existingRowData = {};
    var maxOrderNumber = 0; // Для отслеживания максимального порядкового номера
    
    // Создаем карту существующих предметов с сохранением данных столбца "Отдал"
    for (var i = 1; i < existingData.length; i++) {
      if (existingData[i][12]) { // Если есть ID (столбец 13, индекс 12)
        var itemId = existingData[i][12];
        var orderNumber = parseInt(existingData[i][0]) || 0; // Столбец 1 - порядковый номер (индекс 0)
        
        existingItemsMap[itemId] = i + 1; // номер строки (1-based)
        existingRowData[itemId] = {
          row: i + 1,
          orderNumber: orderNumber,
          gaveAway: existingData[i][11] || '-' // столбец "Отдал" (индекс 11)
        };
        
        // Отслеживаем максимальный порядковый номер
        if (orderNumber > maxOrderNumber) {
          maxOrderNumber = orderNumber;
        }
      }
    }
    
    var newItemsCount = 0;
    var updatedItemsCount = 0;
    
    Logger.log('Обработка: ' + items.length + ' предметов');
    Logger.log('Максимальный порядковый номер: ' + maxOrderNumber);
    
    // Сначала обновляем статус всех существующих предметов на "Старая"
    for (var itemId in existingRowData) {
      var rowIndex = existingRowData[itemId].row;
      sheet.getRange(rowIndex, 11).setValue('Старая'); // Столбец "Статус" (индекс 10, колонка 11)
    }
    
    // Обрабатываем каждый предмет
    items.forEach(function(item) {
      var itemId = item.uniqueId;
      var isNewItem = !existingItemsMap.hasOwnProperty(itemId);
      var status = isNewItem ? 'Новая' : 'Старая';
      var gaveAway = '-'; // по умолчанию
      var orderNumber;
      
      if (isNewItem) {
        // Для новых предметов увеличиваем порядковый номер
        maxOrderNumber++;
        orderNumber = maxOrderNumber;
      } else {
        // Для существующих предметов сохраняем старый порядковый номер
        orderNumber = existingRowData[itemId].orderNumber;
        gaveAway = existingRowData[itemId].gaveAway;
      }
      
      var newRow = [
        orderNumber,                      // 1. Порядковый номер
        item.imageUrl || '',              // 2. Изображение  
        item.name || '',                  // 3. Название
        item.type || '',                  // 4. Тип
        item.quality || '',               // 5. Качество
        cleanTierName(item.tier || ''),   // 6. Уровень (без слова "уровень")
        item.gearScore || 0,              // 7. ГС
        formatStatsForCell(item.stats || []),                     // 8. Основные характеристики
        formatMagicPropsForCell(item.magicProps || []),          // 9. Магические свойства
        formatRequirementsForCell(item.requirements || []),      // 10. Требования
        status,                           // 11. Статус
        gaveAway,                         // 12. Отдал
        item.uniqueId                     // 13. ID (в конце)
      ];
      
      if (isNewItem) {
        // Добавляем новый предмет в конец таблицы
        var newRowIndex = sheet.getLastRow() + 1;
        sheet.getRange(newRowIndex, 1, 1, newRow.length).setValues([newRow]);
        
        // Устанавливаем высоту строки 65 пикселей
        sheet.setRowHeight(newRowIndex, 65);
        
        // Применяем форматирование для новой строки
        formatItemRow(sheet, newRowIndex, item, status);
        
        newItemsCount++;
      } else {
        // Обновляем существующий предмет (только данные, кроме столбца "Отдал")
        var existingRowIndex = existingItemsMap[itemId];
        // Обновляем все столбцы кроме "Отдал" (столбец 12)
        var updateRow = newRow.slice();
        updateRow[11] = gaveAway; // Сохраняем старое значение "Отдал"
        sheet.getRange(existingRowIndex, 1, 1, 12).setValues([updateRow.slice(0, 12)]);
        // Обновляем ID отдельно
        sheet.getRange(existingRowIndex, 13).setValue(item.uniqueId);
        
        // Устанавливаем высоту строки 65 пикселей
        sheet.setRowHeight(existingRowIndex, 65);
        
        // Применяем форматирование для обновленной строки
        formatItemRow(sheet, existingRowIndex, item, status);
        
        updatedItemsCount++;
      }
    });
    
    var result = {
      success: true,
      addedCount: newItemsCount,
      updatedCount: updatedItemsCount,
      duplicatesCount: 0,
      totalItems: sheet.getLastRow() - 1,
      spreadsheetUrl: spreadsheet.getUrl(),
      sheetId: spreadsheet.getId()
    };
    
    Logger.log('Результат:', result);
    return createSuccessResponse(result);
    
  } catch (error) {
    Logger.log('Ошибка в addItemsToSheet:', error);
    return createSuccessResponse({
      success: false,
      error: error.toString()
    });
  }
}

// Настройка заголовков таблицы
function setupSheetHeaders(sheet) {
  var headers = [
    'Порядковый номер', 'Изображение', 'Название', 'Тип', 'Качество', 'Уровень', 
    'ГС', 'Основные характеристики', 'Магические свойства', 'Требования', 'Статус', 'Отдал', 'ID'
  ];
  
  // Устанавливаем заголовки
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Устанавливаем высоту строки заголовков 65 пикселей
  sheet.setRowHeight(1, 65);
  
  // Форматирование заголовков
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setBorder(true, true, true, true, true, true);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  
  // Замораживаем заголовки
  sheet.setFrozenRows(1);
}

// Форматирование строки предмета
function formatItemRow(sheet, row, item, status) {
  // Общее форматирование строки
  var range = sheet.getRange(row, 1, 1, 13);
  range.setBorder(true, true, true, true, true, true);
  range.setVerticalAlignment('top');
  
  // Порядковый номер (колонка 1) - по центру
  var orderCell = sheet.getRange(row, 1);
  orderCell.setHorizontalAlignment('center');
  orderCell.setFontWeight('bold');
  orderCell.setVerticalAlignment('middle');
  
  // Изображение (колонка 2)
  var imageCell = sheet.getRange(row, 2);
  if (item.imageUrl) {
    var imageUrl = convertImagePath(item.imageUrl, BASE_IMAGE_URL);
    var sanitizedUrl = sanitizeImageUrl(imageUrl);
    
    if (sanitizedUrl && isValidImageUrl(sanitizedUrl)) {
      try {
        // Пробуем работающие формулы
        var imageFormulas = [
          '=IMAGE("' + sanitizedUrl + '"; 1)',  // Формула с точкой с запятой
          '=IMAGE("' + sanitizedUrl + '")'      // Формула без второго параметра
        ];
        
        var formulaWorked = false;
        for (var i = 0; i < imageFormulas.length; i++) {
          try {
            imageCell.setValue(imageFormulas[i]);
            imageCell.setHorizontalAlignment('center');
            imageCell.setVerticalAlignment('middle');
            Logger.log('✅ Формула изображения работает: ' + imageFormulas[i]);
            formulaWorked = true;
            break;
          } catch (formulaError) {
            Logger.log('⚠️ Формула не работает: ' + imageFormulas[i]);
          }
        }
        
        if (!formulaWorked) {
          throw new Error('Формулы IMAGE не работают');
        }
        
      } catch (error) {
        Logger.log('⚠️ Ошибка с IMAGE функцией: ' + error.toString());
        // Альтернативный метод - ссылка
        imageCell.setValue('=HYPERLINK("' + sanitizedUrl + '"; "🖼️")');
        imageCell.setFontColor('#2196F3');
        imageCell.setFontWeight('bold');
        imageCell.setHorizontalAlignment('center');
      }
    } else {
      imageCell.setValue('❌');
      imageCell.setFontColor('#FF9800');
      imageCell.setFontWeight('bold');
      imageCell.setHorizontalAlignment('center');
    }
  } else {
    imageCell.setValue('-');
    imageCell.setFontColor('#999999');
    imageCell.setHorizontalAlignment('center');
  }
  
  // Проверяем есть ли магические свойства > 101%
  var hasOver101Percent = checkMagicPropsOver101(item.magicProps || []);
  
  // Форматирование качества предмета (колонка 5)
  var qualityCell = sheet.getRange(row, 5);
  qualityCell.setFontWeight('bold');
  qualityCell.setHorizontalAlignment('center');
  qualityCell.setVerticalAlignment('middle');
  
  if (hasOver101Percent) {
    // Если есть магическое свойство > 101%, то оранжевый фон
    qualityCell.setBackground('#FFA500');
    qualityCell.setFontColor('#FFFFFF');
  } else {
    // Обычная цветовая схема для качества
    var qualityBgColor = getQualityBackgroundColor(item.quality);
    qualityCell.setBackground(qualityBgColor);
    qualityCell.setFontColor('#FFFFFF');
  }
  
  // Форматирование уровня (колонка 6)
  var tierCell = sheet.getRange(row, 6);
  tierCell.setHorizontalAlignment('center');
  tierCell.setFontWeight('bold');
  tierCell.setVerticalAlignment('middle');
  
  // Форматирование ГС (колонка 7)
  var gsCell = sheet.getRange(row, 7);
  var gsColor = getBMColor(item.gearScore || 0);
  gsCell.setFontColor(gsColor);
  gsCell.setFontWeight('bold');
  gsCell.setHorizontalAlignment('center');
  gsCell.setVerticalAlignment('middle');
  
  // Форматирование основных характеристик (колонка 8)
  var statsCell = sheet.getRange(row, 8);
  formatMultilineCell(statsCell, item.stats || [], formatStat);
  
  // Форматирование магических свойств (колонка 9)
  var magicCell = sheet.getRange(row, 9);
  formatMagicPropsCell(magicCell, item.magicProps || []);
  
  // Форматирование требований (колонка 10)
  var reqCell = sheet.getRange(row, 10);
  formatMultilineCell(reqCell, item.requirements || [], formatRequirement);
  
  // Форматирование столбца "Статус" (колонка 11)
  var statusCell = sheet.getRange(row, 11);
  statusCell.setValue(status);
  statusCell.setFontWeight('bold');
  statusCell.setHorizontalAlignment('center');
  statusCell.setVerticalAlignment('middle');
  
  if (status === 'Новая') {
    statusCell.setBackground('#d4edda'); // зеленый фон для новых
    statusCell.setFontColor('#155724');
  } else {
    statusCell.setBackground('#fff3cd'); // желтый фон для старых
    statusCell.setFontColor('#856404');
  }
  
  // Форматирование столбца "Отдал" (колонка 12)
  var gaveAwayCell = sheet.getRange(row, 12);
  gaveAwayCell.setHorizontalAlignment('center');
  gaveAwayCell.setVerticalAlignment('middle');
  if (gaveAwayCell.getValue() === '-') {
    gaveAwayCell.setFontColor('#999999');
    gaveAwayCell.setFontStyle('italic');
  } else {
    gaveAwayCell.setFontColor('#000000');
    gaveAwayCell.setFontWeight('bold');
  }
  
  // Форматирование ID (колонка 13) - скрываем или делаем мелким
  var idCell = sheet.getRange(row, 13);
  idCell.setHorizontalAlignment('center');
  idCell.setVerticalAlignment('middle');
  idCell.setFontSize(8);
  idCell.setFontColor('#999999');
}

// Очистка названия уровня (убираем слово "уровень")
function cleanTierName(tier) {
  if (!tier) return '';
  return tier.replace(/уровень\s*/i, '').trim();
}

// Проверка есть ли магические свойства > 101%
function checkMagicPropsOver101(magicProps) {
  for (var i = 0; i < magicProps.length; i++) {
    var prop = magicProps[i];
    if (prop.percent) {
      var numPercent = parseFloat(prop.percent.replace('%', '').replace('(', '').replace(')', '')) || 0;
      if (numPercent > 101) {
        return true;
      }
    }
  }
  return false;
}

// Получение фонового цвета для качества предмета
function getQualityBackgroundColor(quality) {
  if (!quality) return '#A0A0A0'; // тускло серый для неизвестного
  
  if (quality.includes('Эпическ')) {
    return '#8A2BE2'; // тускло фиолетовый для эпического
  } else if (quality.includes('Редк')) {
    return '#4682B4'; // тускло синий для редкого
  } else {
    return '#A0A0A0'; // тускло серый для обычного
  }
}

// Форматирование одной характеристики
function formatStat(stat) {
  return '• ' + stat.name + ': ' + stat.value;
}

// Форматирование одного требования
function formatRequirement(req) {
  return '• ' + req.key + ': ' + req.value;
}

// Форматирование ячейки с множественными строками
function formatMultilineCell(cell, items, formatter) {
  if (!items || items.length === 0) {
    cell.setValue('-');
    cell.setFontColor('#999999');
    cell.setFontStyle('italic');
    return;
  }
  
  var text = items.map(formatter).join('\n');
  cell.setValue(text);
  cell.setFontWeight('normal');
  cell.setFontColor('#000000');
}

// Форматирование основных характеристик для ячейки
function formatStatsForCell(stats) {
  if (!stats || stats.length === 0) return '';
  return stats.map(function(stat) {
    return '• ' + stat.name + ': ' + stat.value;
  }).join('\n');
}

// Форматирование магических свойств для ячейки
function formatMagicPropsForCell(magicProps) {
  if (!magicProps || magicProps.length === 0) return '';
  return magicProps.map(function(prop) {
    var text = '• ' + prop.value + ' ' + prop.name;
    if (prop.percent) {
      text += ' (' + prop.percent + ')';
    }
    return text;
  }).join('\n');
}

// Форматирование требований для ячейки
function formatRequirementsForCell(requirements) {
  if (!requirements || requirements.length === 0) return '';
  return requirements.map(function(req) {
    return '• ' + req.key + ': ' + req.value;
  }).join('\n');
}

// Получение цвета для качества предмета
function getQualityColor(quality) {
  if (!quality) return '#666666'; // серый для неизвестного
  
  if (quality.includes('Эпическ')) {
    return '#9C27B0'; // фиолетовый для эпического
  } else if (quality.includes('Редк')) {
    return '#2196F3'; // синий для редкого
  } else {
    return '#666666'; // серый для обычного
  }
}

// Получение цвета для БМ (Боевой Мощи)
function getBMColor(gearScore) {
  var gs = parseInt(gearScore) || 0;
  
  if (gs >= 630) {
    return '#9C27B0'; // фиолетовый (630+)
  } else if (gs >= 550) {
    return '#2196F3'; // синий (550-630)
  } else if (gs >= 450) {
    return '#4CAF50'; // зеленый (450-550)
  } else {
    return '#666666'; // серый (1-450)
  }
}

// Получение цвета для магических свойств по проценту
// Цветовая схема:
// 0-49%: серый (#666666)
// 50-79%: синий (#2196F3)
// 80-99%: фиолетовый (#9C27B0)
// 100%+: оранжевый (#FF9800)
function getMagicPropColor(percent) {
  if (!percent) return '#666666';
  
  var numPercent = parseFloat(percent.replace('%', '').replace('(', '').replace(')', '')) || 0;
  
  if (numPercent >= 100) {
    return '#FF9800'; // оранжевый (100%+)
  } else if (numPercent >= 80) {
    return '#9C27B0'; // фиолетовый (80-99%)
  } else if (numPercent >= 50) {
    return '#2196F3'; // синий (50-79%)
  } else {
    return '#666666'; // серый (0-49%)
  }
}

// Форматирование основных характеристик
function formatStats(stats) {
  if (!stats || stats.length === 0) return '';
  
  return stats.map(function(stat) {
    return stat.name + ': ' + stat.value;
  }).join('\n');
}

// Форматирование магических свойств
function formatMagicProps(magicProps) {
  if (!magicProps || magicProps.length === 0) return '';
  
  return magicProps.map(function(prop) {
    // Используем ● вместо + чтобы избежать интерпретации как формулы
    var text = '● ' + prop.value + ' ' + prop.name;
    if (prop.percent) {
      text += ' (' + prop.percent + ')';
    }
    return text;
  }).join('\n');
}

// Форматирование ячейки магических свойств с индивидуальными цветами для каждого свойства
function formatMagicPropsCell(cell, magicProps) {
  if (!magicProps || magicProps.length === 0) return;
  
  try {
    // Проверяем, доступны ли Rich Text функции
    if (typeof SpreadsheetApp.newRichTextValue !== 'function') {
      throw new Error('Rich Text API недоступно');
    }
    
    // Создаем RichTextValueBuilder для многоцветного текста
    var richTextBuilder = SpreadsheetApp.newRichTextValue();
    var fullText = '';
    var textStyles = [];
    
    // Обрабатываем каждое магическое свойство
    magicProps.forEach(function(prop, index) {
      var propText = '● ' + prop.value + ' ' + prop.name;
      if (prop.percent) {
        propText += ' (' + prop.percent + ')';
      }
      
      // Добавляем разделитель между свойствами (кроме первого)
      if (index > 0) {
        fullText += '\n';
      }
      
      var startIndex = fullText.length;
      fullText += propText;
      var endIndex = fullText.length;
      
      // Определяем цвет для этого свойства
      var propColor = getMagicPropColor(prop.percent);
      
      // Добавляем стиль для этого диапазона текста
      textStyles.push({
        startIndex: startIndex,
        endIndex: endIndex,
        color: propColor
      });
    });
    
    // Добавляем апостроф в начало для принудительного текстового режима
    fullText = "'" + fullText;
    
    // Устанавливаем полный текст
    richTextBuilder.setText(fullText);
    
    // Применяем стили к каждому диапазону (с учетом смещения из-за апострофа)
    textStyles.forEach(function(style) {
      var textStyle = SpreadsheetApp.newTextStyle()
        .setForegroundColor(style.color)
        .build();
      
      richTextBuilder.setTextStyle(style.startIndex + 1, style.endIndex + 1, textStyle);
    });
    
    // Устанавливаем Rich Text значение в ячейку
    var richTextValue = richTextBuilder.build();
    cell.setRichTextValue(richTextValue);
    
    // Делаем всю ячейку жирной отдельно
    cell.setFontWeight('bold');
    
    Logger.log('✅ Применено Rich Text форматирование для ' + magicProps.length + ' магических свойств');
    
  } catch (error) {
    // Автоматически переключаемся на альтернативное форматирование
    Logger.log('⚠️ Rich Text форматирование не удалось (' + error.toString() + '), переключаемся на альтернативное');
    formatMagicPropsCellAlternative(cell, magicProps);
  }
}

// Форматирование требований
function formatRequirements(requirements) {
  if (!requirements || requirements.length === 0) return '';
  
  return requirements.map(function(req) {
    return req.key + ': ' + req.value;
  }).join('\n');
}

// Функция для извлечения URL изображения из HTML элемента
function extractImageUrl(htmlElement) {
  try {
    // Если передан объект элемента с атрибутом src
    if (htmlElement && htmlElement.src) {
      return htmlElement.src;
    }
    
    // Если передана строка HTML
    if (typeof htmlElement === 'string') {
      var srcMatch = htmlElement.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
    }
    
    return '';
  } catch (error) {
    Logger.log('⚠️ Ошибка при извлечении URL изображения: ' + error.toString());
    return '';
  }
}

// Тестовая функция для проверки работы
function testFunction() {
  try {
    Logger.log('=== STARTING TEST ===');
    
    var testItems = [{
      uniqueId: 'test1',
      name: 'Легкие наручи',
      type: 'Руки',
      quality: 'Эпический',
      tier: 'IV',
      gearScore: 488,
      imageUrl: 'assets/images/gear/arms-light-epic.webp',
      stats: [
        {name: 'Защита', value: '72'},
        {name: 'Сопротивление', value: '112'}
      ],
      magicProps: [
        {name: 'Уклонение', value: '41', percent: '85.8%'},
        {name: 'Здоровье', value: '14', percent: '20.1%'},
        {name: 'Скрытность', value: '1', percent: '48.6%'}
      ],
      requirements: [
        {key: 'Уровень', value: '24'},
        {key: 'Сила', value: '29'},
        {key: 'Ловкость', value: '30'}
      ]
    }];
    
    // Тестируем основную таблицу (Вещи Г)
    Logger.log('Testing GUILD table...');
    var result1 = addItemsToSheet(testItems, SPREADSHEET_ID);
    
    // Тестируем таблицу ТОП
    Logger.log('Testing TOP table...');
    var result2 = addItemsToSheet(testItems, GUILD_SPREADSHEET_ID);
    
    Logger.log('✅ Test completed successfully');
    Logger.log('🔗 Guild table: https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID);
    Logger.log('🔗 TOP table: https://docs.google.com/spreadsheets/d/' + GUILD_SPREADSHEET_ID);
    
    return 'SUCCESS';
    
  } catch (error) {
    Logger.log('❌ Test failed: ' + error.toString());
    return 'FAILED: ' + error.toString();
  }
}

// Функция для конвертации относительных путей изображений в полные URL
function convertImagePath(imagePath, baseUrl) {
  try {
    if (!imagePath) return '';
    
    // Если уже полный URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Если есть базовый URL, объединяем
    if (baseUrl) {
      // Убираем слэш в конце базового URL если есть
      var cleanBaseUrl = baseUrl.replace(/\/$/, '');
      // Убираем слэш в начале пути если есть
      var cleanPath = imagePath.replace(/^\//, '');
      return cleanBaseUrl + '/' + cleanPath;
    }
    
    // Возвращаем как есть (для обработки в другом месте)
    return imagePath;
    
  } catch (error) {
    Logger.log('⚠️ Ошибка при конвертации пути изображения: ' + error.toString());
    return imagePath;
  }
}

// Проверка валидности URL для изображения
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Проверяем, что это полный URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  
  // Проверяем, что URL содержит расширение изображения
  var imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  var lowerUrl = url.toLowerCase();
  
  return imageExtensions.some(function(ext) {
    return lowerUrl.includes(ext);
  });
}

// Функция для проверки и исправления URL
function sanitizeImageUrl(url) {
  if (!url) return '';
  
  try {
    // Убираем пробелы
    url = url.trim();
    
    // Если URL содержит пробелы, заменяем их на %20
    url = url.replace(/ /g, '%20');
    
    // Проверяем, что URL начинается с протокола
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Logger.log('⚠️ URL не содержит протокол: ' + url);
      return '';
    }
    
    return url;
  } catch (error) {
    Logger.log('⚠️ Ошибка при санитизации URL: ' + error.toString());
    return '';
  }
}

/*
  КАК ИЗВЛЕЧЬ URL ИЗОБРАЖЕНИЯ ИЗ DOM (для клиентского кода):
  
  1. Найти элемент изображения:
     var imgElement = document.querySelector('.item-image');
     
  2. Получить src атрибут:
     var imageUrl = imgElement.src;
     
  3. Или извлечь из атрибута src:
     var imageUrl = imgElement.getAttribute('src');
     
  4. Передать в данных:
     var itemData = {
       name: 'Название предмета',
       imageUrl: imageUrl, // Полный URL или относительный путь
       // остальные поля...
     };
     
  5. Отправить на сервер:
     fetch(SCRIPT_URL, {
       method: 'POST',
       body: JSON.stringify({
         action: 'addItems',
         items: [itemData]
       })
     });

  ПРИМЕР ПОЛНОГО КОДА ДЛЯ ИЗВЛЕЧЕНИЯ ДАННЫХ ПРЕДМЕТА:
  
  function extractItemData(itemElement) {
    var itemData = {};
    
    // Извлекаем изображение
    var imgElement = itemElement.querySelector('.item-image');
    if (imgElement) {
      itemData.imageUrl = imgElement.getAttribute('src');
    }
    
    // Извлекаем название предмета
    var nameElement = itemElement.querySelector('.item-name');
    if (nameElement) {
      itemData.name = nameElement.textContent.trim();
    }
    
    // Извлекаем тип предмета
    var typeElement = itemElement.querySelector('.item-type');
    if (typeElement) {
      itemData.type = typeElement.textContent.trim();
    }
    
    // Извлекаем качество
    var qualityElement = itemElement.querySelector('.item-quality');
    if (qualityElement) {
      itemData.quality = qualityElement.textContent.trim();
    }
    
    return itemData;
  }
  
  // Использование:
  var items = [];
  document.querySelectorAll('.item-container').forEach(function(itemElement) {
    var itemData = extractItemData(itemElement);
    items.push(itemData);
  });
  
  // Отправка на сервер
  sendItemsToGoogleSheets(items);
*/ 