CREATE TABLE IF NOT EXISTS `Users` (
		`userID` INTEGER PRIMARY KEY AUTOINCREMENT,
		`username` TEXT NOT NULL UNIQUE,
		`password` TEXT NOT NULL,
        `email` TEXT NOT NULL UNIQUE,
        `firstName` TEXT NOT NULL,
        `lastName` TEXT NOT NULL,
        `age` INTEGER NOT NULL,
        `gender` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `Categories` (
		`categoryID` INTEGER PRIMARY KEY AUTOINCREMENT,
		`title` TEXT NOT NULL UNIQUE,
		`description` TEXT NOT NULL UNIQUE,
		`createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `Posts` (
		`postID` INTEGER PRIMARY KEY AUTOINCREMENT,
		`userID` INTEGER NOT NULL,
		`title` TEXT NOT NULL,
		`content` TEXT NOT NULL,
		`createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
        `categoryID` TEXT NOT NULL,
		FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
		FOREIGN KEY (categoryID) REFERENCES Categories(categoryID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `Comments` (
    `commentID` INTEGER PRIMARY KEY AUTOINCREMENT,
	`userID` INTEGER NOT NULL,
	`postID` INTEGER NOT NULL,
	`content` TEXT NOT NULL,
	`createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
	FOREIGN KEY (postID) REFERENCES Posts(postID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS 'PrivateMessages' (
    'messageID' INTEGER PRIMARY KEY AUTOINCREMENT,
    'senderID' INTEGER NOT NULL,
    'receiverID' INTEGER NOT NULL,
    'content' TEXT NOT NULL,
    'createdAt' DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderID) REFERENCES Users(userID),
    FOREIGN KEY (receiverID) REFERENCES Users(userID)
);

CREATE TABLE IF NOT EXISTS `Sessions` (
                                          `sessionID` TEXT PRIMARY KEY,
                                          `userID` INTEGER UNIQUE NOT NULL,
                                          `expiresAt` TIMESTAMP,
                                          FOREIGN KEY(userID) REFERENCES Users(userID) ON DELETE CASCADE
);


