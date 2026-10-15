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
        const session = await auth();

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
                                    name: 'AI Doubt Resolver',
                                    icon: 'MessageSquare',
                                    url: '/iframe/ai-doubt-resolver',
                                    title: 'AI Doubt Resolver',
                                    description: 'Resolve academic doubts using AI'
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const superAdminModule = {
            id: 13,
            name: 'Super Admin',
            icon: 'Settings',
            menu: [
                {
                    id: 1,
                    name: 'Super Admin Module',
                    icon: 'Settings',
                    sub_menu: [
                        {
                            id: 1,
                            name: 'Master Trust',
                            icon: 'Settings',
                            pages: [
                                {
                                    id: 1,
                                    name: 'Master Trust',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/masters/trust-master',
                                    title: 'Master Trust',
                                    description: 'Manage Master Trust Details'
                                }
                            ]
                        },
                        {
                            id: 2,
                            name: 'Institution',
                            icon: 'Settings',
                            pages: [
                                {
                                    id: 1,
                                    name: 'Master Institution',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/institution/master-institution',
                                    title: 'Master Institution',
                                    description: 'Manage Master Institution'
                                },
                                {
                                    id: 2,
                                    name: 'Institution Subscription',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/institution/institution-subscription',
                                    title: 'Institution Subscription',
                                    description: 'Manage Institution Subscription'
                                },
                                {
                                    id: 3,
                                    name: 'Auto Mapping',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/institution/auto-mapping',
                                    title: 'Auto Mapping',
                                    description: 'Manage Institution Auto Mapping'
                                }
                            ]
                        },
                        {
                            id: 3,
                            name: 'General Setting',
                            icon: 'Settings',
                            pages: [
                                {
                                    id: 1,
                                    name: 'General Setting Wizard',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/wizard',
                                    title: 'General Setting Wizard',
                                    description: 'General Setting Wizard'
                                },
                                {
                                    id: 2,
                                    name: 'Modules',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/module',
                                    title: 'Modules',
                                    description: 'Manage Master Modules'
                                },
                                {
                                    id: 7,
                                    name: 'Master Page',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-page',
                                    title: 'Master Page',
                                    description: 'Manage Master Page'
                                },
                                {
                                    id: 8,
                                    name: 'Page Mapping',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/page-mapping',
                                    title: 'Page Mapping',
                                    description: 'Map Pages to Modules'
                                },
                                {
                                    id: 9,
                                    name: 'Master Role',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-role',
                                    title: 'Master Role',
                                    description: 'Manage Master Role'
                                },
                                {
                                    id: 10,
                                    name: 'Master Role Type',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-role-type',
                                    title: 'Master Role Type',
                                    description: 'Manage Master Role Type'
                                },
                                {
                                    id: 11,
                                    name: 'Privileges',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/privileges',
                                    title: 'Privileges',
                                    description: 'Privileges'
                                },
                                {
                                    id: 3,
                                    name: 'Master Main Menu',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-main-menu',
                                    title: 'Master Main Menu',
                                    description: 'Manage Master Main Menu'
                                },
                                {
                                    id: 4,
                                    name: 'Master Sub Menu',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-sub-menu',
                                    title: 'Master Sub Menu',
                                    description: 'Manage Master Sub Menu'
                                },
                                {
                                    id: 5,
                                    name: 'Master Menu Page Mapping',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-menu-page-mapping',
                                    title: 'Master Menu Page Mapping',
                                    description: 'Manage Master Menu Page Mapping'
                                },
                                {
                                    id: 6,
                                    name: 'Master School Type',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/general-setting/master-school-type',
                                    title: 'Master School Type',
                                    description: 'Manage Master School Type'
                                }
                            ]
                        },
                        {
                            id: 4,
                            name: 'Configuration Setting',
                            icon: 'Settings',
                            pages: [
                                {
                                    id: 1,
                                    name: 'Institution Module Page',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/configuration-setting/institution-module-page',
                                    title: 'Institution Module Page',
                                    description: 'Master Institution Role and Module Mapping'
                                },
                                {
                                    id: 2,
                                    name: 'Master Main Menu INS',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/configuration-setting/master-main-menu-ins',
                                    title: 'Master Main Menu INS',
                                    description: 'Master Main Menu Institution Mapping'
                                },
                                {
                                    id: 3,
                                    name: 'Master Sub Menu INS',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/configuration-setting/master-sub-menu-ins',
                                    title: 'Master Sub Menu INS',
                                    description: 'Master Sub Menu Institution Mapping'
                                },
                                {
                                    id: 4,
                                    name: 'Master Menu Page Mapping Institutionwise',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/configuration-setting/master-menu-page-mapping-institutionwise',
                                    title: 'Master Menu Page Mapping Institutionwise',
                                    description: 'Master Menu Page Mapping Institutionwise'
                                }
                            ]
                        },
                        {
                            id: 5,
                            name: 'Mobile Configuration',
                            icon: 'Settings',
                            pages: [
                                {
                                    id: 1,
                                    name: 'Mobile Master Page',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/configuration-setting/mobilemasterpage',
                                    title: 'Mobile Master Page',
                                    description: 'Mobile Master Page'
                                },
                                {
                                    id: 40011,
                                    name: 'Cumulative Subject',
                                    icon: 'BarChart3',
                                    url: '/StudentPortal/student-dashboard/Exam/CumulativeSubject',
                                    title: 'Cumulative Subject',
                                    description: 'View Cumulative Subject Details'
                                }
                            ]
                        },
                        {
                            id: 6,
                            name: 'User Creation',
                            icon: 'Settings',
                            pages: [
                                {
                                    id: 1,
                                    name: 'Staff User Creation',
                                    icon: 'Settings',
                                    url: '/SuperAdmin/super-admin-module/user-creation/staff-user-creation',
                                    title: 'Staff User Creation',
                                    description: 'Staff User Creation'
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const isSuperAdmin =
            session?.role?.toUpperCase() === 'SUPER ADMIN' ||
            session?.role?.toUpperCase() === 'SUPERADMIN';

        // Super Admin gets ONLY Super Admin and AI Edge (no school modules)
        if (isSuperAdmin) {
            return {
                success: true,
                message: 'Data fetched successfully!!',
                data: [
                    superAdminModule as any,
                    aiEdgeModule as any
                ]
            } as any;
        }

        // Fetch data from backend APIs for School Admin / other user roles
        const [mainModulesRes, subModulesRes, pageListRes, pageMappingsRes] = await Promise.all([
            api.get<any>('preadmission', '/configuration/get_main_module_list'),
            api.get<any>('preadmission', '/configuration/get_submodule_list'),
            api.get<any>('preadmission', '/configuration/get_page_list'),
            api.get<any>('sadmin', 'MasterPageModuleMappingFacade/get_all_details_grid_page_mapping?page=1&page_size=1000').catch(() => null)
        ]);

        // Safe extraction helper to handle raw arrays, wrapped objects, or $values metadata
        const extractArray = (res: any): any[] => {
            if (!res) return [];
            if (Array.isArray(res)) return res;
            if (Array.isArray(res.data)) return res.data;
            if (Array.isArray(res.$values)) return res.$values;
            if (res.data && Array.isArray(res.data.$values)) return res.data.$values;
            if (Array.isArray(res.pageList)) return res.pageList;
            if (res.data && Array.isArray(res.data.pageList)) return res.data.pageList;
            if (Array.isArray(res.moduleList)) return res.moduleList;
            if (res.data && Array.isArray(res.data.moduleList)) return res.data.moduleList;
            if (Array.isArray(res.submoduleList)) return res.submoduleList;
            if (res.data && Array.isArray(res.data.submoduleList)) return res.data.submoduleList;
            if (Array.isArray(res.savedMappings)) return res.savedMappings;
            if (res.data && Array.isArray(res.data.savedMappings)) return res.data.savedMappings;
            if (Array.isArray(res.records)) return res.records;
            if (res.data && Array.isArray(res.data.records)) return res.data.records;

            if (res.data && typeof res.data === 'object') {
                for (const key of Object.keys(res.data)) {
                    if (Array.isArray(res.data[key])) return res.data[key];
                }
            }
            if (typeof res === 'object') {
                for (const key of Object.keys(res)) {
                    if (Array.isArray(res[key])) return res[key];
                }
            }
            return [];
        };

        const pages = extractArray(pageListRes);
        const mainModules = extractArray(mainModulesRes);
        const subModules = extractArray(subModulesRes);
        const pageMappings = pageMappingsRes ? extractArray(pageMappingsRes) : [];

        // Dynamic Title Case helper
        const toTitleCase = (str: string): string => {
            if (!str) return '';
            return str
                .replace(/[_-]+/g, ' ')
                .replace(/\bbaldwin\b\s*/gi, '')
                .trim()
                .split(/\s+/)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ');
        };

        // Dynamic URL normalizer
        const normalizeUrl = (rawUrl: string, pageName: string): string => {
            if (rawUrl && typeof rawUrl === 'string') {
                let u = rawUrl.trim();
                if (u.startsWith('app.')) u = u.replace(/^app\./, '/');
                if (!u.startsWith('/') && u !== '#' && u !== '' && u !== 'null') u = '/' + u;
                if (u !== '#' && u !== '' && u !== 'null') return u;
            }
            const slug = (pageName || '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            return slug ? `/${slug}` : '#';
        };

        const isSuperAdminPage = (nameLower: string, urlLower: string): boolean => {
            return (
                nameLower.includes('configuration setting wizard') ||
                nameLower.includes('master module') ||
                nameLower.includes('master role') ||
                nameLower.includes('master roletype') ||
                nameLower.includes('master role & priviledges') ||
                nameLower.includes('institution module mapping') ||
                nameLower.includes('module page mapping') ||
                nameLower.includes('master school type') ||
                nameLower.includes('master main menu') ||
                nameLower.includes('master sub menu') ||
                nameLower.includes('master menu page mapping') ||
                nameLower.includes('general setting wizard') ||
                nameLower.includes('institution subscription') ||
                nameLower.includes('auto mapping') ||
                nameLower.includes('trust master') ||
                urlLower.includes('consetting') ||
                urlLower.includes('pagemapping') ||
                urlLower.includes('modulepage') ||
                urlLower.includes('masterschooltype') ||
                urlLower.includes('superadmin') ||
                urlLower.includes('super-admin')
            );
        };

        // 1. Build lookup tables
        const mappingByPageId = new Map<number, string>();
        const mappingByPageName = new Map<string, string>();
        pageMappings.forEach((m: any) => {
            const modName = (m.ivrmM_ModuleName || '').trim();
            const pId = Number(m.ivrmP_Id || 0);
            const pName = (m.ivrmmP_PageName || '').trim().toLowerCase();
            if (modName) {
                if (pId > 0) mappingByPageId.set(pId, modName);
                if (pName) mappingByPageName.set(pName, modName);
            }
        });

        const subByMenuId = new Map<number, any>();
        subModules.forEach((s: any) => {
            const id = Number(s.menuId ?? s.ivrmmM_Id ?? s.subModuleId ?? 0);
            if (id > 0) subByMenuId.set(id, s);
        });

        const modById = new Map<number, any>();
        mainModules.forEach((m: any) => {
            const mId = Number(m.moduleId ?? m.ivrmM_Id ?? 0);
            const menuId = Number(m.menuId ?? 0);
            if (mId > 0) modById.set(mId, m);
            if (menuId > 0) modById.set(menuId, m);
        });

        // 2. Initialize Module Map
        const moduleMap = new Map<string, any>();

        const getOrCreateModule = (name: string, icon?: string): any => {
            const cleanName = toTitleCase(name) || 'General';
            const key = cleanName.toLowerCase();
            if (!moduleMap.has(key)) {
                const modId = Math.abs(cleanName.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) % 100000 + 1;
                moduleMap.set(key, {
                    id: modId,
                    name: cleanName,
                    icon: mapIcon(icon || 'Boxes'),
                    menu: [
                        {
                            id: 1,
                            name: cleanName,
                            icon: mapIcon(icon || 'Boxes'),
                            sub_menu: []
                        }
                    ]
                });
            }
            return moduleMap.get(key);
        };

        const getOrCreateSubMenu = (modObj: any, subMenuName: string, icon?: string): any => {
            const cleanSubName = toTitleCase(subMenuName) || 'General';
            let subMenu = modObj.menu[0].sub_menu.find(
                (s: any) => s.name.toLowerCase() === cleanSubName.toLowerCase()
            );
            if (!subMenu) {
                const subId = Math.abs((modObj.name + cleanSubName).split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) % 100000 + 1;
                subMenu = {
                    id: subId,
                    name: cleanSubName,
                    icon: mapIcon(icon || 'Settings'),
                    pages: []
                };
                modObj.menu[0].sub_menu.push(subMenu);
            }
            return subMenu;
        };

        // Pre-populate modules from mainModules and their subModules
        mainModules.forEach((m: any) => {
            const mName = toTitleCase(m.ivrmM_ModuleName || m.name);
            if (mName && mName.toLowerCase() !== 'super admin') {
                const modObj = getOrCreateModule(mName, m.ivrmmmI_Icon || m.icon);
                const mId = Number(m.moduleId ?? m.ivrmM_Id ?? 0);
                const menuId = Number(m.menuId ?? 0);

                subModules.forEach((s: any) => {
                    const sParent = Number(s.parentId ?? 0);
                    const sMod = Number(s.moduleId ?? 0);
                    if ((menuId > 0 && sParent === menuId) || (mId > 0 && sMod === mId)) {
                        const sName = toTitleCase(s.ivrmM_ModuleName || s.name);
                        if (sName) {
                            getOrCreateSubMenu(modObj, sName, s.ivrmmmI_Icon || s.icon);
                        }
                    }
                });
            }
        });

        // Also pre-populate any modules from Super Admin pageMappings
        pageMappings.forEach((m: any) => {
            const modName = (m.ivrmM_ModuleName || '').trim();
            if (modName && modName.toLowerCase() !== 'super admin' && modName.toLowerCase() !== 'pre-configuration') {
                getOrCreateModule(modName);
            }
        });

        // 3. Map all pages from get_page_list dynamically
        pages.forEach((p: any) => {
            const pageId = Number(p.pageId ?? p.ivrmP_Id ?? p.id ?? Math.floor(Math.random() * 1000000) + 1);
            const rawName = p.ivrmmP_PageName || p.ivrmP_PageDisplayName || p.name || '';
            const pageName = toTitleCase(rawName) || 'Untitled Page';
            const rawUrl = p.ivrmP_PageURL || p.url || '';
            const resolvedUrl = normalizeUrl(rawUrl, pageName);
            const nameLower = pageName.toLowerCase();
            const urlLower = (rawUrl || '').toLowerCase();

            // Skip super admin hardcoded pages in regular school portal
            if (isSuperAdminPage(nameLower, urlLower)) {
                return;
            }

            let targetModuleName = '';
            let targetSubMenuName = '';

            // Priority 1: SuperAdmin Page Mapping (explicit configuration saved by Super Admin)
            if (!targetModuleName && mappingByPageId.has(pageId)) {
                targetModuleName = mappingByPageId.get(pageId)!;
            }
            if (!targetModuleName && mappingByPageName.has(rawName.trim().toLowerCase())) {
                targetModuleName = mappingByPageName.get(rawName.trim().toLowerCase())!;
            }

            // Priority 2: Direct menuId or moduleId from API
            const menuId = Number(p.menuId ?? p.ivrmmM_Id ?? 0);
            if (!targetModuleName && menuId > 0 && subByMenuId.has(menuId)) {
                const sub = subByMenuId.get(menuId);
                targetSubMenuName = sub.ivrmM_ModuleName || sub.name;
                const parentModId = Number(sub.moduleId ?? sub.parentId ?? 0);
                if (modById.has(parentModId)) {
                    targetModuleName = modById.get(parentModId).ivrmM_ModuleName;
                }
            }

            const moduleId = Number(p.moduleId ?? p.ivrmM_Id ?? 0);
            if (!targetModuleName && moduleId > 0 && modById.has(moduleId)) {
                targetModuleName = modById.get(moduleId).ivrmM_ModuleName;
            }

            // Priority 3: URL Path Segments
            const cleanUrl = resolvedUrl.replace(/^\/+/, '');
            const segments = cleanUrl.split('/').filter(Boolean);

            if (segments.length >= 1) {
                const seg0 = segments[0].toLowerCase();
                const seg1 = segments.length > 1 ? segments[1].toLowerCase() : '';
                const seg2 = segments.length > 2 ? segments[2].toLowerCase() : '';

                if (!targetModuleName) {
                    if (seg0 === 'admission' && seg1 === 'preadmission') {
                        targetModuleName = 'Pre Admission';
                        if (seg2 && !seg2.includes('.')) targetSubMenuName = toTitleCase(seg2);
                    } else if (seg0 === 'admission') {
                        targetModuleName = 'Admission';
                        if (seg1 && !seg1.includes('.')) targetSubMenuName = toTitleCase(seg1);
                    } else if (seg0 === 'fees' || seg0 === 'fee') {
                        targetModuleName = 'Fee';
                        if (seg1 && !seg1.includes('.')) targetSubMenuName = toTitleCase(seg1);
                    } else if (seg0 === 'exam') {
                        targetModuleName = 'Exam';
                        if (seg1 && !seg1.includes('.')) targetSubMenuName = toTitleCase(seg1);
                    } else if (seg0 === 'library') {
                        targetModuleName = 'Library';
                        if (seg1 && !seg1.includes('.')) targetSubMenuName = toTitleCase(seg1);
                    } else if (seg0 === 'hrms') {
                        targetModuleName = 'HRMS';
                        if (seg1 && !seg1.includes('.')) targetSubMenuName = toTitleCase(seg1);
                    } else if (seg0 === 'timetable') {
                        targetModuleName = 'Time Table';
                        if (seg1 && !seg1.includes('.')) targetSubMenuName = toTitleCase(seg1);
                    } else if (seg0 === 'transport') {
                        targetModuleName = 'Transport';
                        if (seg1 && !seg1.includes('.')) targetSubMenuName = toTitleCase(seg1);
                    }
                } else if (!targetSubMenuName) {
                    if (seg0 === 'admission' && seg1 === 'preadmission' && seg2 && !seg2.includes('.')) {
                        targetSubMenuName = toTitleCase(seg2);
                    } else if (segments.length > 1 && !seg1.includes('.')) {
                        targetSubMenuName = toTitleCase(seg1);
                    }
                }
            }

            // Priority 4: Keyword matching to existing official modules
            if (!targetModuleName) {
                if (nameLower.includes('fee') || nameLower.includes('challan') || nameLower.includes('receipt') || urlLower.includes('fee')) {
                    targetModuleName = 'Fee';
                } else if (nameLower.includes('exam') || nameLower.includes('marks') || nameLower.includes('grade') || urlLower.includes('exam')) {
                    targetModuleName = 'Exam';
                } else if (nameLower.includes('book') || nameLower.includes('library') || nameLower.includes('author') || urlLower.includes('library')) {
                    targetModuleName = 'Library';
                } else if (nameLower.includes('timetable') || nameLower.includes('time table') || urlLower.includes('timetable')) {
                    targetModuleName = 'Time Table';
                } else if (nameLower.includes('staff') || nameLower.includes('salary') || nameLower.includes('employee') || nameLower.includes('payroll') || urlLower.includes('hrms')) {
                    targetModuleName = 'HRMS';
                } else if (nameLower.includes('bus') || nameLower.includes('route') || nameLower.includes('driver') || urlLower.includes('transport') || urlLower.includes('bus')) {
                    targetModuleName = 'Transport';
                } else if (nameLower.includes('oral') || nameLower.includes('written') || nameLower.includes('prospectus') || nameLower.includes('seatblock') || nameLower.includes('preadmission')) {
                    targetModuleName = 'Pre Admission';
                } else if (nameLower.includes('student') || nameLower.includes('attendance') || nameLower.includes('admission') || nameLower.includes('transfer')) {
                    targetModuleName = 'Admission';
                } else {
                    targetModuleName = 'Pre Admission';
                }
            }

            // Submenu assignment
            if (!targetSubMenuName) {
                if (nameLower.includes('report') || nameLower.includes('card') || nameLower.includes('details') || nameLower.includes('summary') || nameLower.includes('register') || nameLower.includes('list')) {
                    targetSubMenuName = 'Reports';
                } else if (nameLower.includes('master') || nameLower.includes('entry') || nameLower.includes('category') || nameLower.includes('class') || nameLower.includes('section')) {
                    targetSubMenuName = 'Masters';
                } else if (nameLower.includes('transaction') || nameLower.includes('schedule') || nameLower.includes('apply') || nameLower.includes('process')) {
                    targetSubMenuName = 'Transactions';
                } else {
                    targetSubMenuName = 'General';
                }
            }

            const modObj = getOrCreateModule(targetModuleName);
            const subMenuObj = getOrCreateSubMenu(modObj, targetSubMenuName);

            subMenuObj.pages.push({
                id: pageId,
                name: pageName,
                title: pageName,
                url: resolvedUrl,
                icon: mapIcon(p.ivrmmmI_Icon || p.icon || 'FileText'),
                description: pageName,
                order: Number(p.order ?? p.ivrmimP_PageOrder ?? 0)
            });
        });

        // Filter and sort modules and submenus
        const topModules = Array.from(moduleMap.values())
            .map((mod) => {
                const validSubMenus = mod.menu[0].sub_menu.filter((s: any) => s.pages.length > 0);
                validSubMenus.forEach((s: any) =>
                    s.pages.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                );
                mod.menu[0].sub_menu = validSubMenus;
                return mod;
            })
            .filter((mod) => mod.menu[0].sub_menu.length > 0);

        topModules.push(aiEdgeModule as any);

        return {
            success: true,
            message: 'Data fetched successfully!!',
            data: topModules,
            mainModules,
            subModules,
            pages
        } as any;
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
