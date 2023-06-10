# Todo list

## Current task

- [ ] Add support for several rooms

Need endpoint for creating a new room.
Get a uuid that maps to the room.
Then you should be able to connect to the room.

Either the UUID is created by the user or a request is made so that the room is created by the server.
Doing the former is more of a local first approach.

Once connected to a room, the sync class either all changes in memory, or if it doesn't, has to fetch all changes from db. Should the sync class always be instantiated or should it always keep things in memory.

Stateless vs stateful?

Stateful requires one server to be "active".
Stateless requires something lik

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
