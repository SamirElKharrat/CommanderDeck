import { theme } from 'antd';

const themeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Primary gold accent
    colorPrimary: '#d4a537',
    colorInfo: '#d4a537',

    // Deep dark backgrounds
    colorBgBase: '#0d0f1a',
    colorBgContainer: '#13152a',
    colorBgElevated: '#1a1d35',
    colorBgLayout: '#0d0f1a',

    // Borders
    colorBorder: '#2a2d4a',
    colorBorderSecondary: '#1e2040',

    // Text
    colorText: '#c8cad4',
    colorTextSecondary: '#8b8fa6',
    colorTextTertiary: '#5d6080',

    // Typography
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    borderRadius: 8,

    // Spacing
    marginLG: 24,
    paddingLG: 24,

    // Shadows
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
    boxShadowSecondary: '0 2px 12px rgba(0, 0, 0, 0.3)',
  },
  components: {
    Card: {
      colorBgContainer: '#13152a',
      colorBorderSecondary: '#2a2d4a',
      borderRadiusLG: 12,
      paddingLG: 16,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 38,
      fontWeight: 500,
    },
    Modal: {
      colorBgElevated: '#1a1d35',
      borderRadiusLG: 16,
    },
    Input: {
      colorBgContainer: '#0d0f1a',
      colorBorder: '#2a2d4a',
      borderRadius: 8,
    },
    Select: {
      colorBgContainer: '#0d0f1a',
      colorBorder: '#2a2d4a',
      borderRadius: 8,
    },
    Table: {
      colorBgContainer: '#13152a',
      headerBg: '#1a1d35',
      borderColor: '#2a2d4a',
      rowHoverBg: '#1e2040',
    },
    Segmented: {
      colorBgLayout: '#0d0f1a',
      borderRadius: 8,
      itemSelectedBg: '#d4a537',
      itemSelectedColor: '#0d0f1a',
    },
    Layout: {
      colorBgHeader: '#0b0d18',
      colorBgBody: '#0d0f1a',
      colorBgTrigger: '#1a1d35',
    },
    Popconfirm: {
      colorWarning: '#e8553d',
    },
  },
};

export default themeConfig;
