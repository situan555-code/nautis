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
    id: 'revops_strategy',
    title: 'RevOps_Strategy',
    onDesktop: true,
    iconType: 'folder',
    content: <FolderView folderId="revops_strategy" />,
    position: { x: 40, y: 340 }
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
    id: 'mavin_trailer',
    title: 'Mavin_Trailer_Design.jpg',
    folderId: 'mavin_systems',
    iconType: 'document',
    content: (
      <div style={{ padding: '8px', backgroundColor: '#fff', height: '100%' }}>
        <img src="/case-studies/mavin_trailer.jpeg" alt="Mavin Trailer Design" style={{ width: '100%', height: 'auto', border: '1px solid #ccc' }} />
        <p style={{ textAlign: 'center', fontFamily: 'monospace', marginTop: '8px' }}>Designed completely by me.</p>
      </div>
    ),
    position: { x: 90, y: 90 }
  },
  {
    id: 'mavin_3d',
    title: '3D_WebGL_Configurator.html',
    folderId: 'mavin_systems',
    iconType: 'document',
    content: <PlaceholderContent title="Mavin 3D Configurator & Lead Gen" />,
    position: { x: 100, y: 100 }
  },
  {
    id: 'mavin_lidar',
    title: 'Timber_LiDAR_Pointcloud.exe',
    folderId: 'mavin_systems',
    iconType: 'document',
    content: <PlaceholderContent title="Mavin Timber LiDAR Potree Demo" />,
    position: { x: 120, y: 120 }
  },
  {
    id: 'mavin_50_years',
    title: '50th_Anniversary_Campaign.pdf',
    folderId: 'mavin_systems',
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.mavin_50_years} />,
    position: { x: 130, y: 130 }
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
    id: 'portfolio_assets',
    title: 'Portfolio_Assets_Unsorted.pdf',
    folderId: 'creative_hardware',
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.portfolio_assets} />,
    position: { x: 120, y: 120 }
  },
  {
    id: 'lifestyle_photography',
    title: 'Lifestyle_Photography.pdf',
    folderId: 'creative_hardware',
    iconType: 'document',
    content: <CaseStudyViewer {...caseStudies.lifestyle_photography} />,
    position: { x: 130, y: 130 }
  },

  // RevOps Strategy
  {
    id: 'dna_detergent',
    title: 'DNA_Detergent_Concept.pdf',
    folderId: 'revops_strategy',
    iconType: 'document',
    content: <PlaceholderContent title="DN/A Sustainable Detergent Concept" />,
    position: { x: 100, y: 100 }
  },
  {
    id: 'whale_curve',
    title: 'Whale_Curve_Dashboard.xls',
    folderId: 'revops_strategy',
    iconType: 'document',
    content: <PlaceholderContent title="ABC Cost-to-Serve Dashboard" />,
    position: { x: 120, y: 120 }
  },
  {
    id: 'competitive_deepdives',
    title: 'Market_Benchmarks.pdf',
    folderId: 'revops_strategy',
    iconType: 'document',
    content: <PlaceholderContent title="Competitive Deep Dives" />,
    position: { x: 140, y: 140 }
  },
  {
    id: 'copilot_demo',
    title: 'AI_Copilot_Demo.mp4',
    folderId: 'revops_strategy',
    iconType: 'document',
    content: <PlaceholderContent title="AI Copilot Brand Agent Demo" />,
    position: { x: 160, y: 160 }
  },
  {
    id: 'architecture_map',
    title: 'Tech_Stack_Map.fig',
    folderId: 'revops_strategy',
    iconType: 'document',
    content: <PlaceholderContent title="Global Architecture Map" />,
    position: { x: 180, y: 180 }
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
