# Test-App

## Initial Setup

Install the necessary packages

```
npm install
```
## Run the Server
```
npm start
```
or
```
DB_URL='postgres://username:password@host:port/db' npm start
```

## Run the tests
```
npm test
```

## API Endpoints

#### GET /topActiveUsers?page={pageNumber}

Returns user info, count of applications in the last week and the names of the 3 latest applied listings.

+ Response 200 (application/json)

    + Body

            [
            	{
            		id: {users.id},
            		createdAt: {users.created_at},
            		name: {users.name},
            		count: {count of applications in the past week's time}
            		listings: [
            			{listings.name},
            			{listings.name},
            			{listings.name}
            		]
            	},
            	...
            ]
            

## Implementation

1. Query the applications TABLE to get the COUNT of applications per user for last 7 days.
2. Join the Count Table with the USER Table with ORDER number of applications sent and LIMIT of 5.
3. Use the array of Active Users to get the listing name for each user from the Listings Table with the latest values and a LIMIT of 3.

NOTE: Used array of promises to wait for the result of the queries. 

#### GET /users?id={user.id}

Takes user id and returns:

1. user info;
2. connected companies;
3. listings created by the user;
4. applications the user has made with the info of the listing the application is made to.



+ Response 200 (application/json)

    + Body

            {
            	id: {users.id},
            	name: {users.name},
            	createdAt: {users.created_at},
            	companies: [
            		{
            			id: {companies.id},
            			createdAt: {companies.created_at},
            			name: {companies.name},
            			isContact: {is user a contact_user for the company? boolean.}
            		},
            		...
            	],
            	createdListings: [
            		{
            			id: {listings.id},
            			createdAt: {listings.created_at},
            			name: {listings.name},
            			description: {listings.description}
            		},
            		...
            	],
            	applications: [
            		{
            			id: {applications.id},
            			createdAt: {applications.created_at},
            			listing: {
            				id: {listings.id},
            				name: {listings.name},
            				description: {listings.description}
            			},
            			coverLetter: {applications.cover_letter}
            		},
            		...
            	]
            }
            


## Implementation

1. Query the User TABLE to get the user profile details.
2. Join the Companies Table with the Teams Table along with filter for current user.
3. Query the Listings Table to fetch the listings by current user.
4. Join the Application Table with Listings Table to list the current user applications.
