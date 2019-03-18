node-mud-websocket
==================

node-mud-websocket is a websocket relay for MUDs.


Running
-------

There are two modes, development and production.

* For local development, use `yarn start`.
* For production, use `docker run -ePORT=4000 -eMUD_PORT=5000 -eMUD_ADDRESS=primaldarkness.com -p4000:4000 justinm/node-mud-socket`.

Features
--------
**Color Support**

ANSI color codes are replaced with <span> tags and their corresponding color. Since the engine
does not render actual color HEX codes, but classes, this allows the output rendered to be highly
themed.


**GMCP Support**

MUDs that support GMCP will emit the `gmcp` event, allowing your UI to react accordingly. This
works great for adding Vital bars and other HUD like features.


Communicating with the Server
-----------------------------

The websocket server communicates via JSON event packages. The only requirement is 
each JSON payload contain a `type` key indicating the type of event that's being sent
or received.


**Event - connection**

```javascript
  { 'type': 'connection', 'status': 'success' }
```

The connection event notifies the frontend regarding the connection status to the MUD. Valid
status keys are: success and closed.

**Event - text**

```javascript
  { 'type': 'text', 'text': 'MUD output' }
``` 

The text event is sent whenever the MUD sends data. The event will contain however much data
has been received so far, but may not be the full payload. Make sure to treat this like a
stream of data.

**Event - echo**

```javascript
  { 'type': 'echo', 'disabled': true }
```

Notifies the client when echos should be disabled. This is common for password prompting, where
the password should not be added to the display.

**Event - gmcp**

```javascript
  { 'type': 'gmcp', 'key': 'Char.Vitals', 'value': '{"HP": 100}' }
```

GMCP events are triggered whenever the MUD sends a GMCP event.

