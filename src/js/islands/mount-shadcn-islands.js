/**
 * Mount shadcn/ui islands the same way the 3D hero mounts:
 * a DOM node, a dynamic import, and createRoot.
 *
 * Add the next island by:
 * 1. npx shadcn@latest add <component>
 * 2. a component in src/components/islands/
 * 3. a loader entry below
 * 4. <div data-island="name" data-props='{"label":"..."}'></div>
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../css/shadcn.css';

const islandLoaders = {
  'reference-button': () => import('../../components/islands/reference-button.jsx'),
};

function readProps(mount) {
  const raw = mount.getAttribute('data-props');
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
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

    mount.dataset.islandState = 'loading';

    load()
      .then((module) => {
        const Component = module.default;
        if (!Component) {
          mount.dataset.islandState = 'missing';
          return;
        }

        createRoot(mount).render(React.createElement(Component, readProps(mount)));
        mount.dataset.islandState = 'mounted';
      })
      .catch(() => {
        mount.dataset.islandState = 'error';
      });
  });
}
