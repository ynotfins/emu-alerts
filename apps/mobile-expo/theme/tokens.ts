export const colors = {
  text: '#111111',
  secondaryText: '#666666',
  accent: '#007AFF', // iOS system blue
  surface: '#FAFAFA', // off-white
  background: '#FFFFFF',
  divider: '#EEEEEE',
};

export const radius = {
  xl: 16,
};

export const spacing = (multiplier: number) => 8 * multiplier;

export const typeScale = {
  title: 28,
  section: 20,
  body: 16,
  caption: 14,
};

export const lineHeights = {
  title: Math.round(typeScale.title * 1.3),
  section: Math.round(typeScale.section * 1.35),
  body: Math.round(typeScale.body * 1.4),
  caption: Math.round(typeScale.caption * 1.4),
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;


