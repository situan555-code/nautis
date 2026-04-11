import React from 'react';

const CaseStudyViewer = ({ title, role, timeline, blocks }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: '24px',
      height: '100%',
      overflowY: 'auto',
      fontFamily: '"Times New Roman", Times, serif',
      lineHeight: '1.6'
    }}>
      <header style={{ marginBottom: '32px', borderBottom: '2px solid #000', paddingBottom: '16px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>{title}</h1>
        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', fontFamily: 'monospace', color: '#555' }}>
          {role && <span><strong>Role:</strong> {role}</span>}
          {timeline && <span><strong>Timeline:</strong> {timeline}</span>}
        </div>
      </header>

      <div className="case-study-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {blocks.map((block, index) => {
          if (block.type === 'text') {
            return (
              <div key={index} style={{ fontSize: '16px' }}>
                {block.heading && <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>{block.heading}</h3>}
                <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{block.content}</p>
              </div>
            );
          } else if (block.type === 'image') {
            return (
              <figure key={index} style={{ margin: 0, padding: '16px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
                <img src={block.src} alt={block.caption || 'Case Study Visual'} style={{ width: '100%', height: 'auto', display: 'block' }} />
                {block.caption && (
                  <figcaption style={{ marginTop: '8px', fontSize: '12px', fontFamily: 'monospace', textAlign: 'center', color: '#666' }}>
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          } else if (block.type === 'video') {
            return (
              <figure key={index} style={{ margin: 0, padding: '16px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
                <video src={block.src} controls autoPlay muted loop style={{ width: '100%', height: 'auto', display: 'block', outline: 'none' }} />
                {block.caption && (
                  <figcaption style={{ marginTop: '8px', fontSize: '12px', fontFamily: 'monospace', textAlign: 'center', color: '#666' }}>
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default CaseStudyViewer;
