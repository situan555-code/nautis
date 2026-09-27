/**
 * Mount shadcn/ui islands the same way the 3D hero mounts:
 * a DOM node, a dynamic import, and createRoot.
 *
 * Add the next island by:
 * 1. a component in src/components/ui or src/components/islands
 * 2. a loader entry below
 * 3. a mount node with data-island="name"
 *
 * Tailwind is prefixed `sh:` and preflight is off so islands cannot restyle the design system.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../css/shadcn.css';

const islandLoaders = {
  'nav-wordmark': () => import('../../components/islands/nav-wordmark.jsx'),
  'configurator-cards': () => import('../../components/islands/configurator-cards.jsx'),
};

function readProps(mount) {
  const raw = mount.getAttribute('data-props');
  let parsed = {};

  if (raw) {
    try {
      const value = JSON.parse(raw);
      parsed = value && typeof value === 'object' ? value : {};
    } catch {
      parsed = {};
    }
  }

  const fallbackText = mount.textContent.trim();
  if (fallbackText && parsed.text == null) {
    parsed.text = fallbackText;
  }

  return parsed;
}

export function initShadcnIslands(root = document) {
  root.querySelectorAll('[data-island]').forEach((mount) => {
    if (mount.dataset.islandState === 'mounted' || mount.dataset.islandState === 'loading') {
      return;
    }

    const name = mount.getAttribute('data-island');
    const load = islandLoaders[name];
    if (!load) {
      mount.dataset.islandState = 'missing';
      return;
    }

    const props = readProps(mount);
    mount.dataset.islandState = 'loading';

    load()
      .then((module) => {
        const Component = module.default;
        if (!Component) {
          mount.dataset.islandState = 'missing';
          return;
        }

        createRoot(mount).render(React.createElement(Component, props));
        mount.dataset.islandState = 'mounted';
      })
      .catch(() => {
        mount.dataset.islandState = 'error';
      });
  });
}
