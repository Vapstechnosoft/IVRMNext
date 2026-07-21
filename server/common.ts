'use server';
import { type ApiResponse, api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IDropdown, IUserAccessibleModules, UserNotification } from '@/types';

// Helper to convert API icon names to Lucide React component names
function mapIcon(icon: string | null): string {
    if (!icon) return 'Settings';

    // Specific mappings for icons that don't follow the kebab-case → PascalCase rule
    const specialMappings: Record<string, string> = {
        money: 'BadgeIndianRupee',
        dollar: 'DollarSign',
        rupee: 'IndianRupee',
        book: 'BookOpen',
        calendar: 'Calendar',
        settings: 'Settings',
        cog: 'Settings',
        gear: 'Settings',
        'user-plus': 'UserPlus',
        'badge-indian-rupee': 'BadgeIndianRupee',
        'graduation-cap': 'GraduationCap',
        clock: 'Clock',
        package: 'Package',
        trophy: 'Trophy',
        'message-square': 'MessageSquare',
        users: 'Users',
        'book-open': 'BookOpen',
        'file-text': 'FileText',
        'bar-chart': 'BarChart',
        'calendar-days': 'CalendarDays',
        'shopping-cart': 'ShoppingCart',
        'map-pin': 'MapPin',
        home: 'Home',
        building: 'Building',
        building2: 'Building2',
        layers: 'Layers',
        award: 'Award',
        'user-check': 'UserCheck',
        'user-x': 'UserX',
        'user-cog': 'UserCog',
        shield: 'Shield',
        'log-out': 'LogOut',
        'log-in': 'LogIn',
        'key-round': 'KeyRound',
        'lock-keyhole': 'LockKeyhole',
        'mail-open': 'MailOpen',
        'heart-handshake': 'HeartHandshake',
        images: 'Images',
        megaphone: 'Megaphone',
        search: 'Search',
        'file-pie-chart': 'FilePieChart',
        'user-search': 'UserSearch',
        'arrow-right-left': 'ArrowRightLeft',
        'layout-dashboard': 'LayoutDashboard',
        'user-round-cog': 'UserRoundCog',
        'user-round-plus': 'UserRoundPlus',
        'user-round-check': 'UserRoundCheck',
        'calendar-clock': 'CalendarClock',
        sparkles: 'Sparkles',
        'file-stack': 'FileStack',
        'book-open-text': 'BookOpenText',
        activity: 'Activity',
        percent: 'Percent',
        store: 'Store',
        boxes: 'Boxes',
        ruler: 'Ruler',
        box: 'Box',
        'clipboard-list': 'ClipboardList',
        'package-minus': 'PackageMinus',
        grid: 'Grid',
        wifi: 'Wifi',
        'door-open': 'DoorOpen',
        'list-checks': 'ListChecks',
        sliders: 'Sliders',
        list: 'List',
        'pen-square': 'PenSquare',
        'clipboard-edit': 'ClipboardEdit',
        'calendar-range': 'CalendarRange',
        'file-plus': 'FilePlus',
        'check-circle': 'CheckCircle',
        'file-bar-chart': 'FileBarChart',
        'bar-chart-3': 'BarChart3',
        'bar-chart-horizontal': 'BarChartHorizontal',
        'line-chart': 'LineChart',
        'area-chart': 'AreaChart',
        'pie-chart': 'PieChart',
        cell: 'Cell',
        database: 'Database',
        'hard-drive': 'HardDrive',
        server: 'Server',
        cloud: 'Cloud',
        globe: 'Globe',
        network: 'Network',
        zap: 'Zap',
        bolt: 'Bolt',
        sun: 'Sun',
        moon: 'Moon',
        'cloud-sun': 'CloudSun',
        'cloud-moon': 'CloudMoon',
        'cloud-rain': 'CloudRain',
        'cloud-snow': 'CloudSnow',
        'cloud-lightning': 'CloudLightning',
        'cloud-fog': 'CloudFog',
        umbrella: 'Umbrella',
        thermometer: 'Thermometer',
        droplet: 'Droplet',
        wind: 'Wind',
        compass: 'Compass',
        navigation: 'Navigation',
        anchor: 'Anchor',
        ship: 'Ship',
        truck: 'Truck',
        car: 'Car',
        bike: 'Bike',
        bus: 'Bus',
        train: 'Train',
        plane: 'Plane',
        helicopter: 'Helicopter',
        drone: 'Drone',
        rocket: 'Rocket',
        satellite: 'Satellite',
        space: 'Space',
        astronaut: 'Astronaut',
        alien: 'Alien',
        robot: 'Robot',
        android: 'Android',
        linux: 'Linux',
        windows: 'Windows',
        chrome: 'Chrome',
        firefox: 'Firefox',
        safari: 'Safari',
        edge: 'Edge',
        opera: 'Opera',
        ie: 'IE',
        facebook: 'Facebook',
        twitter: 'Twitter',
        linkedin: 'LinkedIn',
        instagram: 'Instagram',
        youtube: 'Youtube',
        twitch: 'Twitch',
        github: 'Github',
        gitlab: 'Gitlab',
        bitbucket: 'Bitbucket',
        slack: 'Slack',
        discord: 'Discord',
        teams: 'Teams',
        zoom: 'Zoom',
        meet: 'Meet',
        hangouts: 'Hangouts',
        skype: 'Skype',
        whatsapp: 'Whatsapp',
        telegram: 'Telegram',
        signal: 'Signal',
        messenger: 'Messenger',
        snapchat: 'Snapchat',
        tiktok: 'Tiktok',
        pinterest: 'Pinterest',
        reddit: 'Reddit',
        tumblr: 'Tumblr',
        flickr: 'Flickr',
        vimeo: 'Vimeo',
        dribbble: 'Dribbble',
        behance: 'Behance',
        medium: 'Medium',
        wordpress: 'Wordpress',
        joomla: 'Joomla',
        drupal: 'Drupal',
        magento: 'Magento',
        shopify: 'Shopify',
        woocommerce: 'WooCommerce',
        prestashop: 'Prestashop',
        opencart: 'Opencart',
        php: 'PHP',
        python: 'Python',
        java: 'Java',
        javascript: 'JavaScript',
        typescript: 'TypeScript',
        html: 'HTML',
        css: 'CSS',
        sass: 'Sass',
        less: 'Less',
        stylus: 'Stylus',
        postcss: 'PostCSS',
        webpack: 'Webpack',
        gulp: 'Gulp',
        grunt: 'Grunt',
        npm: 'Npm',
        yarn: 'Yarn',
        pnpm: 'Pnpm',
        bun: 'Bun',
        deno: 'Deno',
        node: 'Node',
        express: 'Express',
        nestjs: 'NestJS',
        fastify: 'Fastify',
        koa: 'Koa',
        hapijs: 'HapiJS',
        loopback: 'Loopback',
        sails: 'Sails',
        meteor: 'Meteor',
        ember: 'Ember',
        backbone: 'Backbone',
        angular: 'Angular',
        vue: 'Vue',
        react: 'React',
        svelte: 'Svelte',
        solid: 'Solid',
        qwik: 'Qwik',
        lit: 'Lit',
        stencil: 'Stencil',
        preact: 'Preact',
        inferno: 'Inferno',
        alpine: 'Alpine',
        htmx: 'Htmx',
        hyperscript: 'Hyperscript',
        bootstrap: 'Bootstrap',
        tailwind: 'Tailwind',
        bulma: 'Bulma',
        foundation: 'Foundation',
        material: 'Material',
        ant: 'Ant',
        chakra: 'Chakra',
        mui: 'Mui',
        fluent: 'Fluent',
        radix: 'Radix',
        shadcn: 'Shadcn',
        lucide: 'Lucide',
        feather: 'Feather',
        'font-awesome': 'FontAwesome',
        heroicons: 'Heroicons',
        tabler: 'Tabler',
        phosphor: 'Phosphor',
        remix: 'Remix',
        ionicons: 'Ionicons',
        eva: 'Eva',
        'ant-design': 'AntDesign',
        'material-symbols': 'MaterialSymbols',
        'bootstrap-icons': 'BootstrapIcons',
        boxicons: 'BoxIcons',
        'simple-icons': 'SimpleIcons',
        cryptocurrency: 'Cryptocurrency',
        coin: 'Coin',
        banknote: 'Banknote',
        'credit-card': 'CreditCard',
        wallet: 'Wallet',
        currency: 'Currency',
        'dollar-sign': 'DollarSign',
        euro: 'Euro',
        pound: 'Pound',
        yen: 'Yen',
        ruble: 'Ruble',
        lira: 'Lira',
        peso: 'Peso',
        shekel: 'Shekel',
        franc: 'Franc',
        bitcoin: 'Bitcoin',
        ethereum: 'Ethereum',
        litecoin: 'Litecoin',
        dogecoin: 'Dogecoin',
        tether: 'Tether',
        solana: 'Solana',
        cardano: 'Cardano',
        polkadot: 'Polkadot',
        chainlink: 'Chainlink',
        uniswap: 'Uniswap',
        aave: 'Aave',
        maker: 'Maker',
        compound: 'Compound',
        pancake: 'Pancake',
        cake: 'Cake',
        cookie: 'Cookie',
        bread: 'Bread',
        pizza: 'Pizza',
        burger: 'Burger',
        fries: 'Fries',
        sandwich: 'Sandwich',
        sushi: 'Sushi',
        ramen: 'Ramen',
        noodles: 'Noodles',
        rice: 'Rice',
        curry: 'Curry',
        dumpling: 'Dumpling',
        bao: 'Bao',
        salad: 'Salad',
        fruit: 'Fruit',
        apple: 'Apple',
        banana: 'Banana',
        watermelon: 'Watermelon',
        grapes: 'Grapes',
        strawberry: 'Strawberry',
        blueberry: 'Blueberry',
        raspberry: 'Raspberry',
        blackberry: 'Blackberry',
        cherry: 'Cherry',
        peach: 'Peach',
        pear: 'Pear',
        plum: 'Plum',
        apricot: 'Apricot',
        mango: 'Mango',
        pineapple: 'Pineapple',
        coconut: 'Coconut',
        avocado: 'Avocado',
        tomato: 'Tomato',
        potato: 'Potato',
        carrot: 'Carrot',
        broccoli: 'Broccoli',
        cauliflower: 'Cauliflower',
        cucumber: 'Cucumber',
        onion: 'Onion',
        garlic: 'Garlic',
        chili: 'Chili',
        corn: 'Corn',
        peas: 'Peas',
        beans: 'Beans',
        lentils: 'Lentils',
        chickpea: 'Chickpea',
        tofu: 'Tofu',
        tempeh: 'Tempeh',
        seitan: 'Seitan',
        mushroom: 'Mushroom',
        cheese: 'Cheese',
        milk: 'Milk',
        yogurt: 'Yogurt',
        butter: 'Butter',
        egg: 'Egg',
        meat: 'Meat',
        chicken: 'Chicken',
        turkey: 'Turkey',
        duck: 'Duck',
        goose: 'Goose',
        quail: 'Quail',
        rabbit: 'Rabbit',
        lamb: 'Lamb',
        goat: 'Goat',
        beef: 'Beef',
        pork: 'Pork',
        bacon: 'Bacon',
        ham: 'Ham',
        sausage: 'Sausage',
        hotdog: 'Hotdog',
        kebab: 'Kebab',
        gyro: 'Gyro',
        shawarma: 'Shawarma',
        taco: 'Taco',
        burrito: 'Burrito',
        quesadilla: 'Quesadilla',
        nachos: 'Nachos',
        chips: 'Chips',
        salsa: 'Salsa',
        guacamole: 'Guacamole',
        hummus: 'Hummus',
        baba: 'Baba',
        falafel: 'Falafel',
        pita: 'Pita',
        naan: 'Naan',
        roti: 'Roti',
        chapati: 'Chapati',
        paratha: 'Paratha',
        samosa: 'Samosa',
        pakora: 'Pakora',
        bhaji: 'Bhaji',
        vada: 'Vada',
        idli: 'Idli',
        dosa: 'Dosa',
        sambar: 'Sambar',
        chutney: 'Chutney',
        raita: 'Raita',
        lassi: 'Lassi',
        chai: 'Chai',
        coffee: 'Coffee',
        tea: 'Tea',
        juice: 'Juice',
        smoothie: 'Smoothie',
        milkshake: 'Milkshake',
        soda: 'Soda',
        pop: 'Pop',
        cola: 'Cola',
        pepsi: 'Pepsi',
        coke: 'Coke',
        fanta: 'Fanta',
        sprite: 'Sprite',
        '7up': 'SevenUp',
        mountain: 'Mountain',
        dew: 'Dew',
        dr: 'Dr',
        root: 'Root',
        beer: 'Beer',
        ale: 'Ale',
        stout: 'Stout',
        lager: 'Lager',
        pilsner: 'Pilsner',
        ipa: 'Ipa',
        wine: 'Wine',
        champagne: 'Champagne',
        sparkling: 'Sparkling',
        cider: 'Cider',
        mead: 'Mead',
        sake: 'Sake',
        soju: 'Soju',
        vodka: 'Vodka',
        gin: 'Gin',
        rum: 'Rum',
        whiskey: 'Whiskey',
        bourbon: 'Bourbon',
        scotch: 'Scotch',
        tequila: 'Tequila',
        mezcal: 'Mezcal',
        cognac: 'Cognac',
        brandy: 'Brandy',
        liqueur: 'Liqueur',
        absinthe: 'Absinthe',
        vermouth: 'Vermouth',
        port: 'Port',
        sherry: 'Sherry',
        madeira: 'Madeira',
        marsala: 'Marsala',
        amaro: 'Amaro',
        bitters: 'Bitters',
        syrup: 'Syrup',
        honey: 'Honey',
        maple: 'Maple',
        agave: 'Agave',
        sugar: 'Sugar',
        salt: 'Salt',
        pepper: 'Pepper',
        spice: 'Spice',
        herb: 'Herb',
        oregano: 'Oregano',
        basil: 'Basil',
        thyme: 'Thyme',
        rosemary: 'Rosemary',
        sage: 'Sage',
        mint: 'Mint',
        cilantro: 'Cilantro',
        parsley: 'Parsley',
        dill: 'Dill',
        chive: 'Chive',
        tarragon: 'Tarragon',
        fennel: 'Fennel',
        anise: 'Anise',
        coriander: 'Coriander',
        cumin: 'Cumin',
        turmeric: 'Turmeric',
        ginger: 'Ginger',
        galangal: 'Galangal',
        lemongrass: 'Lemongrass',
        kaffir: 'Kaffir',
        kalamansi: 'Kalamansi'
    };

    if (specialMappings[icon]) {
        return specialMappings[icon];
    }

    // Convert kebab-case to PascalCase (e.g., "user-plus" → "UserPlus")
    return icon
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

export async function getUserAccessibleModules() {
    try {
        const session = await auth(); // Still useful for logging or future role checks

        // Fetch data from APIs
        const [mainModulesRes, subModulesRes, pageListRes] = await Promise.all([
            api.get<any>('preadmission', '/configuration/get_main_module_list'),
            api.get<any>('preadmission', '/configuration/get_submodule_list'),
            api.get<any>('preadmission', '/configuration/get_page_list')
        ]);

        const mainModules = mainModulesRes.data || [];
        const subModules = subModulesRes.data || [];
        const pages = pageListRes.data || [];

        console.log('main Modules', mainModules);
        console.log('subModules', subModules);
        console.log('pages', pages);

        // Build maps for quick lookup
        const subByParent = new Map<number, any[]>();
        subModules.forEach((sub: any) => {
            const parentId = sub.parentId;
            if (!subByParent.has(parentId)) {
                subByParent.set(parentId, []);
            }
            subByParent.get(parentId)!.push(sub);
        });

        // Filter pages: only keep those whose URL starts with "app."
        const pagesByMenuId = new Map<number, any[]>();
        pages.forEach((page: any) => {
            const url = page.ivrmP_PageURL || '';
            if (!url.startsWith('app.')) {
                const menuId = page.menuId;
                if (!pagesByMenuId.has(menuId)) {
                    pagesByMenuId.set(menuId, []);
                }
                pagesByMenuId.get(menuId)!.push({
                    id: page.pageId,
                    name: page.ivrmmP_PageName,
                    icon: 'Settings',
                    url: page.ivrmP_PageURL,
                    title: page.ivrmmP_PageName,
                    description: page.ivrmmP_PageName
                });
            }
        });

        // Sort helper
        const sortByOrder = (a: any, b: any) => (a.order || 0) - (b.order || 0);

        // Recursive function to build submenu structure, returns only non-empty submenus
        function buildSubMenu(parentId: number): any[] {
            const children = (subByParent.get(parentId) || []).sort(sortByOrder);
            const validChildren: any[] = [];

            for (const sub of children) {
                const hasGrandChildren = subByParent.has(sub.menuId);
                const itemPages = pagesByMenuId.get(sub.menuId) || [];

                let subMenuItems: any[] = [];
                if (hasGrandChildren) {
                    subMenuItems = buildSubMenu(sub.menuId);
                }

                // Include this submenu only if it has pages (directly) OR has non-empty submenus
                if (itemPages.length > 0 || subMenuItems.length > 0) {
                    const menuItem: any = {
                        id: sub.menuId,
                        name: sub.ivrmM_ModuleName,
                        icon: mapIcon(sub.ivrmmmI_Icon),
                        sub_menu: subMenuItems,
                        pages: hasGrandChildren ? [] : itemPages.sort(sortByOrder)
                    };
                    validChildren.push(menuItem);
                }
            }
            return validChildren;
        }

        // Build top-level modules (parentId === 0)
        const topModules = mainModules
            .filter((m: any) => m.parentId === 0)
            .sort(sortByOrder)
            .map((m: any) => {
                const subMenuStructure = buildSubMenu(m.menuId);
                // Only include the top module if it has at least one valid submenu (with pages)
                if (subMenuStructure.length === 0) {
                    return null;
                }
                return {
                    id: m.menuId,
                    name: m.ivrmM_ModuleName,
                    icon: mapIcon(m.ivrmmmI_Icon),
                    menu: [
                        {
                            id: 1,
                            name: m.ivrmM_ModuleName,
                            icon: mapIcon(m.ivrmmmI_Icon),
                            sub_menu: subMenuStructure
                        }
                    ]
                };
            })
            .filter((module: any) => module !== null);

        const aiEdgeModule = {
            id: 50005,
            name: 'AI Edge',
            icon: 'Sparkles',
            menu: [
                {
                    id: 1,
                    name: 'AI Edge',
                    icon: 'BookOpen',
                    sub_menu: [
                        {
                            id: 1,
                            name: 'AI Tools',
                            icon: 'Database',
                            pages: [
                                {
                                    id: 1,
                                    name: 'Question Paper Generator',
                                    icon: 'FileText',
                                    url: '/iframe/ai-question-paper-generator',
                                    title: 'AI Question Paper Generator',
                                    description: 'Generate question papers from textbooks using AI'
                                },
                                {
                                    id: 2,
                                    name: 'AI Notemaker',
                                    icon: 'FileText',
                                    url: '/iframe/ai-notemaker',
                                    title: 'AI Notemaker',
                                    description: 'Summarize and create structured notes from textbooks using AI'
                                },
                                {
                                    id: 3,
                                    name: 'AI Performance Analysis',
                                    icon: 'BarChart',
                                    url: '/Exam/exam-module/ai-performance-analysis',
                                    title: 'AI Performance Analysis',
                                    description: 'Analyze performance metrics and AI-driven insights'
                                },
                                {
                                    id: 4,
                                    name: 'AI Doubt resolver',
                                    icon: 'MessageSquare',
                                    url: '/iframe/ai-doubt-resolver',
                                    title: 'AI Doubt resolver',
                                    description: 'Resolve academic doubts using AI'
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        topModules.push(aiEdgeModule as any);

        return {
            success: true,
            message: 'Data fetched successfully!!',
            data: topModules
        } as ApiResponse<IUserAccessibleModules[]>;
    } catch (error) {
        console.error('Error fetching user accessible modules:', error);
        return {
            success: false,
            message: 'Failed to fetch modules',
            data: []
        } as ApiResponse<IUserAccessibleModules[]>;
    }
}

// Other functions remain unchanged...
export async function getCommonDropdown(name: string) {
    const url = `/v1/common/common_drop_down_list/${name}`;
    return await api.get<IDropdown[]>('default', url);
}

export async function getUserNotificationList(_priority?: string) {
    // const url = `/v1/user_notification?priority=${priority ?? 'normal'}`;

    // return await api.get<UserNotification[]>('admission', url);

    const response: ApiResponse<UserNotification[]> = {
        success: true,
        message: 'Data fetched successfully!!',
        data: [
            {
                id: 1,
                title: 'New Admission',
                message: 'New Admission added successfully!!',
                link: null,
                created_timestamp: new Date(-1).toISOString(),
                priority: 'normal',
                user_code: 'Admin_001',
                user_name: 'AdminVV'
            }
        ]
    };

    return await response;
}

export async function markReadUserNotification(id: number) {
    const url = `/v1/user_notification/mark_read/${id}`;
    return await api.put<any>('default', url);
}

export async function markAllReadUserNotification() {
    const url = '/v1/user_notification/mark_all_read';
    return await api.put<any>('default', url);
}
