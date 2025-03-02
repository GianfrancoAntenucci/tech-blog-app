// DOM Element References
const DOM = {
    // Sections
    postsSection: document.getElementById('posts-section'),
    postDetailSection: document.getElementById('post-detail-section'),
    loginSection: document.getElementById('login-section'),
    registerSection: document.getElementById('register-section'),
    postFormSection: document.getElementById('post-form-section'),
    profileSection: document.getElementById('profile-section'),
    
    // Post Elements
    postsContainer: document.getElementById('posts-container'),
    postDetailContainer: document.getElementById('post-detail-container'),
    postActions: document.getElementById('post-actions'),
    userPosts: document.getElementById('user-posts'),
    
    // Forms
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    postForm: document.getElementById('post-form'),
    
    // Form Elements
    postFormTitle: document.getElementById('post-form-title'),
    postIdInput: document.getElementById('post-id'),
    postTitleInput: document.getElementById('post-title'),
    postContentInput: document.getElementById('post-content'),
    
    // Navigation
    navLinks: document.querySelector('.nav-links'),
    homeLink: document.getElementById('home-link'),
    loginLink: document.getElementById('login-link'),
    registerLink: document.getElementById('register-link'),
    createPostLink: document.getElementById('create-post-link'),
    profileLink: document.getElementById('profile-link'),
    logoutLink: document.getElementById('logout-link'),
    
    // Buttons
    editPostBtn: document.getElementById('edit-post-btn'),
    deletePostBtn: document.getElementById('delete-post-btn'),
    backToPostsBtn: document.getElementById('back-to-posts-btn'),
    cancelPostBtn: document.getElementById('cancel-post-btn'),
    toRegisterLink: document.getElementById('to-register-link'),
    toLoginLink: document.getElementById('to-login-link'),
    
    // Other
    notification: document.getElementById('notification'),
    userInfo: document.getElementById('user-info')
  };
  
  // API Base URL
  const API_URL = '/api';
  
  // State Management
  const state = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')) || null
  };
  
  // Notification function - add this at the top of the file
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // API Request Helper
  async function apiRequest(endpoint, options = {}) {
    const baseUrl = '/api';
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (state.token) {
        defaultOptions.headers['Authorization'] = `Bearer ${state.token}`;
    }

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...defaultOptions,
            ...options
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
  }
  
  // Authentication Functions
  async function login(username, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Save authentication state
        state.token = data.token;
        state.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showNotification('Login successful!', 'success');
        window.location.href = '/';
        updateNavigation();
        
        return data;
    } catch (error) {
        showNotification(error.message, 'error');
        throw error;
    }
}
  
  async function register(username, email, password) {
    try {
          const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
          });
          
          return data;
        } catch (error) {
          throw error;
        }
      }

async function createPost(title, content) {
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ title, content })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create post');
        }

        showNotification('Post created successfully!', 'success');
        window.location.href = '/';
        return data;
    } catch (error) {
        console.error('Create post error:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

async function deletePost(postId) {
    try {
        const confirmed = confirm('Are you sure you want to delete this post?');
        if (!confirmed) return;

        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete post');
        }

        showNotification('Post deleted successfully', 'success');
        window.location.href = '/';
        handleRoute(); // Use handleRoute instead of showHomePage
    } catch (error) {
        console.error('Delete error:', error);
        showNotification(error.message, 'error');
    }
}

function showCreatePostForm() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="form-container">
            <h2>Create New Post</h2>
            <form id="create-post-form" class="post-form">
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="content">Content</label>
                    <textarea id="content" name="content" rows="10" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit">Publish Post</button>
                    <a href="/" class="btn-secondary">Cancel</a>
                </div>
            </form>
        </div>
    `;

    document.getElementById('create-post-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        try {
            await createPost(
                form.title.value,
                form.content.value
            );
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    });
}

// Move function declarations outside DOMContentLoaded
async function showPostDetail(postId) {
    try {
        if (!postId) {
            throw new Error('Post ID is required');
        }

        const response = await fetch(`/api/posts/${postId}`, {
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load post');
        }

        const post = await response.json();
        if (!post) {
            throw new Error('Post not found');
        }

        const content = document.getElementById('content');
        const date = new Date(post.created_at);
        const formattedDate = !isNaN(date) ? 
            new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date) : 'Date not available';

        content.innerHTML = `
            <article class="post-detail">
                <h1 class="post-detail-title">${post.title}</h1>
                <div class="post-detail-meta">
                    <span class="author">By ${post.username}</span>
                    <span class="date-separator">•</span>
                    <span class="date">${formattedDate}</span>
                </div>
                <div class="post-detail-content">
                    ${post.content}
                </div>
                ${state.user && post.user_id === state.user.id ? `
                    <div class="post-actions">
                        <button class="btn-edit" data-post-id="${post.id}">Edit Post</button>
                        <button class="btn-delete" data-post-id="${post.id}">Delete Post</button>
                    </div>
                ` : ''}
                <a href="/" class="btn back-btn" id="back-to-posts-btn">Back to Posts</a>
            </article>
        `;

        // Add event listeners after content is rendered
        if (state.user && post.user_id === state.user.id) {
            const editBtn = document.querySelector('.btn-edit');
            const deleteBtn = document.querySelector('.btn-delete');
            
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    const postId = editBtn.dataset.postId;
                    if (postId) editPost(postId);
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    const postId = deleteBtn.dataset.postId;
                    if (postId) deletePost(postId);
                });
            }
        }

        const backBtn = document.getElementById('back-to-posts-btn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.pushState(null, '', '/');
                showHomePage();
            });
        }

    } catch (error) {
        console.error('Error loading post:', error);
        showNotification(error.message, 'error');
        window.location.href = '/';
    }
}

// Move showHomePage function outside DOMContentLoaded as well
function showHomePage() {
    const content = document.getElementById('content');
    if (state.user && state.token) {
        content.innerHTML = `
            <h2>Welcome back${state.user.username ? ', ' + state.user.username : ''}!</h2>
            <div id="posts-container">
                <h3>Recent Posts</h3>
                <div class="posts-grid"></div>
            </div>
        `;
        loadPosts();
    } else {
        content.innerHTML = `
            <h2>Welcome to Tech Blog</h2>
            <p>Share your technical knowledge with the world!</p>
            <div class="auth-buttons">
                <a href="/login" class="btn">Login</a>
                <a href="/register" class="btn">Register</a>
            </div>
        `;
    }
}

// Move this function before DOMContentLoaded
async function loadPosts() {
    try {
        const response = await fetch('/api/posts', {
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load posts');
        }

        const posts = await response.json();
        const postsContainer = document.querySelector('.posts-grid');
        
        if (!posts || posts.length === 0) {
            postsContainer.innerHTML = '<p>No posts yet. Be the first to share!</p>';
            return;
        }

        postsContainer.innerHTML = posts.map(post => {
            const date = new Date(post.created_at);
            const formattedDate = !isNaN(date) ? 
                date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'Date not available';

            return `
                <article class="post-card">
                    <div class="post-content">
                        <h3 class="post-title">${post.title || 'Untitled'}</h3>
                        <div class="post-meta">
                            <span>By ${post.username || 'Anonymous'}</span>
                            <span>• ${formattedDate}</span>
                        </div>
                        <p class="post-excerpt">${
                            post.content ? 
                            (post.content.length > 150 ? 
                                post.content.substring(0, 150) + '...' : 
                                post.content) : 
                            'No content available'
                        }</p>
                        <a href="/post/${post.id}" class="read-more" data-post-id="${post.id}">Read More</a>
                    </div>
                </article>
            `;
        }).join('');

        // Add click handlers for post links
        document.querySelectorAll('.read-more').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const postId = e.target.dataset.postId;
                if (postId) {
                    history.pushState(null, '', `/post/${postId}`);
                    showPostDetail(postId);
                }
            });
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        showNotification('Error loading posts', 'error');
    }
}

async function editPost(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch post');
        }

        const post = await response.json();
        const content = document.getElementById('content');

        content.innerHTML = `
            <div class="form-container edit-post-container">
                <h2>Edit Post</h2>
                <form id="edit-post-form" class="post-form" data-post-id="${postId}">
                    <div class="form-group">
                        <label for="title">Title</label>
                        <input type="text" id="title" name="title" value="${post.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="content">Content</label>
                        <textarea id="content" name="content" rows="10" required>${post.content || ''}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Save Changes</button>
                        <button type="button" class="btn-secondary" data-post-id="${postId}">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        const form = document.getElementById('edit-post-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(e.target);
                const response = await fetch(`/api/posts/${postId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${state.token}`
                    },
                    body: JSON.stringify({
                        title: formData.get('title'),
                        content: formData.get('content')
                    })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update post');
                }

                showNotification('Post updated successfully!', 'success');
                showPostDetail(postId);
            } catch (error) {
                console.error('Update error:', error);
                showNotification(error.message, 'error');
            }
        });

        // Add cancel button handler
        const cancelBtn = form.querySelector('.btn-secondary');
        cancelBtn.addEventListener('click', () => showPostDetail(postId));

    } catch (error) {
        console.error('Edit form error:', error);
        showNotification(error.message, 'error');
        window.location.href = '/';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');

    // Simple router
    function handleRoute() {
        const path = window.location.pathname;
        
        if (path.startsWith('/post/')) {
            const postId = path.split('/')[2];
            showPostDetail(postId);
        } else {
            switch(path) {
                case '/':
                    showHomePage();
                    break;
                case '/login':
                    showLoginForm();
                    break;
                case '/register':
                    showRegisterForm();
                    break;
                case '/create-post':
                    if (!state.token) {
                        showNotification('Please login to create a post', 'error');
                        window.location.href = '/login';
                        return;
                    }
                    showCreatePostForm();
                    break;
                default:
                    showHomePage();
            }
        }
    }

    function showLoginForm() {
        content.innerHTML = `
            <div class="form-container">
                <h2>Login</h2>
                <form id="login-form" class="auth-form">
                    <div class="form-group">
                        <input type="text" name="username" placeholder="Username" required>
                    </div>
                    <div class="form-group">
                        <input type="password" name="password" placeholder="Password" required>
                    </div>
                    <button type="submit">Login</button>
                    <p>Don't have an account? <a href="/register">Register here</a></p>
                </form>
            </div>
        `;

        const form = document.getElementById('login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            try {
                await login(formData.get('username'), formData.get('password'));
            } catch (error) {
                console.error('Login error:', error);
            }
        });
    }

    function showRegisterForm() {
        content.innerHTML = `
            <div class="form-container">
                <h2>Register</h2>
                <form id="register-form" class="auth-form">
                    <input type="text" name="username" placeholder="Username" required>
                    <input type="email" name="email" placeholder="Email" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit">Register</button>
                    <p>Already have an account? <a href="/login">Login here</a></p>
                </form>
            </div>
        `;

        // Add form submission handler
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const email = e.target.email.value;
            const password = e.target.password.value;

            try {
                await register(username, email, password);
                showNotification('Registration successful! Please login.', 'success');
                window.location.href = '/login';  // Redirect to login page
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }

    function showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Force reflow to enable transition
        notification.offsetHeight;
        
        // Add show class for animation
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function updateNavigation() {
        const navLinks = document.getElementById('nav-links');
        if (state.token && state.user) {
            navLinks.innerHTML = `
                <a href="/" class="nav-link">Home</a>
                <a href="/create-post" class="nav-link">Create Post</a>
                <a href="/profile" class="nav-link">Profile</a>
                <a href="#" class="nav-link" id="logout-link">Logout</a>
            `;
            document.getElementById('logout-link').addEventListener('click', logout);
        } else {
            navLinks.innerHTML = `
                <a href="/" class="nav-link">Home</a>
                <a href="/login" class="nav-link">Login</a>
                <a href="/register" class="nav-link">Register</a>
            `;
        }
    }

    function logout() {
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showNotification('Logged out successfully', 'success');
        window.location.href = '/';
        updateNavigation();
    }

    async function loadPosts() {
        try {
            const response = await fetch('/api/posts', {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load posts');
            }
    
            const posts = await response.json();
            const postsContainer = document.querySelector('.posts-grid');
            
            if (!posts || posts.length === 0) {
                postsContainer.innerHTML = '<p>No posts yet. Be the first to share!</p>';
                return;
            }
    
            postsContainer.innerHTML = posts.map(post => {
                const date = new Date(post.created_at);
                const formattedDate = !isNaN(date) ? 
                    date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 'Date not available';
    
                return `
                    <article class="post-card">
                        <div class="post-content">
                            <h3 class="post-title">${post.title || 'Untitled'}</h3>
                            <div class="post-meta">
                                <span>By ${post.username || 'Anonymous'}</span>
                                <span>• ${formattedDate}</span>
                            </div>
                            <p class="post-excerpt">${
                                post.content ? 
                                (post.content.length > 150 ? 
                                    post.content.substring(0, 150) + '...' : 
                                    post.content) : 
                                'No content available'
                            }</p>
                            <a href="/post/${post.id}" class="read-more" data-post-id="${post.id}">Read More</a>
                        </div>
                    </article>
                `;
            }).join('');
    
            // Add click handlers for post links
            document.querySelectorAll('.read-more').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const postId = e.target.dataset.postId;
                    if (postId) {
                        history.pushState(null, '', `/post/${postId}`);
                        showPostDetail(postId);
                    }
                });
            });
        } catch (error) {
            console.error('Error loading posts:', error);
            showNotification('Error loading posts', 'error');
        }
    }

    async function editPost(postId) {
        try {
            // Fetch current post data
            const response = await fetch(`/api/posts/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch post');
            }
    
            const post = await response.json();
            const content = document.getElementById('content');
    
            // Show edit form
            content.innerHTML = `
                <div class="form-container edit-post-container">
                    <h2>Edit Post</h2>
                    <form id="edit-post-form" class="post-form" data-post-id="${postId}">
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" id="title" name="title" value="${post.title || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="content">Content</label>
                            <textarea id="content" name="content" rows="10" required>${post.content || ''}</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Save Changes</button>
                            <button type="button" class="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            `;
    
            // Add form submission handler
            const form = document.getElementById('edit-post-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = new FormData(e.target);
                    const response = await fetch(`/api/posts/${postId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${state.token}`
                        },
                        body: JSON.stringify({
                            title: formData.get('title'),
                            content: formData.get('content')
                        })
                    });
    
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.message || 'Failed to update post');
                    }
    
                    showNotification('Post updated successfully!', 'success');
                    showPostDetail(postId);
                } catch (error) {
                    console.error('Update error:', error);
                    showNotification(error.message, 'error');
                }
            });
    
            // Add cancel button handler
            const cancelBtn = form.querySelector('.btn-secondary');
            cancelBtn.addEventListener('click', () => showPostDetail(postId));
    
        } catch (error) {
            console.error('Edit form error:', error);
            showNotification(error.message, 'error');
            window.location.href = '/';
        }
    }

    // Handle navigation
    window.addEventListener('popstate', handleRoute);
    handleRoute();
    updateNavigation();

    document.addEventListener('click', (e) => {
        if (e.target.matches('a[href^="/"]')) {
            e.preventDefault();
            const path = e.target.getAttribute('href');
            history.pushState(null, '', path);
            handleRoute();
        }
    });

    if (state.token) {
        apiRequest('/auth/profile')
            .then(user => {
                state.user = user;
                updateNavigation();
            })
            .catch(() => {
                state.token = null;
                localStorage.removeItem('token');
                updateNavigation();
            });
    }

    // Add this to your DOMContentLoaded event listener
    document.addEventListener('click', (e) => {
        // Handle cancel button clicks
        if (e.target.classList.contains('btn-secondary')) {
            const postId = e.target.closest('form').dataset.postId;
            if (postId) showPostDetail(postId);
        }
    });
});
