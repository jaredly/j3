export const colors = {
    selection: 'rgba(200,200,0,0.2)',
    nodeSelection: 'rgba(0,200,255,0.2)',
    string: 'rgb(195 163 20)', // 'rgba(255, 255, 0, 1)',
    stringBg: 'rgba(195, 163, 20, 0.05)',
};

const dark = true;
export const termColors = dark
    ? {
          stringBg: { r: 35, g: 35, b: 0 },
          string: { r: 100, g: 100, b: 0 },
          highlight: { r: 15, g: 30, b: 100 },
          fullHighlight: { r: 20, g: 50, b: 50 },
          cursor: { r: 255, g: 255, b: 255 },
          cursorHighlight: { r: 200, g: 255, b: 200 },
          dragHighlight: { r: 200, g: 100, b: 100 },
          kwd: { r: 100, g: 150, b: 200 },
          topHandle: { r: 100, g: 100, b: 100 },
      }
    : {
          cursor: { r: 0, g: 0, b: 0 },
          cursorHighlight: { r: 0, g: 100, b: 0 },
          stringBg: { r: 255, g: 255, b: 200 },
          string: { r: 200, g: 200, b: 0 },
          highlight: { r: 200, g: 220, b: 250 },
          fullHighlight: { r: 200, g: 250, b: 250 },
          dragHighlight: { r: 200, g: 100, b: 100 },
          kwd: { r: 200, g: 100, b: 100 },
          topHandle: { r: 50, g: 50, b: 50 },
      };
