const META = {
  Food:          { icon: '🍜', bg: '#fef3c7', darkBg: '#2b1d0a' },
  Transport:     { icon: '🚌', bg: '#e0f2fe', darkBg: '#082f49' },
  Entertainment: { icon: '🎬', bg: '#f3e8ff', darkBg: '#2e1065' },
  Shopping:      { icon: '🛍', bg: '#fce7f3', darkBg: '#4a0020' },
  Bills:         { icon: '📄', bg: '#f1f5f9', darkBg: '#1e293b' },
  Healthcare:    { icon: '❤️', bg: '#fee2e2', darkBg: '#4c0519' },
  Education:     { icon: '📚', bg: '#d1fae5', darkBg: '#064e3b' },
  Other:         { icon: '📦', bg: '#f1f5f9', darkBg: '#1e293b' },
};

export const CATEGORIES = Object.keys(META);

export const categoryMeta = (cat) => META[cat] || META.Other;
