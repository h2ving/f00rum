INSERT INTO Categories (categoryID, title, description, createdAt)
VALUES (1, 'Technology', 'Discussions about the latest tech trends', '2023-11-02 15:05:34'),
       (2, 'Science', 'Engage in scientific discussions', '2023-11-02 15:05:34'),
       (3, 'Outdoor', 'Conversations about outdoor stuff', '2023-11-02 15:05:34'),
       (4, 'Music', 'Music-related discussions and news', '2023-11-02 15:05:34');


INSERT INTO Threads (threadID, title, content, createdAt, categoryID, userID)
VALUES
    (1, 'Software Development', 'Best practices for software development', '2023-11-02 15:05:34', 1, 2),
    (2, 'Web Design Trends', 'Exploring the latest trends in web design', '2023-11-02 15:05:34', 1, 3),
    (3, 'Mobile App Development', 'Tips for efficient mobile app development', '2023-11-02 15:05:34', 1, 4),
    (4, 'AI in Gaming', 'Applications of AI in gaming industry', '2023-11-02 15:05:34', 1, 5),
    (5, 'Coffee Enthusiasts', 'Share your favorite coffee recipes', '2023-11-02 17:13:48', 2, 6),
    (6, 'Outdoor Activities', 'Best spots for outdoor activities', '2023-11-02 17:13:48', 3, 7),
    (7, 'DIY Crafts', 'Creative DIY craft ideas and tutorials', '2023-11-02 17:13:48', 3, 2),
    (8, 'Photography Tips', 'Improving your photography skills', '2023-11-02 17:13:48', 3, 3),
    (9, 'FLStudio', 'Improving your flstudio skills', '2023-11-02 17:13:48', 4, 4),
    (10, 'Gardening Hacks', 'Smart gardening tips for beginners', '2023-11-02 18:30:00', 3, 5),
    (11, 'Healthy Cooking', 'Recipes for a healthy lifestyle', '2023-11-02 18:45:00', 2, 6),
    (12, 'Fitness Routines', 'Effective workout routines', '2023-11-02 19:00:00', 3, 7),
    (13, 'Travel Destinations', 'Hidden gems to explore', '2023-11-02 19:15:00', 3, 2),
    (14, 'Book Recommendations', 'Share your favorite reads', '2023-11-02 19:30:00', 4, 3);


-- Inserting mock data into Comments table
INSERT INTO Comments (commentID, userID, threadID, content, createdAt)
VALUES
(1, 1, 1, 'Great tips for software development', '2023-11-02 15:15:00'),
(2, 2, 1, 'I found these tips really helpful!', '2023-11-02 15:30:00'),
(3, 1, 3, 'Thanks for sharing this!', '2023-11-02 15:45:00'),
(4, 3, 5, 'Heres my favorite coffee recipe...', '2023-11-02 17:20:00'),
(5, 4, 5, 'Ill definitely try this recipe!', '2023-11-02 17:30:00'),
(6, 1, 3, 'I agree, great content!', '2023-11-02 16:00:00'),
(7, 2, 4, 'Looking forward to more updates!', '2023-11-02 16:30:00'),
(8, 3, 2, 'Nice thread, very informative!', '2023-11-02 17:00:00'),
(9, 4, 1, 'These tips are so helpful, thanks!', '2023-11-02 17:45:00');

INSERT INTO Users (username, password, email, firstName, lastName, age, gender)
VALUES
    ('Karl', 'karl', 'user1@email.com', 'John', 'Doe', 25, 'Male'),
    ('Toomas', 'toomas', 'user2@email.com', 'Toomas', 'Koomas', 22, 'Male'),
    ('Marek', 'marek', 'user3@email.com', 'Marek', 'Weasley', 22, 'Male'),
    ('James', 'james', 'user4@email.com', 'James', 'Frog', 22, 'Male'),
    ('Lisa', 'lisa', 'user5@email.com', 'Lisa', 'Frog', 22, 'Female'),
    ('Anna', '$2a$10$HqjGml/GO7w.9wSqMWpsAOI4gYD0AVPfgngnRRA2HuhNwkW6M9GtG', 'anna@anna.ee', 'Anna', 'Lays', 21, 'Female'),
    ('Jake', '$2a$10$NDXh20rBYEehRL2vM7qB9OZV83ySoeBkOhjceAs3ZIGg4dThMLtvi', 'jake@jake.ee', 'Jake', 'Bing', 24, 'Male');


INSERT INTO Votes (type, userID, threadID, commentID)
VALUES
    ('upvote', 1, 1, NULL),
    ('downvote', 2, 2, NULL),
    ('upvote', 3, NULL, 1),
    ('upvote', 4, NULL, 1),
    ('upvote', 5, NULL, 1),
    ('downvote', 6, NULL, 1),
    ('downvote', 7, NULL, 1);

INSERT INTO ChatMessages (senderID, receiverID, message, createdAt) VALUES
        (7, 6, 'Hi Anna, Hows it going?', '2023-11-23 08:43:54'),
        (6, 7, 'Hey Jake, great!', '2023-11-23 08:44:34'),
        (7, 6, 'Glad to hear!', '2023-11-23 08:44:50'),

        (6, 5, 'Hello there!', '2023-11-23 09:00:00'),
        (5, 6, 'Hi, how are you?', '2023-11-23 09:05:00'),
        (6, 5, 'I am doing well, thanks!', '2023-11-23 09:10:00'),

        (1, 2, 'Hello!', '2023-11-23 10:00:00'),
        (2, 1, 'Hi!', '2023-11-23 10:05:00'),
        -- ...
        (6, 7, 'How are you today?', '2023-11-23 11:00:00'),
        (7, 6, 'I am doing great, thank you!', '2023-11-23 11:05:00'),

        (5, 3, 'Hey, what''s up?', '2023-11-23 15:00:00'),
        (3, 5, 'Not much, just chilling.', '2023-11-23 15:05:00'),
        -- Conversation between User 3 and User 4
        (3, 4, 'Howdy!', '2023-11-23 11:00:00'),
        (4, 3, 'Hey!', '2023-11-23 11:05:00'),

        -- A lot more messages between various user pairs
        -- ...

        (5, 2, 'Hey, what are you doing?', '2023-11-23 15:00:00'),
        (2, 5, 'Just working on some stuff.', '2023-11-23 15:05:00'),

        (1, 4, 'Long time no see!', '2023-11-23 16:00:00'),
        (4, 1, 'I know! Been busy lately.', '2023-11-23 16:05:00'),

        (6, 2, 'Are you free tomorrow?', '2023-11-23 19:00:00'),
        (2, 6, 'Yes, let''s catch up!', '2023-11-23 19:05:00'),

        (7, 3, 'How was your weekend?', '2023-11-23 20:00:00'),
        (3, 7, 'It was fantastic!', '2023-11-23 20:05:00'),
        (1, 7, 'Hey there!', '2023-11-23 08:00:00'),
        (7, 1, 'Hi! How are you?', '2023-11-23 08:05:00'),
        (1, 7, 'I''m good, thanks!', '2023-11-23 08:10:00'),
        (7, 1, 'That''s great!', '2023-11-23 08:15:00'),

        (1, 6, 'Hello!', '2023-11-23 09:00:00'),
        (6, 1, 'Hi there!', '2023-11-23 09:05:00'),
        (1, 6, 'How have you been?', '2023-11-23 09:10:00'),
        (6, 1, 'Pretty good, thanks!', '2023-11-23 09:15:00');


