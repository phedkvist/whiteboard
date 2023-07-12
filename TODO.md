# Todo list

## Current task

Select multiple elements with the mouse and move the elements

Already have the multiple select functionality in place. Now its a matter of making the commands work together with them.

- [x] Delete multiple elements at once.
- [ ] Move several elements at once.
- [ ] Resize multiple elements at once.

Can get moving multiple elements at once to work, but need to tweak the resizing of elements as well.
For group resize the group should be resized but with keeping the width/height ratio.

Consider creating a class for elements, or enforce a certain spec each element has to follow. How they should grow, shrink etc.
Right now its easy to just completely miss one functionality for a given element, the tests should cover each case, but still, would be cleaner code.

# Backlog

## Basic features

- [x] Drag elements around
- [x] Add basic elements to canvas (rect, ellipse)
- [x] Add hover cursor when mouse is over element
- [x] Add text element to canvas
- [x] Add element property settings on the left handside
- [x] Change color of element on canvas
- [x] Add the ability to place elements above or below other elements
- [ ] Select multiple elements with the mouse and move the elements
- [x] View-box should be updated to be of the same width and height of current screen.
- [x] Add ability to delete elements
- [ ] Add ability to draw lines between shapes
- [ ] Add multi-point lines that have a rounded corner
- [x] Add support for several rooms

## Advanced features

- [ ] Handle zooming in/out
- [x] Handle panning around the canvas
- [x] Handle turning an element around
- [x] Handle resizing an element
- [ ] Add ability to add image
- [ ] Add history logs
- [ ] Add undo/redo of operations
- [x] Collaboration features
- [ ] Snap lines. When moving an element

## Super advanced

- [ ] Import elements from an image of a real whiteboard

## Misc improvements

- [x] Place the appState into a context, removes prop drilling.
- [x] Update the resizing function to take the rotation into account.
- [ ] Use some kind of reducer pattern to improve how the state changes between updates
