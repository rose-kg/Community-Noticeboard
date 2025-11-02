-- SQL Server table for announcements
CREATE TABLE Announcements (
  id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(255) NOT NULL,
  content NVARCHAR(MAX) NOT NULL,
  category NVARCHAR(50) NOT NULL,
  createdAt NVARCHAR(50) NOT NULL,
  updatedAt NVARCHAR(50) NOT NULL
);
