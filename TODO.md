# Todo list

## Current tasks

- [x] Handle zooming in/out
- [x] Add ability to add diamond element
- [ ] Improve the polyline so it doesn't include the last point, it should be removed. And allow for a straight line element, and a polyline one.
- [ ] Update the UI so it looks nicer.
- [ ] Add undo/redo of operations
- [ ] Refactor the Canvas/Elements ase there is too much code duplication.
- [x] Refactor the MouseEvents.tests.tsx ase there is too much code duplication.
- [ ] Add ability to add generic path
- [ ] Add history logs
- [ ] Add e2e encryption

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
- [x] Add support for several rooms
- [x] Add multi-point lines that have a rounded corner
- [x] Add ability to draw lines connecting to shapes
      Problem: Line is sometimes underneath elements, making it impossible to change the point.
      Solution: Always display "lines" above elements?
      Problem: What should happen to the point if the element is rotated?
      Solution: add another parameter that tells how much the element was rotated when the point was created.
- [ ] (on hold) Resize multiple elements at once.
      For group resize the group should be resized but with keeping the width/height ratio.
- [ ] Add ability to add image
- [ ] Snap lines. When moving an element
- [ ] Add ability to add generic svg objects (different shapes, lines, graphics, arrows etc.)
- [x] Handle panning around the canvas
- [x] Handle turning an element around
- [x] Handle resizing an element
- [x] Collaboration features

## Random ideas

- [ ] Import elements from an image of a real whiteboard

## Misc improvements

- [x] Place the appState into a context, removes prop drilling.
- [x] Update the resizing function to take the rotation into account.
