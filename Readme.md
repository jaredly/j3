
# jerd, or maybe stoa

This used to be the repo of a programming language + structured editor.

Now I'm calling it a Language Development Environment; it's an editor that you can use to incrementally create self-hosted programming languages.

Currently I'm working on a terminal-based incarnation, because I thought it would be fun, and because the constraints allow me to focus in on the core functionality. You can see an example of what it looks like [here](https://x.com/jaredforsyth/status/1831887867712565312).

If you want to try out the terminal interface, you'll need two commands:
- `npm run ows` starts the server, which manages persistence
- `npm run owc` will start the cli client

Both use `bun`, which handily evaluates typescript files without any fuss.

I recommend `pnpm` for installing the dependencies.

ctrl_arrows when the toplevel is fully selected, can move a toplevel around

## The Compiler Tutorial

I've written a compiler (and type-checker) tutorial using the previous version of the Language Development Environment, which can be viewed at https://compiler.jaredforsyth.com. There's a lot of good stuff there, but I want to rewrite it entirely, and as a part of that I realized I needed to rebuild the LDE from the ground up. As one does.

## Repo organization
it is not

most of the new work is happening in the `one-world` directory.
other directories contain various previous versions.
