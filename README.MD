# ProjectDB
A Free & Open Source Alternative to Google Drive, OneDrive, Dropbox, etc.

## Database Structure (MongoDB)

### userauth collection:

_id (unique user identifier)
username
password_hash (securely hashed password, e.g., using bcrypt)
salt (used in the hashing process)
files collection:

_id (unique file identifier)
filename
metadata (creation date, modification date, etc.)
owner (reference to the user's _id)
file_data (GridFS reference)

## Server-Side Components

### Configuration GUI (Tkinter):

Inputs for host, port, and database path
Button to start/stop the server
## Authentication:

### login route:
Read username and password from the request.
Retrieve the matching user record from userauth.
Compare provided password hash against stored hash.
If successful, set authentication cookies.
Middleware to check cookies on protected routes.
API Routes:

### directory: Returns directory structure under the user's subdirectory.
### upload:
Authenticates user.
Stores file in GridFS.
Creates a record in the files collection.
download:
Authenticates user.
Verifies user ownership of the file.
Retrieves file from GridFS and serves it to the client.
modify: (Similar logic to upload)
delete: (Similar logic to download)
Security Considerations

### Strong Password Hashing: Use bcrypt or scrypt.
### HTTPS: Enforce HTTPS connections.
Input Sanitization: Mitigate XSS, SQL injection, and path traversal attacks.
Access Control: Implement file/folder level permissions for future sharing features.
Regular Updates: Address security vulnerabilities in dependencies.
Client-Side Implementation

### Login Form: Collect username and password.
Directory View: Display file/folder structure.
File Interactions: Buttons/menus for upload, download, modify, delete.
AJAX Requests: Communicate with the server API.
Project Steps

## Set up environment: Install dependencies.
Database design: Create MongoDB collections.
Tkinter GUI: Build the configuration interface.
Server-side logic: Implement API routes, authentication, file system interactions with GridFS.
Client-side: Develop HTML structure, JavaScript interactions, and AJAX calls.
Security Review: Address security concerns throughout the process.
Testing: Thoroughly test functionality and security measures.

## Starting MongoDB

### Create Data and Log Directories:

### Bash
sudo mkdir -p /System/Volumes/Data/data/db
sudo chown -R $USER /System/Volumes/Data/data/db

## Start the MongoDB service:

### Bash
brew services start mongodb-community@7.0


Could you create me an outline for a file hosting database server that can accept http requests from a javascript server to create, modify or remove files given the request, I would like the database client to be easily able to choose the host, port, and path of the server in a tkinter ttk GUI (TKinter GUI is for the server side script to easily choose a port, host and path for the database), an example, localhost, 5432, /data/. I would like the database the authenticate the user based on the browser cookies checking for username and password, based on this username the user will have access to their database subdirectory, /data/{username}/{userspecificfolders}..., on the serverside there will be a list (userauth.json) where the encrypted user dataname and password is stored, the user will only have access to their data if their username and password have been authenticated by the server on login request.

Stack (Example):
Client (Browser):
JavaScript/jQuery
Handle GUI interactions.
Manage browser cookies (create, read, delete)
Formulate HTTP requests (use AJAX for smooth updates):
•	POST for login
•	GET to fetch directory contents
•	POST for file upload
•	PUT for file modification
•	DELETE for file/folder removal


Server (Desktop):
MongoDB with GridFS
Python
Flask:
Python (Flask)

Routes:
•	/login (Handles authentication, cookie management)
•	/directory (Fetches directory structure for a user)
•	/upload
•	/download
•	/modify
•	/delete

Security:
Encryption:
userauth.json: Don't store passwords as plain text; use robust hashing and salting (e.g., bcrypt, scrypt).
File transfer: HTTPS is highly recommended for data in transit.
File Storage: Carefully evaluate security of the file storage mechanism (database/filesystem).
Input Sanitization: Prevent XSS, path traversal, etc. in the file/directory names



Steps in user creating and accessing a file in the DB (Example):

1.	User Logs into DB, example, (Username: “Admin”, Password: “Admin”), cookies are created storing the user authentication and user is redirected to homepage.
a.	The server will check the cookies and check the locally encrypted list of users and their authentications to see if this user exists or the password is correct.
2.	Homepage requests from the server they connected to (In the Client Page setup with the login, example http://192.168.1.13:5432), this should be an additional function in the server to request the directory within the user filesystem (/data (SHOULD NEVER BE VISIBLE TO THE USER)/Admin (Example Given)/… (The directory sent to the user, everything within the user folder))
3.	The user attempts to upload a new file in the root folder of their directory, example, test.txt, an HTTP response is then sent to the server requesting the creation of this file. The server will check the user cookies verifying they have the valid permissions to create a file on this directory, this is the user’s own directory, as such they have write permissions, in the future, sharing will be added allowing users to share directories or files with other users. The server will than check the contents of the request for directory (The directory the user was in when uploaded), file name (The name of the file, either when uploaded or chosen by user during upload process), and file (The actual file itself)
4.	The server will now attempt to make a file at the user directory within the data folder given the file directory (relative the user directory), the file name, and the file itself.
5.	The server will than sent an updated directory to the user.
6.	The process is much the same for modification of files and deletion of files, just different requests.

