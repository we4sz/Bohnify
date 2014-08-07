#Bohnify
Bohnify consists of a server in python that supplies a websocket server and one prebuild HTML5client.
The server uses pyspotify which uses LibSpotify to stream music and browse metadata from Spotify.
It's the perfect solution if you want to play Spotify on an htpc or just let everyone control the music on a party.

## Build
Working on a building script, please contribute


## WebSocket API
    ws://localhost:1650

Direcly when you connects you will receive loginstatus:
    
    {loginstatus :  {
                      login : <bool : true if loggedin, false else>,
                      logingin : <bool : true if trying to login, false else>,
                      user : <Object: User object if loggedin>
                    }}
                    
You will also receive player status: 

    {status : {
                random : <bool : true if shuffle is activated >,
                repeat : <bool : true if repeat is activated>,
                paused : <bool : true if the track is paused>,
                position : <num : the position if the player in the track>,
                track : <Object : the current track, undefined if no track has started>,
                volume : <num : 0-100 the volume level>,
                party: <bool : true if party mode is activated>
              }}
#### JSON strings to controll server
######Login:

    To login if loginstatus.login == false and loginstatus.logingin == false
    {login : {username : <string : username>, password : <string : password>}}
    Will broadcast a new loginstatus like above or an error like:
    {loginstatus : {loginerror: "Bad username or password!"}}

---

######Search & Browse:
    To search for a query or an uri
    {search : <string : query>}
    
    If using uri it will return a browseobject otherwise a list of 100 tracks
    
----

To bo continued
