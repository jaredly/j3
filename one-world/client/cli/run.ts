import termkit from 'terminal-kit';

process.stdout.write('\x1b[6 q');

termkit.getDetectedTerminal((err, term) => {
    if (err) {
        console.log('Failed to detect terminal');
        return process.exit(1);
    }
    term.clear();

    // term.moveTo(10, 10)
    const sb = new termkit.ScreenBuffer({ dst: term });
    sb.moveTo(10, 10);
    sb.put({}, 'Hello folks');
    sb.draw();

    term.hideCursor(false);
    // term.grabInput(true);
    let x = 10;
    setInterval(() => {
        x++;
        // term.moveTo(x, 10);
        sb.clear();
        sb.moveTo(x, 10);
        sb.put({ newLine: true }, 'Hello folks\nand stuff');
        term.clear();
        sb.draw();
        sb.moveTo(x, 10);
        sb.drawCursor();
    }, 1000);
});
