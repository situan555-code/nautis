import React from 'react';
import Paint from '../components/Paint';
import FolderView from '../components/FolderView';
import CaseStudyViewer from '../components/CaseStudyViewer';
import { caseStudies } from '../data/caseStudies';

// Placeholders for content
const PlaceholderContent = ({ title }) => (
  <div style={{ padding: '16px' }}>
    <h2>{title}</h2>
    <p>Upload video/image assets and replace this component.</p>
  </div>
);

// This acts as the global file system / registry for the OS
export const fileSystem = [
  // --- TOP LEVEL DESKTOP ICONS ---
  {
    id: 'about_me',
    title: 'About_Me.txt',
    onDesktop: true,
    iconType: 'person',
    content: <CaseStudyViewer {...caseStudies.about_me} />,
    position: { x: 40, y: 640 }
  },
  {
    id: 'paint',
    title: 'Paint.exe',
    onDesktop: true,
    iconType: 'paint',
    content: <Paint />,
    position: { x: 40, y: 540 }
  },
  {
    id: 'agentic_engineering',
    title: 'Agentic_Engineering.exe',
    onDesktop: true,
    iconType: 'document',
    content: <FolderView folderId="agentic_engineering" />,
    position: { x: 40, y: 40 }
  },
  {
    id: 'mavin_systems',
    title: 'Mavin_Systems',
    onDesktop: true,
    iconType: 'folder',
    content: <FolderView folderId="mavin_systems" />,
    position: { x: 40, y: 140 }
  },
  {
    id: 'creative_hardware',
    title: 'Creative_Hardware.dir',
    onDesktop: true,
    iconType: 'folder',
    content: <FolderView folderId="creative_hardware" />,
    position: { x: 40, y: 240 }
  },

  {
    id: 'awards',
    title: 'Awards_and_Links',
    onDesktop: true,
    iconType: 'folder',
    content: <FolderView folderId="awards" />,
    position: { x: 40, y: 440 }
  },

  // --- INNER FILES / EXECUTABLES ---
  
  // Agentic Engineering
  {
    id: 'ios_app',
    title: 'Native_iOS_App.exe',
    folderId: 'agentic_engineering',
    iconType: 'document',
    content: <PlaceholderContent title="Native iOS App (Agentic Dev)" />,
    position: { x: 100, y: 100 }
  },
  {
    id: 'pim_data',
    title: 'PIM_Data_Cleansing.bat',
    folderId: 'agentic_engineering',
    iconType: 'document',
    content: <PlaceholderContent title="PIM Data Pipeline & AI Cleansing" />,
    position: { x: 120, y: 120 }
  },

  // Mavin Systems
  {
    id: 'mavin_50_years',
    title: '50th_Anniversary_Campaign.pdf',
    folderId: 'mavin_systems',
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.mavin_50_years} />,
    position: { x: 90, y: 90 }
  },
  {
    id: 'virtual_tours',
    title: 'Virtual_Showroom_Tours.url',
    folderId: 'mavin_systems',
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.virtual_tours} />,
    position: { x: 100, y: 100 }
  },
  {
    id: 'cgi_configurator',
    title: '3D_Rendering_Configurator.pdf',
    folderId: 'mavin_systems',
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.cgi_configurator} />,
    position: { x: 110, y: 110 }
  },
  {
    id: 'retail_kiosk',
    title: 'Retail_Kiosk_System.pdf',
    folderId: 'mavin_systems',
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.retail_kiosk} />,
    position: { x: 120, y: 120 }
  },

  // Creative Hardware
  {
    id: 'polymount_greenscreen',
    title: 'Polymount_Green_Screen.pdf',
    folderId: 'creative_hardware',
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.polymount_greenscreen} />,
    position: { x: 100, y: 100 }
  },
  {
    id: 'isoshock',
    title: 'isoSHOCK_Announcement.pdf',
    folderId: 'creative_hardware',
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.isoshock} />,
    position: { x: 110, y: 110 }
  },
  {
    id: 'product_photography',
    title: 'Product_Photography.pdf',
    folderId: 'creative_hardware',
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.product_photography} />,
    position: { x: 120, y: 120 }
  },
  {
    id: 'portfolio_assets',
    title: 'Digital_Experiences.pdf',
    folderId: 'creative_hardware',
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.portfolio_assets} />,
    position: { x: 130, y: 130 }
  },
  {
    id: 'lifestyle_photography',
    title: 'Lifestyle_Photography.pdf',
    folderId: 'creative_hardware',
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.lifestyle_photography} />,
    position: { x: 130, y: 130 }
  },



  // Awards and Links
  {
    id: 'casegoods_award',
    title: 'Best_Casegoods_24_25.url',
    folderId: 'awards',
    iconType: 'document',
    content: <PlaceholderContent title="Best Domestic Casegoods (2024 & 2025)" />,
    position: { x: 100, y: 100 }
  },
  {
    id: 'linkedin',
    title: 'LinkedIn_Profile.url',
    folderId: 'awards',
    iconType: 'document',
    content: <PlaceholderContent title="LinkedIn Profile Shortcut" />,
    position: { x: 120, y: 120 }
  }
];
