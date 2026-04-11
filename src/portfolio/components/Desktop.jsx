import React from 'react';
import Window from './Window';
import DesktopIcon from './DesktopIcon';

const Desktop = ({ desktopIcons, openWindows, openWindow, closeWindow, updatePosition, bringToFront, injectPropsToContent }) => {
  return (
    <div className="desktop">
      <div className="crt-overlay"></div>
      
      {/* Render Desktop Icons */}
      {desktopIcons.map((icon, index) => (
        <DesktopIcon
          key={icon.id}
          id={icon.id}
          title={icon.title}
          position={{ x: 20, y: 20 + index * 100 }}
          onDoubleClick={() => openWindow(icon.id)}
        />
      ))}

      {/* Render Windows */}
      {openWindows.map((win) => {
        if (!win.isOpen || win.isMinimized) return null;
        return (
          <Window
            key={win.id}
            id={win.id}
            title={win.title}
            content={injectPropsToContent(win.content)}
            position={win.position}
            zIndex={win.zIndex}
            updatePosition={updatePosition}
            closeWindow={() => closeWindow(win.id)}
            bringToFront={() => bringToFront(win.id)}
          />
        );
      })}
    </div>
  );
};

export default Desktop;
