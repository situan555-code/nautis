import React from 'react';
import Paint from '../components/Paint';
import CaseStudyViewer from '../components/CaseStudyViewer';
import { caseStudies } from '../data/caseStudies';

// This acts as the global file system / registry for the OS
// All items are desktop icons — no folders
export const fileSystem = [
  // --- Column 1 ---
  {
    id: 'about_me',
    title: 'About_Me.txt',
    onDesktop: true,
    iconType: 'person',
    content: <CaseStudyViewer {...caseStudies.about_me} />,
    position: { x: 20, y: 20 }
  },
  {
    id: 'mavin_50_years',
    title: '50th_Anniversary.pdf',
    onDesktop: true,
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.mavin_50_years} />,
    position: { x: 20, y: 110 }
  },
  {
    id: 'cgi_configurator',
    title: '3D_Rendering.pdf',
    onDesktop: true,
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.cgi_configurator} />,
    position: { x: 20, y: 200 }
  },
  {
    id: 'retail_kiosk',
    title: 'Retail_Kiosk.pdf',
    onDesktop: true,
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.retail_kiosk} />,
    position: { x: 20, y: 290 }
  },
  {
    id: 'virtual_tours',
    title: 'Virtual_Tours.url',
    onDesktop: true,
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.virtual_tours} />,
    position: { x: 20, y: 380 }
  },
  {
    id: 'polymount_greenscreen',
    title: 'Polymount.pdf',
    onDesktop: true,
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.polymount_greenscreen} />,
    position: { x: 20, y: 470 }
  },
  {
    id: 'isoshock',
    title: 'isoSHOCK.pdf',
    onDesktop: true,
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.isoshock} />,
    position: { x: 20, y: 560 }
  },

  // --- Column 2 ---
  {
    id: 'prototype_app',
    title: 'Prototype.app',
    onDesktop: true,
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.prototype_app} />,
    position: { x: 110, y: 20 }
  },
  {
    id: 'product_photography',
    title: 'Product_Photos.pdf',
    onDesktop: true,
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.product_photography} />,
    position: { x: 110, y: 110 }
  },
  {
    id: 'lifestyle_photography',
    title: 'Lifestyle_Photos.pdf',
    onDesktop: true,
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.lifestyle_photography} />,
    position: { x: 110, y: 200 }
  },
  {
    id: 'portfolio_assets',
    title: 'Digital_Exp.pdf',
    onDesktop: true,
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.portfolio_assets} />,
    position: { x: 110, y: 290 }
  },
  {
    id: 'paint',
    title: 'Paint.exe',
    onDesktop: true,
    iconType: 'paint',
    content: <Paint />,
    position: { x: 110, y: 380 }
  },
  {
    id: 'linkedin',
    title: 'LinkedIn.url',
    onDesktop: true,
    iconType: 'document',
    content: (
      <div style={{ padding: '16px', fontFamily: 'monospace' }}>
        <h2>LinkedIn Profile</h2>
        <p><a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">Open LinkedIn →</a></p>
      </div>
    ),
    position: { x: 110, y: 470 }
  }
];
