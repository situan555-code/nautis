import React, { useState } from 'react';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import FolderView from './components/FolderView';
import CaseStudyViewer from './components/CaseStudyViewer';
import { fileSystem } from './os/fileSystem';

const App = () => {
  const [highestZIndex, setHighestZIndex] = useState(10);
  
  // Define all windows in the OS recursively mapped from the OS file system registry.
  const [windows, setWindows] = useState(
    fileSystem.map(win => ({
      ...win,
      isOpen: false,
      isMinimized: false,
      zIndex: 10
    }))
  );

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
