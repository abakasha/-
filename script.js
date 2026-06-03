// Глобальный перехватчик события: скрипт начнет выполняться строго тогда, 
// когда браузер полностью загрузит и построит структуру (DOM-дерево) HTML-страницы.
document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. ПЕРЕМЕННЫЕ ДЛЯ СТАТИСТИКИ И ИНТЕРАКТИВА ЛАЙКОВ (ПРАКТИЧЕСКАЯ №3)
       ========================================================================== */
    // Находим элементы счетчиков на странице по их уникальным ID
    const imageCounter = document.getElementById('image-counter');
    const totalLikesCounter = document.getElementById('total-likes');
    
    // Получаем массив всех карточек, кнопок фильтров и контейнер сетки
    const imageCards = document.querySelectorAll('.image-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryGrid = document.getElementById('image-gallery');
    
    // Переменные для кнопок управления отображением (Сетка / Список)
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');

    // ФУНКЦИЯ ПОДСЧЕТА КАРТИНОК. Автоматически берет длину массива найденных карточек 
    // (imageCards.length) и выводит эту цифру в плашку статистики на сайте.
    function countPhotos() {
        if (imageCounter) {
            imageCounter.textContent = imageCards.length;
        }
    }
    countPhotos(); // Запуск подсчета сразу при открытии галереи

    // ФУНКЦИЯ ПЕРЕСЧЕТА ОБЩЕГО ЧИСЛА ЛАЙКОВ. Запускает цикл (forEach) по всем текстовым блокам 
    // лайков (.like-count) на странице, переводит строки в числа (parseInt) и суммирует их, 
    // обновляя общую плашку «Уровень Уважения».
    function updateTotalLikes() {
        let total = 0;
        const allLikeCounts = document.querySelectorAll('.like-count');
        allLikeCounts.forEach(span => {
            total += parseInt(span.textContent) || 0;
        });
        if (totalLikesCounter) {
            totalLikesCounter.textContent = total;
        }
    }

    // ИНТЕРАКТИВНАЯ ОБРАБОТКА КЛИКОВ ПО ЛАЙКАМ. Цикл вешает прослушиватель событий 'click' 
    // на кнопку лайка каждой карточки.
    imageCards.forEach(card => {
        const likeBtn = card.querySelector('.like-btn');
        const likeCountSpan = card.querySelector('.like-count');
        const heartIcon = likeBtn.querySelector('i');

        likeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // ВАЖНО: Останавливает всплытие события, чтобы клик по лайку не открывал модальное окно просмотра картинки.

            // Проверяем, нажат ли лайк уже. Если класса .liked нет:
            if (!likeBtn.classList.contains('liked')) {
                likeBtn.classList.add('liked'); // Добавляем класс нажатого состояния (кнопка краснеет в CSS)
                let currentLikes = parseInt(likeCountSpan.textContent) || 0;
                likeCountSpan.textContent = currentLikes + 1; // Увеличиваем цифру на 1
                
                // Меняем иконку контурного сердца (far) на полностью закрашенное (fas)
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
                likeBtn.style.color = '#fff'; 
            } 
            // Если лайк уже стоял — пользователь его отменяет:
            else {
                likeBtn.classList.remove('liked'); // Убираем класс нажатого состояния
                let currentLikes = parseInt(likeCountSpan.textContent) || 0;
                likeCountSpan.textContent = currentLikes - 1; // Уменьшаем цифру на 1

                // Возвращаем контурную иконку сердца
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
                likeBtn.style.color = ''; 
            }

            updateTotalLikes(); // Пересчитываем общую сумму лайков в шапке панели
        });
    });


    /* ==========================================================================
       2. ФИЛЬТРАЦИЯ КАРТОЧЕК ПО КАТЕГОРИЯМ (ТВОРЧЕСКАЯ ЧАСТЬ ПР №3)
       ========================================================================== */
    // Вешаем клики на кнопки категорий (Альбомы, Синглы и т.д.)
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Сначала убираем класс подсветки .active со всех кнопок фильтра и добавляем его кликнутой
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Считываем значение фильтра из HTML-атрибута кнопки (например: data-filter="albums")
            const filterValue = button.getAttribute('data-filter');

            // Запускаем цикл проверки всех карточек галереи
            imageCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');

                // Если выбрано «Все» ('all') ИЛИ категория карточки совпала с фильтром:
                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.classList.remove('hidden'); // Удаляем класс скрытия, карточка плавно проявляется
                } else {
                    card.classList.add('hidden'); // Добавляем CSS-класс .hidden (display: none), карточка скрывается
                }
            });
        });
    });


    /* ==========================================================================
       3. ПЕРЕКЛЮЧЕНИЕ ВИДА ОТОБРАЖЕНИЯ (СЕТКА / СПИСОК — ПРАКТИЧЕСКАЯ №3)
       ========================================================================== */
    // Проверяем физическое наличие кнопок переключения на странице, чтобы не вызывать ошибок
    if (gridViewBtn && listViewBtn && galleryGrid) {
        
        // Клик по кнопке «Сетка»
        gridViewBtn.addEventListener('click', () => {
            listViewBtn.classList.remove('active');
            gridViewBtn.classList.add('active');
            galleryGrid.classList.remove('list-layout'); // Убираем CSS-класс списка, сетка возвращается в стандартный вид Grid
        });

        // Клик по кнопке «Список»
        listViewBtn.addEventListener('click', () => {
            gridViewBtn.classList.remove('active');
            listViewBtn.classList.add('active');
            galleryGrid.classList.add('list-layout'); // Добавляем CSS-класс списка, запуская Flexbox-перестроение карточек в ряд
        });
    }


    /* ==========================================================================
       4. ЛОГИКА МОДАЛЬНОГО ОКНА ПРОСМОТРА КАРТИНОК (LIGHTBOX — ПР №3)
       ========================================================================== */
    // Находим узлы полноэкранного модального окна просмотра
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCloseBtn = document.querySelector('.lightbox-close');

    // Назначаем клик на кнопку «Зум» (лупу) каждой карточки
    imageCards.forEach(card => {
        const zoomButton = card.querySelector('.zoom-btn');
        const cardImage = card.querySelector('.gallery-img');
        const cardTitle = card.querySelector('.image-title').textContent;

        zoomButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation(); // Блокируем всплытие клика
            
            // Подменяем данные в модальном окне: берем путь к картинке (src), 
            // альтернативный текст (alt) и заголовок песни из текущей карточки
            lightboxImg.src = cardImage.src; 
            lightboxImg.alt = cardImage.alt; 
            lightboxCaption.textContent = cardTitle; 
            
            lightboxModal.classList.add('show'); // Включаем показ окна добавлением класса .show (display: flex)
        });
    });

    // ЗАКРЫТИЕ ОКНА ПО КЛИКУ НА КРЕСТИК. Убирает класс .show.
    if (lightboxCloseBtn) {
        lightboxCloseBtn.addEventListener('click', () => {
            lightboxModal.classList.remove('show');
        });
    }

    // ЗАКРЫТИЕ ОКНА ПО КЛИКУ НА СВЕРХТЕМНЫЙ ФОН. Если клик пришелся по самой подложке, а не по картинке:
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (event) => {
            if (event.target === lightboxModal) {
                lightboxModal.classList.remove('show');
            }
        });
    }

    // ЗАКРЫТИЕ ОКНА ПО НАЖАТИЮ КЛАВИШИ ESCAPE НА КЛАВИАТУРЕ.
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('show')) {
            lightboxModal.classList.remove('show');
        }
    });

});


/* ==========================================================================
   5. ИНТЕРАКТИВНОСТЬ ДЛЯ СТРАНИЦЫ КОНТАКТОВ (ПРАКТИЧЕСКАЯ №4)
   ========================================================================== */

// Отдельный независимый блок ожидания загрузки DOM-структуры для страницы контактов
document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.querySelector('.feedback-form');

    // Строгая проверка: если формы нет на странице (например, мы в галерее) — код ниже игнорируется
    if (feedbackForm) {
        
        // Вешаем перехватчик на отправку формы (клик по кнопке или нажатие Enter)
        feedbackForm.addEventListener('submit', function(event) {
            
            // ВЫПОЛНЕНИЕ ТЗ №4: Блокируем стандартное поведение браузера (отмену мгновенной перезагрузки страницы),
            // чтобы страница не обновлялась, а данные обработались нашим скриптом на лету.
            event.preventDefault();

            // Считываем то то то, что ввел пользователь в текстовые поля формы
            const userName = document.getElementById('user-name').value;
            const userEmail = document.getElementById('user-email').value;

            // Выводим кастомное стилизованное модальное окно alert() с текстом принятого рапорта
            alert(`[ШТАБ ФАН-КЛУБА SABATON]\n\nРапорт успешно принят!\nБоец ${userName}, Ваше донесение зарегистрировано. Ответ будет отправлен на email: ${userEmail}.`);

            // ВЫПОЛНЕНИЕ ТЗ №4: Полностью очищаем все инпуты и поля формы после успешной «отправки»
            feedbackForm.reset();
        });
    }
});