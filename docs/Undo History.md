# Undo / History

What should we do about undo?

At the highest level, we have hash-addressing, which is basically working on the "git" level.

But then when editing in your sandbox, I kindof want to be able to undo/redo both at the global level, and at the "term" level.
Right?

OR should the main undo/redo behavior be just at the term level, but you can ... view a flattened history if you want?
Yeah actually that probably makes more sense, and would be easier to model.

ALSO we'll have snapshotting.
