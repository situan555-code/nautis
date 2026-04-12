import React, { useState } from 'react';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import FolderView from './components/FolderView';
import CaseStudyViewer from './components/CaseStudyViewer';
import { caseStudies } from './data/caseStudies';

import Paint from './components/Paint';

// Placeholders for content
const PlacholderContent = ({ title }) => (
  <div style={{ padding: '16px' }}>
    <h2>{title}</h2>
    <p>Upload video/image assets and replace this component.</p>
  </div>
);

const App = () => {
  const [highestZIndex, setHighestZIndex] = useState(10);
  
  // Define all windows in the OS. 
  // onDesktop means it shows up as an icon on the main screen.
  const [windows, setWindows] = useState([
    // --- TOP LEVEL DESKTOP ICONS ---
    {
      id: 'paint',
      title: 'Paint.exe',
      onDesktop: true,
      content: <Paint />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 40, y: 540 }
    },
    {
      id: 'agentic_engineering',
      title: 'Agentic_Engineering.exe',
      onDesktop: true,
      content: <FolderView folderId="agentic_engineering" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 40, y: 40 }
    },
    {
      id: 'mavin_systems',
      title: 'Mavin_Systems',
      onDesktop: true,
      content: <FolderView folderId="mavin_systems" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 40, y: 140 }
    },
    {
      id: 'creative_hardware',
      title: 'Creative_Hardware.dir',
      onDesktop: true,
      content: <FolderView folderId="creative_hardware" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 40, y: 240 }
    },
    {
      id: 'revops_strategy',
      title: 'RevOps_Strategy',
      onDesktop: true,
      content: <FolderView folderId="revops_strategy" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 40, y: 340 }
    },
    {
      id: 'awards',
      title: 'Awards_and_Links',
      onDesktop: true,
      content: <FolderView folderId="awards" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 40, y: 440 }
    },

    // --- INNER FILES / EXECUTABLES ---
    
    // Agentic Engineering
    {
      id: 'ios_app',
      title: 'Native_iOS_App.exe',
      folderId: 'agentic_engineering',
      content: <PlacholderContent title="Native iOS App (Agentic Dev)" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 100, y: 100 }
    },
    {
      id: 'pim_data',
      title: 'PIM_Data_Cleansing.bat',
      folderId: 'agentic_engineering',
      content: <PlacholderContent title="PIM Data Pipeline & AI Cleansing" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 120, y: 120 }
    },

    // Mavin Systems
    {
      id: 'mavin_trailer',
      title: 'Mavin_Trailer_Design.jpg',
      folderId: 'mavin_systems',
      content: (
        <div style={{ padding: '8px', backgroundColor: '#fff', height: '100%' }}>
          <img src="/case-studies/mavin_trailer.jpg" alt="Mavin Trailer Design" style={{ width: '100%', height: 'auto', border: '1px solid #ccc' }} />
          <p style={{ textAlign: 'center', fontFamily: 'monospace', marginTop: '8px' }}>Designed completely by me.</p>
        </div>
      ),
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 90, y: 90 }
    },
    {
      id: 'mavin_3d',
      title: '3D_WebGL_Configurator.html',
      folderId: 'mavin_systems',
      content: <PlacholderContent title="Mavin 3D Configurator & Lead Gen" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 100, y: 100 }
    },
    {
      id: 'mavin_lidar',
      title: 'Timber_LiDAR_Pointcloud.exe',
      folderId: 'mavin_systems',
      content: <PlacholderContent title="Mavin Timber LiDAR Potree Demo" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 120, y: 120 }
    },

    // Creative Hardware
    {
      id: 'pageantry_commercial',
      title: 'Pageantry_Innovations.mp4',
      folderId: 'creative_hardware',
      content: <CaseStudyViewer {...caseStudies.pageantry_commercial} />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 100, y: 100 }
    },

    {
      id: 'kiosk_tech',
      title: 'Retail_Kiosk.pdf',
      folderId: 'creative_hardware',
      content: <CaseStudyViewer {...caseStudies.mavin_kiosk} />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 120, y: 120 }
    },

    {
      id: 'distroblox_video',
      title: 'distroBLOX_Announcement.mp4',
      folderId: 'creative_hardware',
      content: <CaseStudyViewer {...caseStudies.distroblox} />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 140, y: 140 }
    },
    {
      id: 'ihfc_trade_show',
      title: 'IHFC_Showroom.gallery',
      folderId: 'creative_hardware',
      content: <CaseStudyViewer {...caseStudies.ihfc_trade_show} />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 150, y: 150 }
    },
    {
      id: 'product_photo',
      title: 'Product_Photography.png',
      folderId: 'creative_hardware',
      content: <CaseStudyViewer {...caseStudies.product_photography} />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 160, y: 160 }
    },
    {
      id: 'print_design',
      title: 'Environmental_Design.gallery',
      folderId: 'creative_hardware',
      content: <CaseStudyViewer {...caseStudies.environmental_design} />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 170, y: 170 }
    },

    // RevOps Strategy
    {
      id: 'dna_detergent',
      title: 'DNA_Detergent_Concept.pdf',
      folderId: 'revops_strategy',
      content: <PlacholderContent title="DN/A Sustainable Detergent Concept" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 100, y: 100 }
    },
    {
      id: 'whale_curve',
      title: 'Whale_Curve_Dashboard.xls',
      folderId: 'revops_strategy',
      content: <PlacholderContent title="ABC Cost-to-Serve Dashboard" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 120, y: 120 }
    },
    {
      id: 'competitive_deepdives',
      title: 'Market_Benchmarks.pdf',
      folderId: 'revops_strategy',
      content: <PlacholderContent title="Competitive Deep Dives" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 140, y: 140 }
    },
    {
      id: 'copilot_demo',
      title: 'AI_Copilot_Demo.mp4',
      folderId: 'revops_strategy',
      content: <PlacholderContent title="AI Copilot Brand Agent Demo" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 160, y: 160 }
    },
    {
      id: 'architecture_map',
      title: 'Tech_Stack_Map.fig',
      folderId: 'revops_strategy',
      content: <PlacholderContent title="Global Architecture Map" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 180, y: 180 }
    },

    // Awards and Links
    {
      id: 'casegoods_award',
      title: 'Best_Casegoods_24_25.url',
      folderId: 'awards',
      content: <PlacholderContent title="Best Domestic Casegoods (2024 & 2025)" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 100, y: 100 }
    },
    {
      id: 'linkedin',
      title: 'LinkedIn_Profile.url',
      folderId: 'awards',
      content: <PlacholderContent title="LinkedIn Profile Shortcut" />,
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      position: { x: 120, y: 120 }
    }
  ]);

  const bringToFront = (id) => {
    setHighestZIndex((prev) => prev + 1);
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, zIndex: highestZIndex + 1 } : win
      )
    );
  };

  const openWindow = (id) => {
    // Check if the user is trying to open a URL
    if (id === 'linkedin') {
      window.open('https://www.linkedin.com', '_blank');
      return;
    }
    
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, isOpen: true, isMinimized: false } : win
      )
    );
    bringToFront(id);
  };

  const closeWindow = (id) => {
    setWindows((prev) =>
      prev.map((win) => (win.id === id ? { ...win, isOpen: false } : win))
    );
  };

  const toggleMinimize = (id) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, isMinimized: !win.isMinimized } : win
      )
    );
    const targetWin = windows.find(w => w.id === id);
    if (targetWin && targetWin.isMinimized) {
      bringToFront(id);
    }
  };

  const updatePosition = (id, x, y) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, position: { x, y } } : win
      )
    );
  };

  // We inject openWindow and specific folder data down via React.cloneElement
  const injectPropsToContent = (content) => {
    if (React.isValidElement(content) && content.type === FolderView) {
      return React.cloneElement(content, { windows, openWindow });
    }
    return content;
  };

  const desktopWindows = windows.filter(w => w.onDesktop);

  return (
    <>
      <Desktop 
        desktopIcons={desktopWindows} 
        openWindows={windows} 
        openWindow={openWindow} 
        closeWindow={closeWindow} 
        updatePosition={updatePosition} 
        bringToFront={bringToFront} 
        injectPropsToContent={injectPropsToContent}
      />
      <Taskbar windows={windows} toggleMinimize={toggleMinimize} bringToFront={bringToFront} />
    </>
  );
};

export default App;
