
const announcements = [
  {
    id: "1",
    title: "Welcome to the Community Noticeboard",
    content:
      "This is your central place for community announcements, events, job opportunities, and important alerts. Check back regularly for updates!",
    category: "General",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Community Clean-Up Day",
    content:
      "Join us this Saturday at 9 AM for our monthly community clean-up. Meet at the town square. Bring gloves and enthusiasm!",
    category: "Events",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Local Cafe Hiring",
    content:
      "Main Street Cafe is looking for part-time baristas. Experience preferred but not required. Contact them directly for more information.",
    category: "Jobs",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getAllAnnouncements() {
  return announcements.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getAnnouncementById(id) {
  return announcements.find((a) => a.id === id);
}

function createAnnouncement(data) {
  const newAnnouncement = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  announcements.push(newAnnouncement);
  return newAnnouncement;
}

function updateAnnouncement(id, data) {
  const index = announcements.findIndex((a) => a.id === id);
  if (index === -1) return null;
  announcements[index] = {
    ...announcements[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return announcements[index];
}

function deleteAnnouncement(id) {
  const index = announcements.findIndex((a) => a.id === id);
  if (index === -1) return false;
  announcements.splice(index, 1);
  return true;
}
