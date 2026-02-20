/**
 * Color Helper Utilities
 * AI-powered color detection system - maps color names to hex codes
 */

// Comprehensive color database with variations and synonyms
const colorDatabase: Record<string, string> = {
    // Blacks and Grays
    black: '#000000', 'jet black': '#000000', 'pitch black': '#000000', 'coal black': '#0a0a0a',
    charcoal: '#36454F', 'dark charcoal': '#333333', graphite: '#383838',
    white: '#FFFFFF', 'pure white': '#FFFFFF', 'snow white': '#FFFAFA', 'off white': '#FAF9F6',
    ivory: '#FFFFF0', cream: '#FFFDD0', pearl: '#F0EAD6', eggshell: '#F0EAD6',
    gray: '#808080', grey: '#808080', 'stone gray': '#8B8680', 'ash gray': '#B2BEB5',
    'light gray': '#D3D3D3', 'light grey': '#D3D3D3', platinum: '#E5E4E2',
    silver: '#C0C0C0', 'metallic silver': '#AAA9AD',
    'dark gray': '#A9A9A9', 'dark grey': '#A9A9A9', 'slate gray': '#708090', gunmetal: '#2C3539',

    // Reds
    red: '#FF0000', 'bright red': '#FF0000', 'pure red': '#FF0000',
    'dark red': '#8B0000', 'blood red': '#8B0000', 'wine red': '#722F37',
    maroon: '#800000', burgundy: '#800020', oxblood: '#4A0000',
    crimson: '#DC143C', scarlet: '#FF2400', ruby: '#E0115F',
    cherry: '#DE3163', 'cherry red': '#D2042D', 'fire engine red': '#CE2029',
    'brick red': '#CB4154', rust: '#B7410E', terracotta: '#E2725B',
    cardinal: '#C41E3A', vermillion: '#E34234',

    // Pinks
    pink: '#FFC0CB', 'light pink': '#FFB6C1', 'baby pink': '#F4C2C2',
    'hot pink': '#FF69B4', 'neon pink': '#FF10F0', magenta: '#FF00FF',
    fuchsia: '#FF00FF', rose: '#FF007F', blush: '#DE5D83',
    salmon: '#FA8072', coral: '#FF7F50', peach: '#FFE5B4',
    flamingo: '#FC8EAC', bubblegum: '#FFC1CC',

    // Oranges
    orange: '#FFA500', 'bright orange': '#FF8C00', 'dark orange': '#FF8C00',
    'burnt orange': '#CC5500', 'rust orange': '#C9510C', pumpkin: '#FF7518',
    tangerine: '#F28500', amber: '#FFBF00', apricot: '#FBCEB1',
    copper: '#B87333', bronze: '#CD7F32',

    // Yellows
    yellow: '#FFFF00', 'bright yellow': '#FFFF00', lemon: '#FFF44F',
    'canary yellow': '#FFEF00', 'golden yellow': '#FFDF00', banana: '#FFE135',
    gold: '#FFD700', golden: '#FFD700', mustard: '#FFDB58',
    honey: '#FFC30B', butter: '#FFFD74', 'cream yellow': '#FFFACD',
    sand: '#C2B280', khaki: '#F0E68C', beige: '#F5F5DC',
    tan: '#D2B48C', caramel: '#FFD59A', wheat: '#F5DEB3',

    // Greens
    green: '#008000', 'dark green': '#006400', 'forest green': '#228B22',
    lime: '#00FF00', 'lime green': '#32CD32', 'bright green': '#00FF00',
    'light green': '#90EE90', mint: '#98FF98', 'mint green': '#98FF98',
    sage: '#9DC183', 'sage green': '#9DC183', olive: '#808000',
    'olive green': '#556B2F', 'army green': '#4B5320', 'hunter green': '#355E3B',
    emerald: '#50C878', jade: '#00A86B', 'kelly green': '#4CBB17',
    seafoam: '#93E9BE', teal: '#008080', turquoise: '#40E0D0',
    aquamarine: '#7FFFD4', 'sea green': '#2E8B57', pine: '#01796F',

    // Blues
    blue: '#0000FF', 'bright blue': '#0000FF', 'royal blue': '#4169E1',
    navy: '#000080', 'navy blue': '#000080', 'dark blue': '#00008B',
    'midnight blue': '#191970', 'prussian blue': '#003153',
    'light blue': '#ADD8E6', 'baby blue': '#89CFF0', 'powder blue': '#B0E0E6',
    'sky blue': '#87CEEB', azure: '#007FFF', cerulean: '#007BA7',
    cobalt: '#0047AB', sapphire: '#0F52BA', denim: '#1560BD',
    'steel blue': '#4682B4', periwinkle: '#CCCCFF', cornflower: '#6495ED',
    'electric blue': '#7DF9FF', cyan: '#00FFFF', aqua: '#00FFFF',

    // Purples
    purple: '#800080', 'dark purple': '#301934', 'royal purple': '#7851A9',
    violet: '#EE82EE', lavender: '#E6E6FA', lilac: '#C8A2C8',
    plum: '#8E4585', mauve: '#E0B0FF', orchid: '#DA70D6',
    indigo: '#4B0082', amethyst: '#9966CC', eggplant: '#614051',
    grape: '#6F2DA8', heather: '#B7A4C6',

    // Browns
    brown: '#A52A2A', 'dark brown': '#654321', chocolate: '#D2691E',
    coffee: '#6F4E37', espresso: '#4E312D', chestnut: '#954535',
    mahogany: '#C04000', walnut: '#773F1A', oak: '#806517',
    sienna: '#A0522D', umber: '#635147', sepia: '#704214',
    mocha: '#967969', taupe: '#483C32', 'burnt sienna': '#E97451',

    // Metallics
    'rose gold': '#B76E79', champagne: '#F7E7CE',
    pewter: '#96A8A1', titanium: '#878681',
};

/**
 * Get color hex code from color name
 */
export const getColorHex = (colorName: string | null | undefined): string | null => {
    if (!colorName) return null;

    const input = colorName.toLowerCase().trim();

    // Check if it's already a hex code
    if (input.startsWith('#')) return input;

    // Check if it's RGB/RGBA format
    if (input.startsWith('rgb')) return input;

    // Try exact match first
    if (colorDatabase[input]) return colorDatabase[input];

    // Try fuzzy matching
    for (const [colorKey, hexValue] of Object.entries(colorDatabase)) {
        if (input.includes(colorKey) || colorKey.includes(input)) {
            return hexValue;
        }
    }

    // Try without spaces, hyphens, or underscores
    const normalized = input.replace(/[\s\-_]/g, '');
    for (const [colorKey, hexValue] of Object.entries(colorDatabase)) {
        const normalizedKey = colorKey.replace(/[\s\-_]/g, '');
        if (normalized === normalizedKey) return hexValue;
    }

    return null;
};

/**
 * Determine if a color is light or dark
 */
export const isLightColor = (colorName: string | null | undefined): boolean => {
    if (!colorName) return false;
    const hex = getColorHex(colorName);
    if (!hex) return false;

    let r: number, g: number, b: number;
    if (hex.startsWith('#')) {
        const hexValue = hex.replace('#', '');
        r = parseInt(hexValue.substr(0, 2), 16);
        g = parseInt(hexValue.substr(2, 2), 16);
        b = parseInt(hexValue.substr(4, 2), 16);
    } else if (hex.startsWith('rgb')) {
        const rgbValues = hex.match(/\d+/g);
        if (!rgbValues || rgbValues.length < 3) return false;
        r = parseInt(rgbValues[0]!, 10);
        g = parseInt(rgbValues[1]!, 10);
        b = parseInt(rgbValues[2]!, 10);
    } else {
        return false;
    }

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
};
