import {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';

const config: Config = {
  title: 'React Bible & Enterprise Frontend Ecosystem',
  tagline: 'Master all React APIs, Server Functions, RSC & Architecture for 50-60 LPA Opportunities',
  favicon: 'img/favicon.ico',

  url: 'https://reactbible.local',
  baseUrl: '/',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // Serve docs at root /
          editUrl: undefined,
        },
        blog: false, // Disable blog for clean documentation focus
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: ['@docusaurus/theme-live-codeblock'],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'React Bible',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'React Masterclass',
        },
        {
          to: '/syllabus-overview',
          label: '50-60 LPA Syllabi Map',
          position: 'left',
        },
        {
          href: 'https://github.com/facebook/react',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'React 19 & Core Hooks',
              to: '/',
            },
            {
              label: 'Server Components & Actions',
              to: '/category/06-server-components-and-actions',
            },
          ],
        },
        {
          title: 'Career Syllabi',
          items: [
            {
              label: '50-60 LPA Ecosystem Map',
              to: '/syllabus-overview',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} React Bible Platform. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'tsx'],
    },
    liveCodeBlock: {
      playgroundPosition: 'bottom',
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
