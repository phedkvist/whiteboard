# Todo list

## Current task

- [ ] Add ability to draw lines connecting to shapes

Would require the polyline to keep track of whether or not a certain point is connecting to an element, and whereabout on the element?
Consider how the line would change as the element or the line moves.

- [ ] Resize multiple elements at once.

For group resize the group should be resized but with keeping the width/height ratio.

# Backlog

## Basic features

- [x] Drag elements around
- [x] Add basic elements to canvas (rect, ellipse)
- [x] Add hover cursor when mouse is over element
- [x] Add text element to canvas
- [x] Add element property settings on the left handside
- [x] Change color of element on canvas
- [x] Add the ability to place elements above or below other elements
- [x] Delete multiple elements at once.
- [x] Move several elements at once.
- [x] View-box should be updated to be of the same width and height of current screen.
- [x] Add ability to delete elements
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
