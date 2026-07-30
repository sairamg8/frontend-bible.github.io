import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', '6f1'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '5d8'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', 'ad3'),
            routes: [
              {
                path: '/react/context-and-external-stores/use-context-and-use-sync-external-store',
                component: ComponentCreator('/react/context-and-external-stores/use-context-and-use-sync-external-store', '0bd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/react/core-hooks/use-effect',
                component: ComponentCreator('/react/core-hooks/use-effect', 'c72'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/react/core-hooks/use-layout-effect-and-insertion-effect',
                component: ComponentCreator('/react/core-hooks/use-layout-effect-and-insertion-effect', 'b5d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/react/core-hooks/use-reducer',
                component: ComponentCreator('/react/core-hooks/use-reducer', 'db4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/react/core-hooks/use-state',
                component: ComponentCreator('/react/core-hooks/use-state', 'cc8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/react/dom-and-refs/use-ref-and-use-imperative-handle',
                component: ComponentCreator('/react/dom-and-refs/use-ref-and-use-imperative-handle', '05c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/react/performance-hooks/use-memo-and-use-callback',
                component: ComponentCreator('/react/performance-hooks/use-memo-and-use-callback', '0c3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/react/performance-hooks/use-transition-and-use-deferred-value',
                component: ComponentCreator('/react/performance-hooks/use-transition-and-use-deferred-value', '07b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/react/react-dom-apis/client-server-and-resource-apis',
                component: ComponentCreator('/react/react-dom-apis/client-server-and-resource-apis', '428'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/react/react19-action-hooks/use-action-state-and-use-optimistic',
                component: ComponentCreator('/react/react19-action-hooks/use-action-state-and-use-optimistic', 'db2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/react/react19-action-hooks/use-form-status-and-use',
                component: ComponentCreator('/react/react19-action-hooks/use-form-status-and-use', 'f0a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/react/server-components-and-actions/rsc-architecture-and-directives',
                component: ComponentCreator('/react/server-components-and-actions/rsc-architecture-and-directives', 'e6d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/',
                component: ComponentCreator('/', 'efb'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
