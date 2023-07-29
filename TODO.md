# Todo list

## Current tasks

- [ ] (1) Handle zooming in/out
      Working, but still a bit buggy in some cases. After having zoomed in the resizing of elements gets messed up, the scale seems to be off a bit.
- [ ] (2) Add ability to add diamond element
- [ ] (3) Improve the polyline so it doesn't include the last point, it should be removed. And allow for a straight line element, and a polyline one.
- [ ] (3) Add undo/redo of operations
- [ ] (4) Add ability to add generic path
- [ ] (5) Add history logs
- [ ] (6) Add e2e encryption

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
