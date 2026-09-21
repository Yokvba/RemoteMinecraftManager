### ℹ️ <ins>INFO:</ins>
* Run this script and your Minecraft Server as Root! (Important due to missing permission as normal user)
> (or if you know how to use chmod, give permission to config.json, index.js and the whole webmanager path. The RemoteManager and Minecraft server have to run on the same user.)

### ☝️ <ins>GETTING STARTED:</ins>
1. Install screen: `sudo apt install screen -y`
2. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create an Application and Bot.
3. Invite the Bot to your Server (Permissions Number: `277025778752`)
4. Follow the README.txt tutorial in [MCServer Dependencies](https://github.com/Yokvba/RemoteMinecraftManager/tree/main/MCServer%20Dependencies)
5. Configure the config.json
6. Run the server using `node .`
7. Use the web through IP:8080 or the Discord Bot in your server.

### ⚠️ <ins>LIABLITY WARNING:</ins>
* I AM NOT LIABLE FOR ANY DAMAGED CAUSED BY THIS PROGRAMM OR THIRD PARTIES USING THE PROGRAMM.
* YOU ARE AWARE THIS PROGRAMM IS STILL EXPERIMENTAL AND MAY HAVE BUGS.
* REASONABLE SECURITY MEASSURES ARE IN PLACE BUT NO GARUENTEE CAN BE MADE THAT THIS PROGRAMM IS FULLY SECURE.
* RUN THIS AT YOUR OWN RISK.

### ✍ <ins>TODO:</ins>
Small:
* Remove 25Mb Upload Cap
* Add Terms and Conditions and Cookies Agree Page.
Major:
* Make discord bot alert when Server goes offline or unusually high server usage.
* Replace server usage in Minecraft page with Minecraft server specific buttons (e.g. Players, Whitelist, Banlist, maybe Backups).
* Create, delete and manage multiple minecraft server.
