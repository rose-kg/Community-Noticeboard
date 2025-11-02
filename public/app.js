
const postForm = document.getElementById('post-form');
const postsDiv = document.getElementById('posts');
const filterSelect = document.getElementById('filter');

let posts = JSON.parse(localStorage.getItem('posts') || '[]');
let editIndex = null;

function renderPosts() {
  const filter = filterSelect.value;
  postsDiv.innerHTML = '';
  posts
    .filter(post => filter === 'All' || post.category === filter)
    .forEach((post, idx) => {
      const postEl = document.createElement('div');
      postEl.className = 'post';
      postEl.innerHTML = `
        <div class="category">${post.category}</div>
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <div class="actions">
          <button onclick="editPost(${idx})">Edit</button>
          <button onclick="deletePost(${idx})">Delete</button>
        </div>
      `;
      postsDiv.appendChild(postEl);
    });
}

postForm.onsubmit = function(e) {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();
  const category = document.getElementById('category').value;
  if (editIndex !== null) {
    posts[editIndex] = { title, content, category };
    editIndex = null;
    postForm.querySelector('button[type="submit"]').textContent = 'Post';
  } else {
    posts.unshift({ title, content, category });
  }
  localStorage.setItem('posts', JSON.stringify(posts));
  postForm.reset();
  renderPosts();
};

window.editPost = function(idx) {
  const post = posts[idx];
  document.getElementById('title').value = post.title;
  document.getElementById('content').value = post.content;
  document.getElementById('category').value = post.category;
  editIndex = idx;
  postForm.querySelector('button[type="submit"]').textContent = 'Update';
};

window.deletePost = function(idx) {
  if (confirm('Delete this post?')) {
    posts.splice(idx, 1);
    localStorage.setItem('posts', JSON.stringify(posts));
    renderPosts();
  }
};

filterSelect.onchange = renderPosts;

renderPosts();
