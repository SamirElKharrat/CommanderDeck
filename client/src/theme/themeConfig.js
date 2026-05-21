import { theme } from 'antd';

const themeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Primary amber/gold accent
    colorPrimary: '#c4952a',
    colorInfo: '#c4952a',

    // Deep parchment/tavern backgrounds
    colorBgBase: '#12100d',
    colorBgContainer: '#1a1710',
    colorBgElevated: '#1f1b13',
    colorBgLayout: '#12100d',

    // Borders (subtle gold)
    colorBorder: 'rgba(196, 149, 42, 0.25)',
    colorBorderSecondary: 'rgba(196, 149, 42, 0.15)',

    // Text (Parchment colors)
    colorText: '#e8dcc4',
    colorTextSecondary: '#b8a88a',
    colorTextTertiary: '#5a4f3a',

    // Typography
    fontFamily: "'Crimson Pro', serif",
    fontSize: 15,
    borderRadius: 6,

    // Spacing
    marginLG: 24,
    paddingLG: 24,

    // Shadows
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
    boxShadowSecondary: '0 2px 12px rgba(0, 0, 0, 0.4)',
  },
  components: {
    Card: {
      colorBgContainer: 'rgba(26, 23, 16, 0.8)',
      colorBorderSecondary: 'rgba(196, 149, 42, 0.1)',
      borderRadiusLG: 8,
      paddingLG: 16,
    },
    Button: {
      borderRadius: 6,
      controlHeight: 38,
      fontWeight: 600,
    },
    Modal: {
      colorBgElevated: '#1a1710',
      borderRadiusLG: 12,
    },
    Input: {
      colorBgContainer: '#12100d',
      colorBorder: 'rgba(196, 149, 42, 0.2)',
      borderRadius: 6,
    },
    Select: {
      colorBgContainer: '#12100d',
      colorBorder: 'rgba(196, 149, 42, 0.2)',
      borderRadius: 6,
    },
    Table: {
      colorBgContainer: '#1a1710',
      headerBg: '#12100d',
      borderColor: 'rgba(196, 149, 42, 0.15)',
      rowHoverBg: 'rgba(196, 149, 42, 0.05)',
    },
    Segmented: {
      colorBgLayout: '#12100d',
      borderRadius: 6,
      itemSelectedBg: '#c4952a',
      itemSelectedColor: '#12100d',
    },
    Layout: {
      colorBgHeader: 'rgba(18, 16, 13, 0.95)',
      colorBgBody: '#12100d',
      colorBgTrigger: '#1a1710',
    },
    Popconfirm: {
      colorWarning: '#e8553d',
    },
  },
};

export default themeConfig;

