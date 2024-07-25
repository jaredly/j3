export const colors = {
    selection: 'rgba(200,200,0,0.2)',
    nodeSelection: 'rgba(0,200,255,0.2)',
    string: 'rgb(195 163 20)', // 'rgba(255, 255, 0, 1)',
    stringBg: 'rgba(195, 163, 20, 0.05)',
};

const dark = false;
export const termColors = dark
    ? {
          stringBg: { r: 35, g: 35, b: 0 },
          string: { r: 100, g: 100, b: 0 },
          highlight: { r: 20, g: 50, b: 150 },
      }
    : {
          stringBg: { r: 255, g: 255, b: 200 },
          string: { r: 200, g: 200, b: 0 },
          highlight: { r: 200, g: 220, b: 250 },
      };
