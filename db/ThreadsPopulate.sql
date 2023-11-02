INSERT INTO Categories (categoryID, title, description, createdAt)
VALUES (1, 'Technology', 'Discussions about the latest tech trends', '2023-11-02 15:05:34'),
       (2, 'Science', 'Engage in scientific discussions', '2023-11-02 15:05:34'),
       (3, 'Outdoor', 'Conversations about outdoor stuff', '2023-11-02 15:05:34'),
       (4, 'Music', 'Music-related discussions and news', '2023-11-02 15:05:34');


INSERT INTO Threads (threadID, title, content, createdAt, categoryID, userID)
VALUES 
(1, 'Software Development', 'Best practices for software development', '2023-11-02 15:05:34', 1, 1),
(2, 'Web Design Trends', 'Exploring the latest trends in web design', '2023-11-02 15:05:34', 1, 1),
(3, 'Mobile App Development', 'Tips for efficient mobile app development', '2023-11-02 15:05:34', 1, 1),
(4, 'AI in Gaming', 'Applications of AI in gaming industry', '2023-11-02 15:05:34', 1, 1),
(5, 'Coffee Enthusiasts', 'Share your favorite coffee recipes', '2023-11-02 17:13:48', 2, 1),
(6, 'Outdoor Activities', 'Best spots for outdoor activities', '2023-11-02 17:13:48', 3, 1),
(7, 'DIY Crafts', 'Creative DIY craft ideas and tutorials', '2023-11-02 17:13:48', 3, 1),
(8, 'Photography Tips', 'Improving your photography skills', '2023-11-02 17:13:48', 3, 1),
(9, 'FLStudio', 'Improving your flstudio skills', '2023-11-02 17:13:48', 4, 1);
