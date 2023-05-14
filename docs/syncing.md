# Syncing

CRDTs are used

Version vectors are used in order to determine which changes has been made by each user.
In order to sync when a user has been offline, we use the version vectors to sync missing changes.

Ephemeral changes are used in order to reduce storage. For example when a user drags a rectangle along the screen, we don't need to store the intermediate states, only the end state is needed. As a result ephemeral changes are not included in the version vector syncing, as this doesn't make sense.
