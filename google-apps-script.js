const SPREADSHEET_ID = '1N2SdlN86wDzEsuzQ7Hlnv-91IAXhNmNMeRuSVtwD-zQ';
const BASE_IMAGE_URL = 'https://ligmar.io/game'; // Базовый URL для изображений Ligmar

function requestPermissions() {
  SpreadsheetApp.openById(SPREADSHEET_ID);
  ContentService.createTextOutput('test');
  Logger.log('✅ Разрешения запрошены успешно!');
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
      return addItemsToSheet(data.items);
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
function addItemsToSheet(items) {
  try {
    // Создаем или получаем таблицу
    var spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      // Если нет привязанной таблицы, создаем новую
      spreadsheet = SpreadsheetApp.create('Арсенал Гильдии Ligmar');
      Logger.log('Создана новая таблица:', spreadsheet.getUrl());
    }
    
    var sheet = spreadsheet.getSheetByName('Арсенал');
    
    // Создаем лист если не существует, или очищаем существующий
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Арсенал');
    } else {
      // Очищаем существующие данные (кроме заголовков)
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 9).clear();
      }
    }
    
    // Настраиваем заголовки заново
    setupSheetHeaders(sheet);
    
    Logger.log('Обработка: ' + items.length + ' предметов');
    
    if (items.length > 0) {
      addItemsToTable(sheet, items);
    }
    
    var result = {
      success: true,
      addedCount: items.length,
      duplicatesCount: 0, // Теперь дублей нет, так как таблица очищается
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
    '№', 'Изображение', 'Название предмета', 'Тип предмета', 'Качество', 
    'БМ', 'Основные характеристики', 'Магические свойства', 'Требования'
  ];
  
  // Устанавливаем заголовки
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Форматирование заголовков
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setBorder(true, true, true, true, true, true);
  headerRange.setHorizontalAlignment('center');
  
  // Замораживаем заголовки
  sheet.setFrozenRows(1);
}

// Добавление предметов в таблицу
function addItemsToTable(sheet, items) {
  var startRow = sheet.getLastRow() + 1;
  var currentRow = startRow;
  
  items.forEach(function(item, index) {
    // Данные строки
    var rowData = [
      index + 1, // Порядковый номер от 1
      item.imageUrl || '', // URL изображения
      item.name || 'Неизвестно',
      item.type || 'Неизвестно',
      item.quality || 'Обычный',
      item.gearScore || 0,
      formatStats(item.stats || []),
      formatMagicProps(item.magicProps || []),
      formatRequirements(item.requirements || [])
    ];
    
    // Записываем данные
    sheet.getRange(currentRow, 1, 1, rowData.length).setValues([rowData]);
    
    // Применяем форматирование
    formatItemRow(sheet, currentRow, item);
    
    currentRow++;
  });
}

// Форматирование строки предмета
function formatItemRow(sheet, row, item) {
  // Общее форматирование строки
  var range = sheet.getRange(row, 1, 1, 9);
  range.setBorder(true, true, true, true, true, true);
  range.setVerticalAlignment('top');
  
  // Форматирование качества предмета (колонка 5, была 4)
  var qualityCell = sheet.getRange(row, 5);
  var qualityColor = getQualityColor(item.quality);
  qualityCell.setFontColor(qualityColor);
  qualityCell.setFontWeight('bold');
  
  // Форматирование БМ (колонка 6, была 5)
  var bmCell = sheet.getRange(row, 6);
  var bmColor = getBMColor(item.gearScore || 0);
  bmCell.setFontColor(bmColor);
  bmCell.setFontWeight('bold');
  bmCell.setHorizontalAlignment('center');
  
  // Форматирование магических свойств (колонка 8, была 7)
  var magicCell = sheet.getRange(row, 8);
  formatMagicPropsCell(magicCell, item.magicProps || []);
  
  // Форматирование изображения (колонка 2)
  var imageCell = sheet.getRange(row, 2);
  if (item.imageUrl) {
    var imageUrl = convertImagePath(item.imageUrl, BASE_IMAGE_URL);
    var sanitizedUrl = sanitizeImageUrl(imageUrl);
    
    if (sanitizedUrl && isValidImageUrl(sanitizedUrl)) {
      try {
        // Пробуем работающие формулы (формула 2 и 3)
        var imageFormulas = [
          '=IMAGE("' + sanitizedUrl + '"; 1)',  // Формула 2: с точкой с запятой
          '=IMAGE("' + sanitizedUrl + '")'      // Формула 3: без второго параметра
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
        imageCell.setValue('=HYPERLINK("' + sanitizedUrl + '"; "🖼️ Показать изображение")');
        imageCell.setFontColor('#2196F3');
        imageCell.setFontWeight('bold');
        imageCell.setHorizontalAlignment('center');
      }
    } else {
      // URL невалидный
      imageCell.setValue('Невалидный URL: ' + item.imageUrl);
      imageCell.setFontColor('#FF9800');
      imageCell.setFontWeight('bold');
    }
  } else {
    // Если изображения нет
    imageCell.setValue('Нет изображения');
    imageCell.setFontColor('#999999');
    imageCell.setFontStyle('italic');
  }
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
    }, {
      uniqueId: 'test2',
      name: 'Плащ древнего короля',
      type: 'Плащ',
      quality: 'Эпический',
      tier: 'V',
      gearScore: 669,
      imageUrl: 'assets/images/gear/shoulders-cloak-epic.webp',
      stats: [
        {name: 'Защита', value: '45'},
        {name: 'Сопротивление', value: '200'}
      ],
      magicProps: [
        {name: 'Уклонение', value: '21', percent: '121.1%'},
        {name: 'Сопротивление', value: '186', percent: '150%'},
        {name: 'Скрытность', value: '1', percent: '77.5%'}
      ],
      requirements: [
        {key: 'Уровень', value: '27'},
        {key: 'Сила', value: '15'}
      ]
    }];
    
    var result = addItemsToSheet(testItems);
    
    Logger.log('✅ Test completed successfully');
    Logger.log('🔗 Check your sheet: https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID);
    Logger.log('Result:', result);
    
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