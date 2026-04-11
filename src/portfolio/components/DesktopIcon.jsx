import React from 'react';

const DesktopIcon = ({ id, title, position, onDoubleClick, isFolderItem }) => {
  return (
    <div
      className="desktop-icon"
      style={isFolderItem ? { position: 'relative', width: '100%', alignItems: 'center' } : { top: position.y, left: position.x }}
      onDoubleClick={onDoubleClick}
      tabIndex="0"
    >
      <div className="desktop-icon-img"></div>
      <div 
        className="desktop-icon-text" 
        style={isFolderItem ? { color: '#000000', textShadow: 'none', wordBreak: 'break-word', whiteSpace: 'normal', fontSize: '14px' } : {}}
      >
        {title}
      </div>
    </div>
  );
};

export default DesktopIcon;
