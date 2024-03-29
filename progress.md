# 09/01/2024 0AM -> 4AM:
- Spent the day reading documentation from the stack, many of the tools are alien to me, and the scale of the project overwhelmed regarding where I should start.
- For now, I've decided to focus on creating a basic front-end, while still reading postgre documentation. 
- I have also separated the tasks — using a short GPT prompt — in [this file](info.md).
# 10/01/2024 9PM -> 0AM
- built a prototype sidebar and icon

# 12/01/2024 10PM -> 1AM
- committed assets folder
- exposed crud endpoits
- figuring out postgres

# 15/01/2024 9PM -> 0AM
- troubleshooting permission issues, probably due to how the external drive is mounted, since my repository is there. will change its location to the SSD partition to avoid such headaches in the future.

# 16/01/2024 8PM -> 0AM
- figuring out the db structure
- messing with sql scripts
- as I cloned with https, I couldn't commit in time to appear as 16/01 and had to troubleshoot it. turns out I just had to change the remote address.

# 17/01/2024 10PM ->
- luz caiu

# 18/01/2024 18:00 -> 21:20
- added server scrips and fixed sql migration syntax
- will refactor

# 19/01/2024 9PM -> 00:40
- fixed typos
- read some db theory
- trying postman

# 22/01/2024 - 8PM -> 11PM
- testing CRUD endpoints with postman
- CRUD endpoints functioning

# 23/01/2024 - 9PM ->
- restructured directories
- testing ejs
- mime type issues, im probably doing something very dumb yet im clueless as to what it is

# 25/01/2024 - 
- fixed the issue, idk what to do now

# 26/01/2024 9PM -> 00AM
- dir reestructuring, working on ejs pages
- trying to create a home page, added styled sidebar buttons without functionality
- will implement the buttons tomorrow

# 29/01/2024 9PM -> 00AM
- learning ejs things
- learned that I have to constantly commit in order to not lose all my progress due
- added a delete button
- I will refactor the entirety of the views

# 30/01/2024 11PM -> 2:30AM
- still learning ejs things
- now the form renders in place of the table through hiding it in styling, instead of linking to another page
- form added, post request still not implemented
- somewhat refactored views

# 31/01/2024 4:30PM -> 5:30PM / 7PM -> 10:00PM
- unstiled new task button now works
- delete button is probably overengineered, but it works so idc for now
- due date info is broken, probably because it's not taking into account the timezone that the database requires
- basic styling to make the buttons feel like buttons
- fixed POST bugs (mainly typos), now new tasks will properly have their completed status filled and their due date.
- have yet to implement the completion of tasks through checkboxes.
- trying to stay sane

# 01/02/2024 11PM ->
- delete button now deletes the row on the client side after recieving a response from the DELETE endpoint.

# 19/02/2024 9PM -> 12PM
- trying to make sense of whatever I wrote and trying to implement the checkbox marking thing

# 20/02/2024 9PM -> 12PM
- fixed PUT request, now it filters null values from the query.
- fixed checkboxes not being synchronized with the database.
- made ejs embedding readable.
- init basic sidebar, cause I forgot where I put the old one

# 21/02/2024 4PM -> 7PM
- properly formatting due_date server-side (database unchanged)
- styling
- todo: change priority to be in relation to the present tasks, instead of being a static value
- todo: search bar

# 22/02/2024 8PM -> 11PM
- spend a whole 2 hours trying to style the history and archive containers to be in the bottom part, didn't achieve anything
- implemented today button

# 23/02/2024 4PM -> 7PM
- refactoring and trying to implement search function, have yet to fix queries and some routing issues

# 26/02/2024 22PM -> 0:30AM
- working on login system and ignoring everything else for now.
- corrupted local repo, had to spend time fixing it

# 27/02/2024 21PM -> 00AM
- implemented registering, queries and back end logic seem alright. need to fix endpoints

# 28/02/2024 21:00 -> 00:00
- fixed registration error handling
- optimized routes
- experimenting with express middlewares
- for some reason front end date parsing isn't working because EJS does not recognize a DEFINED function, and this is totally my fault but I don't know why

# 29/02/2024 18:00 ->
- being confused by EJS, left the date rendering method on the server instead of the client side. will make timezone flexible eventually.
- bugfixing

# 03/03/2024 21:00
- using node scrypt for db security (idk if it's implemented correctly);
- yet to add session tokens using JWT
- yet to implement the login page

# 04/03/2024 21:00
- added two dependencies, dotenv and jsonwebtoken.
- implemented both of them, have yet to test them.
- register/login is broken atm, will fix tomorrow

# 05/03/2024 19:00 -> 22:00
- todo: uAuth client side checks
- implemented session tokens (unused for now)
- uAuth is now working
- lost on how to deal with tokens, will do tomorrow. probably some cors issue

# 07/03/2024 21:00 ->
- dependancy added: "cookie-parser" middleware
- cookie auth now working. eventually will have a 404 page.
- too tired to figure out what to do for the user crud. idk if I create a debug endpoint, or if I make conditional queries. will decide tomorrow.

# 08/03/2024 20:00 ->
- admin/user CRUD queries are supposedly complete, yet to be tested.

# 11/03/2024 23:30 ->
- TODO: Deprecate all of /app/tasks/.. and turn them into queries. The back end structure is ready for the main tasks endpoint to handle everything. DONE
- Admin recognition tested and ready. Now to understand how to deal with this.
- refactored routes

# 13/03/2024 02:00 -> 5:00
- added register error handling
- implemented task ownership
- added users table for admins with mild styling
- buttons don't have functionality yet. edit button is broken

# 13/03/2024 18:00 -> 20:00
- init admin endpoint
- fixing front end script (still have some issues with it)

# 18/03/2024 15:00 -> 20:00
- optimized some routing
- separated admin and user script, because of slight differences inside statements
- changed style
- changed some queries
- changed conditions for rendering
- learned that html forms do not support put requests
- late push due to internet issues

# 20/03/2024 17:00 -> 20:00
- fixed crud issues that have arisen from using html forms.
- PUT now works.
- admin can now reassign task ownership.

# 21/03/2024 18:00 ->
- restructuring API to better comply with REST;

# 25/032/2024 17:30 -> 20:30
- finished user queries;
- fixed bugs due to typos;
- API is now fully functioning;