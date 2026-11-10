package ua.polytsia.data;

import ua.polytsia.model.Banner;
import ua.polytsia.model.Category;
import ua.polytsia.model.Product;
import ua.polytsia.model.Spec;
import ua.polytsia.model.Stock;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Seed data for the store: category tree, products and promotional content.
 * Kept in code so the app runs with no database and no external dependencies.
 */
public final class CatalogData {

    private CatalogData() {
    }

    private static final String IMG = "/img/p/";

    // ------------------------------------------------------------ categories

    public static List<Category> categories() {
        return List.of(
                group("computers", "Ноутбуки та комп'ютери", "macbookair13", "laptop"),
                leaf("laptops", "Ноутбуки", "computers", "macbookpro14"),
                leaf("tablets", "Планшети", "computers", "ipadpro"),
                leaf("desktops", "Комп'ютери та моноблоки", "computers", "imac24"),
                leaf("peripherals", "Мишки, клавіатури, рюкзаки", "computers", "gprox"),

                group("electronics", "Смартфони, ТВ і електроніка", "iphone15promax", "phone"),
                leaf("smartphones", "Смартфони", "electronics", "iphone15pro"),
                leaf("tv", "Телевізори", "electronics", "samsungq60"),
                leaf("audio", "Навушники та акустика", "electronics", "sonyxm5"),
                leaf("smartwatches", "Смарт-годинники", "electronics", "watch9"),
                leaf("photo", "Фото, відео та дрони", "electronics", "canon250d"),

                group("gaming", "Товари для геймерів", "ps5", "gamepad"),
                leaf("consoles", "Ігрові консолі", "gaming", "switcholed"),
                leaf("gamepads", "Геймпади", "gaming", "xboxpad"),

                group("appliances", "Побутова техніка", "robotvac", "appliance"),
                leaf("cleaning", "Прибирання та прання", "appliances", "washer"),
                leaf("kitchen", "Техніка для кухні", "appliances", "coffeemaker"),

                group("fashion", "Одяг, взуття та прикраси", "af1pastel", "shirt"),
                leaf("sneakers", "Кросівки", "fashion", "airmax90"),
                leaf("bags", "Сумки", "fashion", "marmont"),

                group("beauty", "Краса та здоров'я", "no5", "beauty"),
                leaf("perfume", "Парфумерія", "beauty", "bleu"),

                group("kids", "Дитячі товари", "lego11030", "toy"),
                leaf("toys", "Іграшки та конструктори", "kids", "lego11030"),

                group("sport", "Спорт і захоплення", "bike", "bike"),
                leaf("bikes", "Велосипеди", "sport", "bike"),

                group("food", "Продукти та напої", "lavazza", "cup"),
                leaf("coffee", "Кава та чай", "food", "lavazza"));
    }

    private static Category group(String slug, String name, String image, String icon) {
        return new Category(slug, name, null, IMG + image + ".jpg", icon);
    }

    private static Category leaf(String slug, String name, String parent, String image) {
        return new Category(slug, name, parent, IMG + image + ".jpg", null);
    }

    // ------------------------------------------------------------ products

    public static List<Product> products() {
        List<Product> l = new ArrayList<>();

        // Smartphones
        l.add(p(1, "apple-iphone-15-pro-max-256gb-black-titanium", "Apple iPhone 15 Pro Max 256GB Black Titanium", "Apple", "smartphones",
                57999, 62999, 4.9, 1284, Stock.IN_STOCK, "iphone15promax,iphone15promax-2",
                "Титановий корпус, чип A17 Pro і система камер Pro з 5-кратним оптичним зумом. Дисплей Super Retina XDR 6,7\" з ProMotion та Always-On, порт USB-C зі швидкістю USB 3 і кнопка дії замість перемикача режимів.",
                "Діагональ екрана|6.7\" OLED, 120 Гц;Процесор|Apple A17 Pro;Вбудована пам'ять|256 ГБ;Основна камера|48 Мп + 12 Мп + 12 Мп (5x);Фронтальна камера|12 Мп;Матеріал корпусу|Титан;Роз'єм|USB-C (USB 3);Гарантія|12 місяців",
                98, 320));
        l.add(p(2, "apple-iphone-15-pro-256gb-white-titanium", "Apple iPhone 15 Pro 256GB White Titanium", "Apple", "smartphones",
                49999, 0, 4.8, 864, Stock.IN_STOCK, "iphone15pro,iphone15pro-2",
                "Компактний флагман у титановому корпусі. Чип A17 Pro забезпечує консольну графіку в іграх, а 48-мегапіксельна камера знімає детальні фото навіть у сутінках.",
                "Діагональ екрана|6.1\" OLED, 120 Гц;Процесор|Apple A17 Pro;Вбудована пам'ять|256 ГБ;Основна камера|48 Мп + 12 Мп + 12 Мп (3x);Фронтальна камера|12 Мп;Матеріал корпусу|Титан;Роз'єм|USB-C (USB 3);Гарантія|12 місяців",
                90, 320));
        l.add(p(3, "apple-iphone-14-128gb-product-red", "Apple iPhone 14 128GB (PRODUCT)RED", "Apple", "smartphones",
                31999, 35999, 4.8, 2146, Stock.IN_STOCK, "iphone14red",
                "Надійний iPhone з подвійною камерою 12 Мп, режимом «Кіно» та функцією виявлення аварії. Корпус у фірмовому червоному кольорі.",
                "Діагональ екрана|6.1\" OLED;Процесор|Apple A15 Bionic;Вбудована пам'ять|128 ГБ;Основна камера|12 Мп + 12 Мп;Фронтальна камера|12 Мп;Роз'єм|Lightning;Гарантія|12 місяців",
                94, 700));
        l.add(p(4, "apple-iphone-13-128gb-midnight", "Apple iPhone 13 128GB Midnight", "Apple", "smartphones",
                24999, 27499, 4.8, 3410, Stock.LOW, "iphone13,iphone13-2",
                "Перевірений часом iPhone з чипом A15 Bionic, яскравим дисплеєм Super Retina XDR і автономністю до 19 годин відтворення відео.",
                "Діагональ екрана|6.1\" OLED;Процесор|Apple A15 Bionic;Вбудована пам'ять|128 ГБ;Основна камера|12 Мп + 12 Мп;Фронтальна камера|12 Мп;Роз'єм|Lightning;Гарантія|12 місяців",
                88, 1100));
        l.add(p(5, "samsung-galaxy-s24-8-256gb-cobalt-violet", "Samsung Galaxy S24 8/256GB Cobalt Violet", "Samsung", "smartphones",
                37999, 42999, 4.7, 642, Stock.IN_STOCK, "galaxys24",
                "Флагман із Galaxy AI: переклад дзвінків у реальному часі, «Обведи і знайди» та розумне редагування фото. Дисплей Dynamic AMOLED 2X з частотою 120 Гц.",
                "Діагональ екрана|6.2\" Dynamic AMOLED 2X, 120 Гц;Процесор|Exynos 2400;Оперативна пам'ять|8 ГБ;Вбудована пам'ять|256 ГБ;Основна камера|50 Мп + 12 Мп + 10 Мп;Акумулятор|4000 мА·год;Гарантія|12 місяців",
                86, 260));
        l.add(p(6, "xiaomi-redmi-note-13-pro-8-256gb-midnight-black", "Xiaomi Redmi Note 13 Pro 8/256GB Midnight Black", "Xiaomi", "smartphones",
                12999, 14499, 4.6, 1872, Stock.IN_STOCK, "redminote13",
                "Камера 200 Мп з оптичною стабілізацією, AMOLED-екран 120 Гц і швидка зарядка 67 Вт — найкраще співвідношення ціни та можливостей у класі.",
                "Діагональ екрана|6.67\" AMOLED, 120 Гц;Процесор|Snapdragon 7s Gen 2;Оперативна пам'ять|8 ГБ;Вбудована пам'ять|256 ГБ;Основна камера|200 Мп + 8 Мп + 2 Мп;Акумулятор|5100 мА·год;Швидка зарядка|67 Вт;Гарантія|12 місяців",
                96, 300));
        l.add(p(7, "motorola-edge-50-fusion-12-256gb", "Motorola Edge 50 Fusion 12/256GB Forest Blue", "Motorola", "smartphones",
                15499, 0, 4.5, 214, Stock.IN_STOCK, "motoedge50",
                "Тонкий смартфон із вигнутим pOLED-екраном 144 Гц, захистом IP68 і камерою Sony LYTIA 700C. Корпус із приємної на дотик веганської шкіри.",
                "Діагональ екрана|6.7\" pOLED, 144 Гц;Процесор|Snapdragon 7s Gen 2;Оперативна пам'ять|12 ГБ;Вбудована пам'ять|256 ГБ;Основна камера|50 Мп + 13 Мп;Захист|IP68;Акумулятор|5000 мА·год;Гарантія|12 місяців",
                60, 120));

        // Laptops
        l.add(p(8, "apple-macbook-air-13-m3-8-256gb-silver", "Apple MacBook Air 13\" M3 8/256GB Silver", "Apple", "laptops",
                49999, 54999, 4.9, 512, Stock.IN_STOCK, "macbookair13,macbookair13-2",
                "Надтонкий ноутбук без вентилятора на чипі M3. До 18 годин роботи від акумулятора, дисплей Liquid Retina і підтримка двох зовнішніх моніторів при закритій кришці.",
                "Діагональ екрана|13.6\" Liquid Retina, 2560x1664;Процесор|Apple M3 (8 ядер CPU);Оперативна пам'ять|8 ГБ;Накопичувач|256 ГБ SSD;Графіка|10-ядерний GPU;Вага|1.24 кг;Автономність|до 18 годин;Гарантія|12 місяців",
                93, 240));
        l.add(p(9, "apple-macbook-pro-14-m3-pro-18-512gb-space-black", "Apple MacBook Pro 14\" M3 Pro 18/512GB Space Black", "Apple", "laptops",
                94999, 0, 4.9, 186, Stock.IN_STOCK, "macbookpro14,macbookpro14-2",
                "Професійний ноутбук для монтажу відео, 3D та розробки. Дисплей Liquid Retina XDR з яскравістю до 1600 ніт, порт HDMI, слот SDXC та MagSafe 3.",
                "Діагональ екрана|14.2\" Liquid Retina XDR, 120 Гц;Процесор|Apple M3 Pro (11 ядер CPU);Оперативна пам'ять|18 ГБ;Накопичувач|512 ГБ SSD;Графіка|14-ядерний GPU;Вага|1.61 кг;Автономність|до 18 годин;Гарантія|12 місяців",
                70, 360));
        l.add(p(10, "apple-macbook-air-15-m3-16-512gb-midnight", "Apple MacBook Air 15\" M3 16/512GB Midnight", "Apple", "laptops",
                69999, 74999, 4.9, 143, Stock.LOW, "macbookair15",
                "Великий екран 15,3\" у корпусі завтовшки 11,5 мм. Шість динаміків із просторовим звуком і 16 ГБ об'єднаної пам'яті для впевненої багатозадачності.",
                "Діагональ екрана|15.3\" Liquid Retina, 2880x1864;Процесор|Apple M3 (8 ядер CPU);Оперативна пам'ять|16 ГБ;Накопичувач|512 ГБ SSD;Графіка|10-ядерний GPU;Вага|1.51 кг;Гарантія|12 місяців",
                66, 200));
        l.add(p(11, "asus-rog-strix-g16-g614jv-i7-16-1tb-rtx4060", "ASUS ROG Strix G16 G614JV i7-13650HX/16/1TB/RTX 4060", "ASUS", "laptops",
                59999, 64999, 4.7, 328, Stock.IN_STOCK, "rogstrix,rogstrix-2",
                "Ігровий ноутбук із екраном 165 Гц, відеокартою GeForce RTX 4060 і системою охолодження з рідким металом. RGB-підсвітка клавіатури та підсвічування корпусу Aura Sync.",
                "Діагональ екрана|16\" IPS, 1920x1200, 165 Гц;Процесор|Intel Core i7-13650HX;Оперативна пам'ять|16 ГБ DDR5;Накопичувач|1 ТБ SSD;Відеокарта|NVIDIA GeForce RTX 4060, 8 ГБ;Вага|2.5 кг;Операційна система|Без ОС;Гарантія|24 місяці",
                84, 420));
        l.add(p(12, "dell-xps-13-9340-ultra7-16-512gb", "Dell XPS 13 9340 Core Ultra 7/16/512GB Platinum", "Dell", "laptops",
                64999, 0, 4.6, 74, Stock.IN_STOCK, "dellxps",
                "Компактний ультрабук з безрамковим екраном InfinityEdge, сенсорним рядом функціональних клавіш і процесором Intel Core Ultra з вбудованим NPU для ШІ-задач.",
                "Діагональ екрана|13.4\" IPS, 1920x1200;Процесор|Intel Core Ultra 7 155H;Оперативна пам'ять|16 ГБ LPDDR5x;Накопичувач|512 ГБ SSD;Графіка|Intel Arc;Вага|1.19 кг;Операційна система|Windows 11 Home;Гарантія|24 місяці",
                40, 180));

        // Tablets
        l.add(p(13, "apple-ipad-10-9-2022-wi-fi-64gb-blue", "Apple iPad 10.9\" 2022 Wi-Fi 64GB Blue", "Apple", "tablets",
                15999, 17999, 4.8, 921, Stock.IN_STOCK, "ipad109",
                "Яскравий iPad з дисплеєм Liquid Retina, чипом A14 Bionic і USB-C. Фронтальна камера розташована по довгій стороні — зручно для відеодзвінків.",
                "Діагональ екрана|10.9\" Liquid Retina;Процесор|Apple A14 Bionic;Вбудована пам'ять|64 ГБ;Камери|12 Мп / 12 Мп;Роз'єм|USB-C;Підтримка стилуса|Apple Pencil (USB-C);Гарантія|12 місяців",
                89, 500));
        l.add(p(14, "apple-ipad-air-11-m2-128gb-space-gray", "Apple iPad Air 11\" M2 Wi-Fi 128GB Space Gray", "Apple", "tablets",
                27999, 0, 4.9, 207, Stock.IN_STOCK, "ipadair",
                "Потужність чипа M2 у тонкому корпусі. Підтримка Apple Pencil Pro і клавіатури Magic Keyboard перетворює планшет на повноцінне робоче місце.",
                "Діагональ екрана|11\" Liquid Retina;Процесор|Apple M2;Вбудована пам'ять|128 ГБ;Камери|12 Мп / 12 Мп;Роз'єм|USB-C;Підтримка стилуса|Apple Pencil Pro;Гарантія|12 місяців",
                72, 150));
        l.add(p(15, "apple-ipad-pro-11-m4-256gb-silver", "Apple iPad Pro 11\" M4 Wi-Fi 256GB Silver", "Apple", "tablets",
                47999, 51999, 4.9, 98, Stock.IN_STOCK, "ipadpro",
                "Найтонший продукт Apple з дисплеєм Ultra Retina XDR на технології Tandem OLED та чипом M4. Ідеальний для ілюстраторів і відеомонтажу.",
                "Діагональ екрана|11\" Ultra Retina XDR (Tandem OLED);Процесор|Apple M4;Вбудована пам'ять|256 ГБ;Камери|12 Мп + LiDAR / 12 Мп;Роз'єм|USB-C (Thunderbolt);Підтримка стилуса|Apple Pencil Pro;Гарантія|12 місяців",
                58, 150));

        // Desktops
        l.add(p(16, "apple-imac-24-m3-8-256gb-silver", "Apple iMac 24\" 4.5K M3 8/256GB Silver", "Apple", "desktops",
                62999, 0, 4.9, 64, Stock.IN_STOCK, "imac24,imac24-2",
                "Моноблок завтовшки 11,5 мм з дисплеєм Retina 4.5K, камерою 1080p і студійними мікрофонами. У комплекті Magic Keyboard та Magic Mouse.",
                "Діагональ екрана|23.5\" Retina 4.5K, 4480x2520;Процесор|Apple M3 (8 ядер CPU);Оперативна пам'ять|8 ГБ;Накопичувач|256 ГБ SSD;Графіка|8-ядерний GPU;Порти|2x Thunderbolt / USB 4;Гарантія|12 місяців",
                38, 340));

        // Peripherals
        l.add(p(17, "logitech-mx-anywhere-3s-graphite", "Миша Logitech MX Anywhere 3S Wireless Graphite", "Logitech", "peripherals",
                3299, 3799, 4.8, 734, Stock.IN_STOCK, "mxanywhere",
                "Компактна миша для роботи будь-де: сенсор 8000 DPI працює навіть на склі, тихі кліки та колесо MagSpeed для швидкого прокручування.",
                "Тип підключення|Bluetooth, Logi Bolt;Роздільна здатність сенсора|8000 DPI;Кількість кнопок|6;Живлення|Акумулятор, USB-C;Автономність|до 70 днів;Гарантія|24 місяці",
                80, 400));
        l.add(p(18, "logitech-g-pro-x-superlight-2-black", "Миша ігрова Logitech G Pro X Superlight 2 Black", "Logitech", "peripherals",
                6499, 0, 4.9, 412, Stock.IN_STOCK, "gprox",
                "Кіберспортивна миша вагою 60 г із сенсором HERO 2 на 32 000 DPI та гібридними перемикачами LIGHTFORCE.",
                "Тип підключення|LIGHTSPEED (2.4 ГГц);Роздільна здатність сенсора|32 000 DPI;Вага|60 г;Частота опитування|до 8000 Гц;Автономність|до 95 годин;Гарантія|24 місяці",
                68, 260));
        l.add(p(19, "apple-magic-keyboard-touch-id-ua", "Клавіатура Apple Magic Keyboard з Touch ID (українська розкладка)", "Apple", "peripherals",
                6999, 0, 4.7, 156, Stock.IN_STOCK, "magickeyboard",
                "Бездротова клавіатура з датчиком Touch ID для Mac на чипах Apple. Ножичний механізм забезпечує стабільний та тихий набір.",
                "Тип підключення|Bluetooth, USB-C;Розкладка|Українська / англійська;Touch ID|Так;Живлення|Вбудований акумулятор;Гарантія|12 місяців",
                42, 500));
        l.add(p(20, "xiaomi-business-backpack-2-15-6-black", "Рюкзак для ноутбука Xiaomi Business Backpack 2 15.6\" Black", "Xiaomi", "peripherals",
                1299, 1599, 4.7, 1105, Stock.IN_STOCK, "backpack",
                "Місткий водовідштовхувальний рюкзак із м'яким відділенням для ноутбука до 15,6\", прихованою кишенею для документів і кріпленням до валізи.",
                "Розмір ноутбука|до 15.6\";Об'єм|26 л;Матеріал|Поліестер з водовідштовхувальним просоченням;Вага|0.8 кг;Колір|Чорний;Гарантія|6 місяців",
                76, 600));

        // TV
        l.add(p(21, "samsung-55-qe55q60dauxua-qled-4k", "Телевізор Samsung 55\" QE55Q60DAUXUA QLED 4K Smart TV", "Samsung", "tv",
                27999, 32999, 4.7, 488, Stock.IN_STOCK, "samsungq60,samsungq60-2",
                "QLED-телевізор із технологією Quantum Dot для насичених кольорів, процесором Quantum Lite 4K та тонким дизайном AirSlim. Smart TV на Tizen з підтримкою AirPlay.",
                "Діагональ екрана|55\";Роздільна здатність|3840x2160 (4K UHD);Тип матриці|QLED;Частота оновлення|50/60 Гц;HDR|HDR10+, HLG;Smart TV|Tizen;Гарантія|24 місяці",
                85, 250));
        l.add(p(22, "lg-50-50ur78006lk-4k-smart-tv", "Телевізор LG 50\" 50UR78006LK 4K Smart TV", "LG", "tv",
                17999, 19999, 4.6, 654, Stock.IN_STOCK, "lgur78",
                "Телевізор 4K з процесором α5 AI Gen6, підтримкою HDR10 Pro і платформою webOS 23 з голосовим керуванням через пульт Magic Remote.",
                "Діагональ екрана|50\";Роздільна здатність|3840x2160 (4K UHD);Тип матриці|LED;Частота оновлення|60 Гц;HDR|HDR10 Pro, HLG;Smart TV|webOS 23;Гарантія|24 місяці",
                81, 450));
        l.add(p(23, "xiaomi-tv-a-pro-43-2025", "Телевізор Xiaomi TV A Pro 43\" 2025 QLED 4K Google TV", "Xiaomi", "tv",
                12499, 0, 4.5, 231, Stock.IN_STOCK, "xiaomitv",
                "Безрамковий QLED-телевізор з Google TV, вбудованим Chromecast та динаміками Dolby Audio. Доступна ціна за 4K-зображення.",
                "Діагональ екрана|43\";Роздільна здатність|3840x2160 (4K UHD);Тип матриці|QLED;Частота оновлення|60 Гц;HDR|Dolby Vision, HDR10;Smart TV|Google TV;Гарантія|12 місяців",
                64, 90));

        // Audio
        l.add(p(24, "sony-wh-1000xm5-black", "Навушники Sony WH-1000XM5 Black", "Sony", "audio",
                13999, 15999, 4.8, 1176, Stock.IN_STOCK, "sonyxm5",
                "Еталонне активне шумозаглушення з вісьмома мікрофонами і двома процесорами. До 30 годин роботи, швидка зарядка: 3 хвилини — 3 години музики.",
                "Тип|Повнорозмірні, закриті;Підключення|Bluetooth 5.2;Шумозаглушення|Активне (ANC);Кодеки|SBC, AAC, LDAC;Автономність|до 30 годин;Вага|250 г;Гарантія|12 місяців",
                92, 600));
        l.add(p(25, "apple-airpods-pro-2-usb-c", "Навушники Apple AirPods Pro 2 з футляром MagSafe (USB-C)", "Apple", "audio",
                9999, 10999, 4.8, 2731, Stock.IN_STOCK, "airpodspro",
                "Чип H2, вдвічі потужніше шумозаглушення, адаптивний аудіорежим і персоналізоване просторове аудіо. Футляр з динаміком для пошуку через «Локатор».",
                "Тип|Вкладиші (TWS);Підключення|Bluetooth 5.3;Шумозаглушення|Активне (ANC);Захист|IP54;Автономність|до 6 годин (30 з футляром);Роз'єм футляра|USB-C, MagSafe;Гарантія|12 місяців",
                97, 380));
        l.add(p(26, "jbl-tune-770nc-black", "Навушники JBL Tune 770NC Black", "JBL", "audio",
                3999, 4799, 4.6, 892, Stock.IN_STOCK, "jbl770",
                "Бездротові навушники з адаптивним шумозаглушенням, фірмовим звуком JBL Pure Bass і рекордною автономністю до 70 годин.",
                "Тип|Повнорозмірні, закриті;Підключення|Bluetooth 5.3;Шумозаглушення|Адаптивне (ANC);Автономність|до 70 годин;Вага|232 г;Гарантія|12 місяців",
                83, 420));
        l.add(p(27, "audio-technica-ath-m50x-black", "Навушники Audio-Technica ATH-M50x Black", "Audio-Technica", "audio",
                6799, 0, 4.9, 512, Stock.IN_STOCK, "athm50x",
                "Студійні монітори, що стали стандартом для звукорежисерів. Точна передача частот, поворотні чашки і три знімні кабелі в комплекті.",
                "Тип|Повнорозмірні, закриті;Підключення|Дротове, 3.5 / 6.3 мм;Діапазон частот|15–28 000 Гц;Опір|38 Ом;Вага|285 г;Гарантія|12 місяців",
                52, 900));
        l.add(p(28, "sony-wh-ch720n-black", "Навушники Sony WH-CH720N Black", "Sony", "audio",
                4499, 4999, 4.6, 703, Stock.IN_STOCK, "sonych720",
                "Найлегші навушники Sony з шумозаглушенням — лише 192 г. Процесор V1, до 35 годин роботи та підтримка DSEE для відновлення якості стиснутого звуку.",
                "Тип|Повнорозмірні, закриті;Підключення|Bluetooth 5.2;Шумозаглушення|Активне (ANC);Автономність|до 35 годин;Вага|192 г;Гарантія|12 місяців",
                71, 500));
        l.add(p(29, "samsung-galaxy-buds2-pro-graphite", "Навушники Samsung Galaxy Buds2 Pro Graphite", "Samsung", "audio",
                5499, 6999, 4.6, 1240, Stock.IN_STOCK, "buds2pro",
                "Компактні TWS-навушники з 24-бітним Hi-Fi звуком, інтелектуальним ANC і захистом IPX7. Автоматичне перемикання між пристроями Galaxy.",
                "Тип|Вкладиші (TWS);Підключення|Bluetooth 5.3;Шумозаглушення|Активне (ANC);Захист|IPX7;Автономність|до 5 годин (18 з футляром);Гарантія|12 місяців",
                74, 700));
        l.add(p(30, "jbl-tune-beam-black", "Навушники JBL Tune Beam Black", "JBL", "audio",
                3299, 0, 4.5, 377, Stock.IN_STOCK, "tunebeam",
                "Навушники-вкладиші з адаптивним шумозаглушенням, чотирма мікрофонами для чітких дзвінків і до 48 годин роботи з футляром.",
                "Тип|Вкладиші (TWS);Підключення|Bluetooth 5.3;Шумозаглушення|Адаптивне (ANC);Захист|IP54;Автономність|до 12 годин (48 з футляром);Гарантія|12 місяців",
                55, 300));
        l.add(p(31, "jbl-flip-6-black", "Портативна колонка JBL Flip 6 Black", "JBL", "audio",
                4699, 5299, 4.8, 1630, Stock.IN_STOCK, "jblflip6",
                "Двосмугова портативна колонка з окремим твітером, захистом IP67 та функцією PartyBoost для об'єднання кількох колонок JBL.",
                "Потужність|20 Вт + 10 Вт;Підключення|Bluetooth 5.1;Захист|IP67;Автономність|до 12 годин;Вага|550 г;Гарантія|12 місяців",
                90, 800));
        l.add(p(32, "jbl-pulse-5-black", "Портативна колонка JBL Pulse 5 Black", "JBL", "audio",
                9999, 0, 4.7, 214, Stock.LOW, "jblpulse5",
                "Колонка з кругоутворювальним звуком 360° і світловим шоу на всю висоту корпусу, що реагує на ритм музики. Захист від води та пилу IP67.",
                "Потужність|30 Вт + 10 Вт;Підключення|Bluetooth 5.3;Захист|IP67;Автономність|до 12 годин;Підсвітка|RGB, 360°;Гарантія|12 місяців",
                44, 200));
        l.add(p(33, "edifier-r1280db-black", "Акустична система Edifier R1280DB Black", "Edifier", "audio",
                5199, 0, 4.8, 466, Stock.IN_STOCK, "edifier",
                "Активні полочні колонки 2.0 з дерев'яними корпусами, Bluetooth, оптичним і коаксіальним входами. Пульт ДК у комплекті.",
                "Тип|Полочна акустика 2.0;Потужність|2 x 21 Вт;Підключення|Bluetooth, RCA, оптичний, коаксіальний;Матеріал корпусу|МДФ;Гарантія|12 місяців",
                50, 1200));

        // Smartwatches
        l.add(p(34, "apple-watch-series-9-gps-45mm-midnight", "Apple Watch Series 9 GPS 45mm Midnight Aluminium", "Apple", "smartwatches",
                16999, 18999, 4.8, 588, Stock.IN_STOCK, "watch9,watch9-2",
                "Дисплей яскравістю до 2000 ніт, жест «подвійний дотик» та чип S9 SiP. Відстеження сну, ЕКГ і вимірювання кисню в крові.",
                "Розмір корпусу|45 мм;Дисплей|Always-On Retina LTPO OLED;Матеріал корпусу|Алюміній;Захист|WR50, IP6X;Датчики|ЕКГ, SpO2, температура;Автономність|до 18 годин;Гарантія|12 місяців",
                87, 380));
        l.add(p(35, "apple-watch-se-2-gps-44mm-midnight", "Apple Watch SE 2 GPS 44mm Midnight Aluminium", "Apple", "smartwatches",
                10999, 0, 4.7, 902, Stock.IN_STOCK, "watchse",
                "Доступний спосіб отримати досвід Apple Watch: відстеження тренувань, виявлення падіння та аварії, сповіщення про пульс.",
                "Розмір корпусу|44 мм;Дисплей|Retina LTPO OLED;Матеріал корпусу|Алюміній;Захист|WR50;Датчики|Пульсометр, акселерометр, гіроскоп;Автономність|до 18 годин;Гарантія|12 місяців",
                78, 720));
        l.add(p(36, "apple-watch-nike-series-9-41mm", "Apple Watch Nike Series 9 GPS 41mm Midnight Sport Band", "Apple", "smartwatches",
                17499, 0, 4.8, 241, Stock.IN_STOCK, "watchnike,watchnike-2",
                "Спеціальна версія для бігунів з ексклюзивними циферблатами Nike та доступом до програм Nike Run Club.",
                "Розмір корпусу|41 мм;Дисплей|Always-On Retina LTPO OLED;Матеріал корпусу|Алюміній;Ремінець|Nike Sport Band;Захист|WR50, IP6X;Автономність|до 18 годин;Гарантія|12 місяців",
                54, 380));
        l.add(p(37, "amazfit-gts-4-infinite-black", "Смарт-годинник Amazfit GTS 4 Infinite Black", "Amazfit", "smartwatches",
                5999, 7499, 4.6, 433, Stock.IN_STOCK, "amazfit",
                "Тонкий годинник з AMOLED-екраном 1,75\", двочастотним GPS і понад 150 спортивними режимами. До 8 днів автономної роботи.",
                "Розмір екрана|1.75\" AMOLED;Матеріал корпусу|Алюміній;Захист|5 ATM;GPS|Двочастотний;Автономність|до 8 днів;Гарантія|12 місяців",
                61, 600));
        l.add(p(38, "huawei-watch-gt-4-41mm-white", "Смарт-годинник Huawei Watch GT 4 41mm White", "Huawei", "smartwatches",
                8499, 9999, 4.7, 318, Stock.IN_STOCK, "huaweigt4",
                "Елегантний годинник з корпусом із нержавіючої сталі, точним моніторингом пульсу TruSense і до 7 днів роботи від одного заряду.",
                "Розмір корпусу|41 мм;Дисплей|1.32\" AMOLED;Матеріал корпусу|Нержавіюча сталь;Захист|5 ATM;Автономність|до 7 днів;Гарантія|12 місяців",
                49, 400));

        // Photo
        l.add(p(39, "canon-eos-250d-kit-18-55mm", "Фотоапарат Canon EOS 250D Kit EF-S 18-55mm IS STM Black", "Canon", "photo",
                28999, 31999, 4.8, 327, Stock.IN_STOCK, "canon250d",
                "Найлегша дзеркальна камера з поворотним екраном, записом відео 4K і швидким автофокусом Dual Pixel CMOS AF. Ідеальна перша «дзеркалка».",
                "Тип|Дзеркальний;Матриця|24.1 Мп APS-C CMOS;Відео|4K 25p;Екран|3\" поворотний, сенсорний;Об'єктив|EF-S 18-55mm IS STM;Вага|449 г;Гарантія|24 місяці",
                69, 800));
        l.add(p(40, "sony-alpha-a7-iv-body", "Фотоапарат Sony Alpha a7 IV Body", "Sony", "photo",
                89999, 0, 4.9, 142, Stock.IN_STOCK, "sonya7",
                "Повнокадрова бездзеркальна камера на 33 Мп для фото і відео. Відстеження очей у реальному часі, 10-бітне відео 4K 60p та 5-осьова стабілізація.",
                "Тип|Бездзеркальний;Матриця|33 Мп Full Frame Exmor R;Відео|4K 60p, 10 біт;Стабілізація|5-осьова IBIS;Екран|3\" поворотний, сенсорний;Вага|658 г;Гарантія|24 місяці",
                47, 700));
        l.add(p(41, "nikon-z5-kit-24-50mm", "Фотоапарат Nikon Z5 Kit 24-50mm f/4-6.3", "Nikon", "photo",
                52999, 57999, 4.8, 96, Stock.IN_STOCK, "nikonz5",
                "Доступна повнокадрова бездзеркалка з погодозахищеним корпусом, двома слотами SD та 5-осьовою стабілізацією матриці.",
                "Тип|Бездзеркальний;Матриця|24.3 Мп Full Frame CMOS;Відео|4K 30p;Стабілізація|5-осьова IBIS;Об'єктив|NIKKOR Z 24-50mm;Вага|675 г;Гарантія|24 місяці",
                36, 900));
        l.add(p(42, "fujifilm-x100vi-silver", "Фотоапарат Fujifilm X100VI Silver", "Fujifilm", "photo",
                74999, 0, 4.9, 61, Stock.OUT, "x100vi",
                "Культовий компакт у ретро-стилі з матрицею 40 Мп, вбудованою стабілізацією та 20 режимами симуляції плівки Fujifilm.",
                "Тип|Компактний;Матриця|40.2 Мп APS-C X-Trans CMOS 5 HR;Об'єктив|23mm f/2;Відео|6.2K 30p;Стабілізація|6-ступенева IBIS;Вага|521 г;Гарантія|24 місяці",
                62, 260));
        l.add(p(43, "polaroid-now-gen-2-white", "Камера миттєвого друку Polaroid Now Gen 2 White", "Polaroid", "photo",
                6299, 0, 4.6, 188, Stock.IN_STOCK, "polaroid",
                "Аналогова камера миттєвого друку з автофокусом, подвійною експозицією та таймером. Працює з плівкою Polaroid i-Type та 600.",
                "Тип|Миттєвого друку;Формат плівки|i-Type, 600;Фокус|Автоматичний, 2 об'єктиви;Живлення|Акумулятор, USB-C;Вага|457 г;Гарантія|12 місяців",
                45, 500));
        l.add(p(44, "dji-mavic-3-classic-dji-rc", "Квадрокоптер DJI Mavic 3 Classic (DJI RC)", "DJI", "photo",
                64999, 69999, 4.9, 117, Stock.LOW, "mavic3",
                "Камера Hasselblad з матрицею 4/3, відео 5.1K і до 46 хвилин польоту. Всенаправлені датчики перешкод і пульт DJI RC з екраном.",
                "Камера|Hasselblad L2D-20c, 20 Мп, 4/3 CMOS;Відео|5.1K 50p, 4K 120p;Час польоту|до 46 хв;Дальність передачі|до 15 км (O3+);Вага|895 г;Гарантія|12 місяців",
                53, 600));
        l.add(p(45, "dji-phantom-4-pro-v2", "Квадрокоптер DJI Phantom 4 Pro V2.0", "DJI", "photo",
                69999, 0, 4.8, 203, Stock.OUT, "phantom4",
                "Професійний квадрокоптер з дюймовою матрицею 20 Мп, механічним затвором і системою OcuSync 2.0 для стабільного зв'язку.",
                "Камера|20 Мп, 1\" CMOS, механічний затвор;Відео|4K 60p;Час польоту|до 30 хв;Дальність передачі|до 8 км;Вага|1375 г;Гарантія|12 місяців",
                20, 1600));

        // Gaming
        l.add(p(46, "sony-playstation-5-slim-digital-edition", "Ігрова консоль Sony PlayStation 5 Slim Digital Edition 1TB", "Sony", "consoles",
                19999, 22999, 4.9, 1874, Stock.IN_STOCK, "ps5",
                "Оновлена компактна PS5 з SSD на 1 ТБ, підтримкою 4K 120 Гц і трасування променів. Бездротовий контролер DualSense з тактильним відгуком у комплекті.",
                "Процесор|AMD Zen 2, 8 ядер;Графіка|AMD RDNA 2, 10.3 TFLOPS;Накопичувач|1 ТБ SSD;Дисковод|Ні (цифрова версія);Роздільна здатність|до 4K 120 Гц;Гарантія|12 місяців",
                99, 350));
        l.add(p(47, "nintendo-switch-oled-neon", "Ігрова консоль Nintendo Switch OLED Neon Red/Blue", "Nintendo", "consoles",
                14999, 0, 4.9, 1022, Stock.IN_STOCK, "switcholed",
                "Гібридна консоль із 7-дюймовим OLED-екраном: грайте на телевізорі, у портативному режимі або на столі. 64 ГБ пам'яті та док-станція з LAN-портом.",
                "Екран|7\" OLED, 1280x720;Вбудована пам'ять|64 ГБ;Режими гри|ТВ, настільний, портативний;Автономність|4.5–9 годин;Контролери|Joy-Con (L)/(R);Гарантія|12 місяців",
                88, 900));
        l.add(p(48, "microsoft-xbox-wireless-controller-astral-purple", "Геймпад Microsoft Xbox Wireless Controller Astral Purple", "Microsoft", "gamepads",
                2799, 3199, 4.8, 846, Stock.IN_STOCK, "xboxpad",
                "Бездротовий геймпад для Xbox Series X|S, Xbox One, ПК та мобільних пристроїв. Текстуровані курки і гібридний D-pad.",
                "Сумісність|Xbox Series X|S, Xbox One, Windows, Android, iOS;Підключення|Xbox Wireless, Bluetooth, USB-C;Живлення|2 x AA;Автономність|до 40 годин;Гарантія|12 місяців",
                73, 400));
        l.add(p(49, "sony-playstation-4-slim-1tb", "Ігрова консоль Sony PlayStation 4 Slim 1TB", "Sony", "consoles",
                12999, 0, 4.8, 2650, Stock.OUT, "ps4",
                "Компактна PS4 з жорстким диском на 1 ТБ — величезна бібліотека ексклюзивів за доступною ціною.",
                "Процесор|AMD Jaguar, 8 ядер;Накопичувач|1 ТБ HDD;Дисковод|Blu-ray;Роздільна здатність|до 1080p;Гарантія|12 місяців",
                30, 2200));

        // Appliances
        l.add(p(50, "xiaomi-robot-vacuum-s10-white", "Робот-пилосос Xiaomi Robot Vacuum S10 White", "Xiaomi", "cleaning",
                8999, 10999, 4.6, 1342, Stock.IN_STOCK, "robotvac",
                "Робот-пилосос з лазерною навігацією LDS, потужністю всмоктування 4000 Па та функцією вологого прибирання. Керування з застосунку Mi Home.",
                "Тип прибирання|Сухе та вологе;Навігація|Лазерна (LDS);Потужність всмоктування|4000 Па;Ємність пилозбірника|300 мл;Автономність|до 130 хв;Гарантія|12 місяців",
                91, 500));
        l.add(p(51, "samsung-ww80t4040ee-ua-8kg", "Пральна машина Samsung WW80T4040EE/UA 8 кг", "Samsung", "cleaning",
                17999, 19999, 4.7, 612, Stock.IN_STOCK, "washer",
                "Фронтальна пральна машина з інверторним двигуном Digital Inverter, функцією парової обробки Hygiene Steam та 15-хвилинним швидким пранням.",
                "Тип завантаження|Фронтальне;Максимальне завантаження|8 кг;Швидкість віджиму|1400 об/хв;Клас енергоспоживання|A;Двигун|Інверторний;Гарантія|24 місяці",
                67, 700));
        l.add(p(52, "russell-hobbs-26090-56-mini-oven", "Електропіч Russell Hobbs 26090-56 Express Air Fry", "Russell Hobbs", "kitchen",
                3499, 0, 4.5, 198, Stock.IN_STOCK, "minioven",
                "Мініпіч об'ємом 12,6 л з функцією аерогриля: запікає, підсмажує та розігріває швидше і з меншою кількістю олії.",
                "Об'єм|12.6 л;Потужність|1500 Вт;Режими|Аерогриль, запікання, гриль, тости;Таймер|60 хв;Гарантія|24 місяці",
                40, 300));
        l.add(p(53, "philips-hr2041-00-blender", "Блендер Philips HR2041/00 Series 3000", "Philips", "kitchen",
                1999, 2399, 4.6, 875, Stock.IN_STOCK, "blender",
                "Стаціонарний блендер потужністю 450 Вт з ударостійкою чашею на 1,9 л. Ідеальний для смузі, супів-пюре та молочних коктейлів.",
                "Тип|Стаціонарний;Потужність|450 Вт;Об'єм чаші|1.9 л;Кількість швидкостей|1 + імпульсний режим;Гарантія|24 місяці",
                63, 800));
        l.add(p(54, "melitta-look-v-therm-coffee-maker", "Крапельна кавоварка Melitta Look V Therm Black/Steel", "Melitta", "kitchen",
                4299, 0, 4.7, 156, Stock.IN_STOCK, "coffeemaker",
                "Кавоварка з термоглеком на 8–12 чашок, системою ароматизації Aroma Selector і таймером автоматичного вимкнення.",
                "Тип|Крапельна;Потужність|1000 Вт;Об'єм|1.25 л, термоглек;Регулювання міцності|Так;Гарантія|24 місяці",
                34, 400));

        // Fashion
        l.add(p(55, "nike-air-force-1-07-pastel", "Кросівки Nike Air Force 1 '07 Pastel White/Multi", "Nike", "sneakers",
                4799, 5499, 4.8, 422, Stock.IN_STOCK, "af1pastel",
                "Легендарний силует баскетбольних кросівок 1982 року в пастельних відтінках. Шкіряний верх і амортизація Nike Air у підошві.",
                "Стать|Жіночі;Матеріал верху|Натуральна шкіра;Підошва|Гума з Nike Air;Розміри|36–41;Сезон|Весна–осінь",
                79, 200));
        l.add(p(56, "nike-air-max-90-white-red", "Кросівки Nike Air Max 90 White/University Red", "Nike", "sneakers",
                5999, 0, 4.8, 296, Stock.IN_STOCK, "airmax90",
                "Ікона бігового стилю з видимим блоком Max Air у п'яті та вафельною підошвою. Поєднання шкіри та текстилю.",
                "Стать|Унісекс;Матеріал верху|Шкіра, текстиль;Підошва|Гума з Max Air;Розміри|38–46;Сезон|Весна–осінь",
                65, 300));
        l.add(p(57, "nike-free-rn-5-0-university-red", "Кросівки для бігу Nike Free RN 5.0 University Red", "Nike", "sneakers",
                3999, 4999, 4.6, 184, Stock.IN_STOCK, "freern",
                "Легкі бігові кросівки з гнучкою підошвою, що імітує біг босоніж. Дихаючий трикотажний верх Flyknit.",
                "Стать|Чоловічі;Матеріал верху|Текстиль Flyknit;Підошва|Піна з глибокими прорізами;Розміри|40–46;Призначення|Біг",
                48, 500));
        l.add(p(58, "nike-air-force-1-wheat", "Кросівки Nike Air Force 1 Low Wheat", "Nike", "sneakers",
                5299, 0, 4.7, 151, Stock.LOW, "af1wheat",
                "Культова версія Air Force 1 у кольорі Wheat з нубуковим верхом і контрастною гумовою підошвою.",
                "Стать|Чоловічі;Матеріал верху|Нубук;Підошва|Гума з Nike Air;Розміри|40–46;Сезон|Осінь–зима",
                41, 400));
        l.add(p(59, "nike-superrep-go-3-volt", "Кросівки для тренувань Nike SuperRep Go 3 Volt", "Nike", "sneakers",
                3599, 4299, 4.5, 97, Stock.IN_STOCK, "superrep",
                "Кросівки для функціональних тренувань та кардіо з м'якою піною і широкою стійкою підошвою.",
                "Стать|Чоловічі;Матеріал верху|Текстиль;Підошва|Піна, гума;Розміри|40–46;Призначення|Тренування в залі",
                35, 250));
        l.add(p(60, "nike-sb-zoom-janoski-white", "Кеди Nike SB Zoom Stefan Janoski White", "Nike", "sneakers",
                3299, 0, 4.6, 133, Stock.IN_STOCK, "janoski",
                "Легкі скейтерські кеди з амортизацією Zoom Air та сітчастим верхом, що добре вентилюється.",
                "Стать|Унісекс;Матеріал верху|Текстиль;Підошва|Гума із Zoom Air;Розміри|38–45;Сезон|Літо",
                31, 600));
        l.add(p(61, "gucci-gg-marmont-small-black", "Сумка Gucci GG Marmont Small Matelassé Black", "Gucci", "bags",
                89999, 0, 4.9, 22, Stock.LOW, "marmont",
                "Стьобана сумка з м'якої шкіри шевроном та фурнітурою Double G у кольорі античного золота. Ланцюжок-ремінець довжиною 49 см.",
                "Матеріал|Натуральна шкіра;Розмір|26 x 15 x 7 см;Застібка|Магнітна;Ремінець|Ланцюжок, 49 см;Країна виробництва|Італія",
                12, 400));

        // Beauty
        l.add(p(62, "chanel-bleu-de-chanel-edp-100ml", "Парфумована вода для чоловіків Chanel Bleu de Chanel 100 мл", "Chanel", "perfume",
                6899, 0, 4.9, 684, Stock.IN_STOCK, "bleu",
                "Деревно-ароматичний аромат свободи: свіжість цитрусових, глибина ладану і теплий шлейф сандалового дерева.",
                "Тип|Парфумована вода (EDP);Об'єм|100 мл;Стать|Чоловіча;Група аромату|Деревна, ароматична;Верхні ноти|Грейпфрут, лимон, м'ята",
                75, 1000));
        l.add(p(63, "chanel-no5-edp-100ml", "Парфумована вода для жінок Chanel N°5 100 мл", "Chanel", "perfume",
                7999, 8599, 4.9, 512, Stock.IN_STOCK, "no5",
                "Найвідоміший аромат у світі — квітково-альдегідна композиція з травневою трояндою, жасмином і ваніллю.",
                "Тип|Парфумована вода (EDP);Об'єм|100 мл;Стать|Жіноча;Група аромату|Квіткова, альдегідна;Верхні ноти|Альдегіди, неролі, бергамот",
                59, 1000));
        l.add(p(64, "chanel-coco-edp-100ml", "Парфумована вода для жінок Chanel Coco 100 мл", "Chanel", "perfume",
                7499, 0, 4.8, 219, Stock.IN_STOCK, "coco",
                "Східно-пряний аромат-характер: гвоздика, троянда та ладан у поєднанні з теплими нотами бобів тонка.",
                "Тип|Парфумована вода (EDP);Об'єм|100 мл;Стать|Жіноча;Група аромату|Східна, пряна;Верхні ноти|Коріандр, мандарин, персик",
                33, 1000));

        // Kids
        l.add(p(65, "lego-classic-11030-big-creative-brick-box", "Конструктор LEGO Classic Велика коробка кубиків 11030", "LEGO", "toys",
                1899, 2299, 4.9, 1408, Stock.IN_STOCK, "lego11030",
                "1000 деталей 33 кольорів, серед яких колеса, вікна та очі — для будь-яких фантазій. Зручна коробка для зберігання.",
                "Вік|4+;Кількість деталей|1000;Серія|LEGO Classic;Матеріал|Пластик ABS;Країна виробництва|Данія",
                82, 900));

        // Sport
        l.add(p(66, "bergamont-sweep-4-28-white", "Велосипед міський Bergamont Sweep 4 28\" White", "Bergamont", "bikes",
                21999, 24999, 4.7, 58, Stock.IN_STOCK, "bike",
                "Мінімалістичний міський велосипед зі сталевою рамою, планетарною втулкою на 3 передачі та ременем замість ланцюга.",
                "Розмір коліс|28\";Матеріал рами|Сталь;Кількість швидкостей|3 (планетарна втулка);Гальма|Ободні V-brake;Вага|11.9 кг;Гарантія|24 місяці",
                26, 300));

        // Food
        l.add(p(67, "lavazza-qualita-rossa-1kg", "Кава в зернах Lavazza Qualità Rossa 1 кг", "Lavazza", "coffee",
                599, 699, 4.8, 3124, Stock.IN_STOCK, "lavazza",
                "Класична італійська суміш арабіки та робусти з насиченим тілом і нотками шоколаду та сухофруктів. Чудова для еспресо та капучино.",
                "Тип|Зернова;Вага|1 кг;Склад|70% арабіка, 30% робуста;Обсмаження|Середнє;Країна виробництва|Італія",
                95, 1500));

        return l;
    }

    private static Product p(int id, String slug, String name, String brand, String category, int price, int oldPrice,
                             double rating, int reviews, Stock stock, String images, String description, String specs,
                             int popularity, int ageDays) {
        List<String> imgs = Arrays.stream(images.split(",")).map(s -> IMG + s.trim() + ".jpg").toList();
        List<Spec> sp = Arrays.stream(specs.split(";")).map(s -> {
            int i = s.indexOf('|');
            return new Spec(s.substring(0, i), s.substring(i + 1));
        }).toList();
        return new Product(id, slug, name, brand, category, price, oldPrice, rating, reviews, stock, imgs, description,
                sp, popularity, ageDays);
    }

    // ------------------------------------------------------------ promo content

    public static List<Banner> heroSlides() {
        return List.of(
                new Banner("MacBook Air на чипі M3", "Знижка до 5 000 ₴ та розстрочка 0% на 10 платежів",
                        "Обрати MacBook", "/catalog/laptops?brand=Apple", "/img/banner/apple.jpg", "dark", "Тиждень Apple"),
                new Banner("Тиша, яку чути", "Навушники з шумозаглушенням зі знижкою до −25%",
                        "До навушників", "/catalog/audio?onSale=1", "/img/banner/audio.jpg", "green", "Аудіо-розпродаж"),
                new Banner("Прибирання без вашої участі", "Роботи-пилососи та пральні машини з доставкою за 1 день",
                        "Дивитися техніку", "/catalog/appliances", "/img/banner/robot.jpg", "light", "Розумний дім"),
                new Banner("PlayStation 5 Slim", "−3 000 ₴ на консоль і другий геймпад у подарунок до кінця тижня",
                        "Купити PS5", "/product/46", "/img/banner/gaming.jpg", "mint", "Для геймерів"));
    }

    public static List<Banner> promoTiles() {
        return List.of(
                new Banner("Розстрочка 0% до 10 платежів", "Оформлення онлайн за 2 хвилини без довідок про доходи",
                        "Детальніше", "/info/credit", "/img/banner/shop.jpg", "green", null),
                new Banner("Кросівки, що варті ваших кроків", "Нові моделі Nike зі знижками до −20%",
                        "До кросівок", "/catalog/sneakers", "/img/banner/sneakers.jpg", "light", null),
                new Banner("Безкоштовна доставка від 1 000 ₴", "У понад 10 000 пунктів видачі та поштоматів по всій Україні",
                        "Умови доставки", "/info/delivery", "/img/banner/bags.jpg", "dark", null));
    }
}
