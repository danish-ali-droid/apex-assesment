import React, { useState, useEffect } from 'react';
import {
  Server,
  Cloud,
  Database,
  ShieldCheck,
  Cpu,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  GitBranch,
  Layers,
  DollarSign,
  Activity,
  HardDrive,
  BookOpen,
  Search,
  UserRound
} from 'lucide-react';
import './App.css';

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [healthUnavailable, setHealthUnavailable] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [showDocTab, setShowDocTab] = useState('dashboard'); // dashboard | security | cost
  const [search, setSearch] = useState('');

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
        setHealthUnavailable(false);
      } else {
        setHealth(null);
        setHealthUnavailable(true);
      }
    } catch {
      setHealth(null);
      setHealthUnavailable(true);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/books');
      const data = await res.json();
      if (res.ok && Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        throw new Error(data.error || 'Failed to load books');
      }
    } catch (err) {
      notify('Failed to load books from API: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchBooks();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim() || !newIsbn.trim()) {
      notify('Title, author, and ISBN are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          author: newAuthor.trim(),
          isbn: newIsbn.trim(),
          genre: newGenre.trim(),
          published_year: newYear === '' ? undefined : Number(newYear)
        })
      });

      const result = await res.json();
      if (res.ok && result.book) {
        setBooks(prev => [result.book, ...prev]);
        setNewTitle('');
        setNewAuthor('');
        setNewIsbn('');
        setNewGenre('');
        setNewYear(new Date().getFullYear());
        notify('Book added to the catalog', 'success');
      } else {
        notify(result.error || 'Failed to add book', 'error');
      }
    } catch (err) {
      notify('Error adding book: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBorrowBook = async (book) => {
    const borrowerName = window.prompt(`Borrow "${book.title}" - enter the borrower's name:`);
    if (!borrowerName?.trim()) return;

    try {
      const res = await fetch(`/api/books/${book.id}/borrow`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borrower_name: borrowerName.trim() })
      });
      const result = await res.json();
      if (res.ok && result.book) {
        setBooks(prev => prev.map(current => current.id === book.id ? result.book : current));
        notify('Book checked out successfully', 'success');
      } else {
        notify(result.error || 'Failed to check out book', 'error');
      }
    } catch (err) {
      notify('Error checking out book: ' + err.message, 'error');
    }
  };

  const handleReturnBook = async (book) => {
    try {
      const res = await fetch(`/api/books/${book.id}/return`, { method: 'PUT' });
      const result = await res.json();
      if (res.ok && result.book) {
        setBooks(prev => prev.map(current => current.id === book.id ? result.book : current));
        notify('Book returned to the library', 'success');
      } else {
        notify(result.error || 'Failed to return book', 'error');
      }
    } catch (err) {
      notify('Error returning book: ' + err.message, 'error');
    }
  };

  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Remove "${book.title}" from the catalog?`)) return;
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (res.ok) {
        setBooks(prev => prev.filter(current => current.id !== book.id));
        notify('Book removed from the catalog', 'info');
      } else {
        notify(result.error || 'Failed to remove book', 'error');
      }
    } catch (err) {
      notify('Error removing book: ' + err.message, 'error');
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesStatus = activeTab === 'All' || book.status === activeTab;
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = !normalizedSearch || [book.title, book.author, book.isbn, book.genre]
      .some(value => value?.toLowerCase().includes(normalizedSearch));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          {notification.msg}
        </div>
      )}

      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <div className="brand-logo">
            <Cloud className="icon-cloud" size={24} />
          </div>
          <div>
            <h1 className="brand-title">LibriCore</h1>
            <p className="brand-subtitle">Cloud Library Management System</p>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            id="tab-dashboard"
            className={`nav-tab ${showDocTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setShowDocTab('dashboard')}
          >
            <Layers size={16} /> Architecture & Items
          </button>
  
        </nav>

        <div className="status-badge-container">
          <div className={`live-pulse ${health ? 'online' : 'offline'}`} />
          <span className="live-status-text">
            {health ? 'API & database online' : healthUnavailable ? 'API unavailable' : 'Connecting...'}
          </span>
          <button
            id="btn-refresh"
            className="btn-icon"
            onClick={() => { setHealthUnavailable(false); fetchHealth(); fetchBooks(); }}
            title="Refresh library and service status"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {showDocTab === 'dashboard' && (
          <>

            {/* Application Data Management (CRUD) */}
            <section className="crud-section">
              <div className="crud-header">
                <div>
                  <h2>Library Catalog</h2>
                  <p className="section-desc">Add books, manage checkouts, and track returns</p>
                </div>
                <div className="filter-tabs">
                  <button
                    className={`filter-btn ${activeTab === 'All' ? 'active' : ''}`}
                    onClick={() => setActiveTab('All')}
                  >
                    All ({books.length})
                  </button>
                  <button
                    className={`filter-btn ${activeTab === 'Available' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Available')}
                  >
                    Available ({books.filter(book => book.status === 'Available').length})
                  </button>
                  <button
                    className={`filter-btn ${activeTab === 'Borrowed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Borrowed')}
                  >
                    Borrowed ({books.filter(book => book.status === 'Borrowed').length})
                  </button>
                </div>
              </div>

              <div className="crud-layout">
                {/* Creation Form */}
                <div className="form-card">
                  <h3 className="form-title">
                    <PlusCircle size={18} /> Add a Book
                  </h3>
                  <form onSubmit={handleAddBook}>
                    <div className="form-group">
                      <label htmlFor="input-title">Title</label>
                      <input
                        id="input-title"
                        type="text"
                        maxLength={255}
                        placeholder="Book title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="input-author">Author</label>
                      <input
                        id="input-author"
                        type="text"
                        maxLength={255}
                        placeholder="Author name"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="input-isbn">ISBN</label>
                      <input
                        id="input-isbn"
                        type="text"
                        maxLength={50}
                        placeholder="ISBN"
                        value={newIsbn}
                        onChange={(e) => setNewIsbn(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="input-genre">Genre</label>
                      <input
                        id="input-genre"
                        type="text"
                        maxLength={100}
                        placeholder="General"
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="input-year">Published year</label>
                      <input
                        id="input-year"
                        type="number"
                        min="0"
                        max={new Date().getFullYear()}
                        value={newYear}
                        onChange={(e) => setNewYear(e.target.value)}
                      />
                    </div>

                    <button
                      id="btn-submit-item"
                      type="submit"
                      className="btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : 'Add Book'}
                    </button>
                  </form>
                </div>

                {/* List of Books */}
                <div className="items-list">
                  <label className="search-field">
                    <Search size={16} aria-hidden="true" />
                    <input
                      type="search"
                      aria-label="Search books"
                      placeholder="Search title, author, ISBN, or genre"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                  {loading && books.length === 0 ? (
                    <div className="loading-state">
                      <RefreshCw size={28} className="spin" />
                      <p>Loading library catalog...</p>
                    </div>
                  ) : filteredBooks.length === 0 ? (
                    <div className="empty-state">
                      <AlertCircle size={32} />
                      <p>No books found for this filter.</p>
                    </div>
                  ) : (
                    filteredBooks.map(book => (
                      <div key={book.id} className="item-card">
                        <div className="item-card-header">
                          <span                           className={`status-pill status-${(book.status || 'Available').toLowerCase()}`}>
                            {book.status}
                          </span>
                          <span className="item-date">{book.published_year || 'Year unknown'}</span>
                        </div>
                        <div className="book-heading">
                          <BookOpen size={18} aria-hidden="true" />
                          <h4 className="item-title">{book.title}</h4>
                        </div>
                        <p className="item-desc">by {book.author}</p>
                        <p className="book-meta"><strong>ISBN:</strong> {book.isbn}</p>
                        <p className="book-meta"><strong>Genre:</strong> {book.genre || 'General'}</p>
                        {book.borrower_name && (
                          <p className="book-borrower"><UserRound size={14} /> Borrowed by {book.borrower_name}</p>
                        )}

                        <div className="item-actions">
                          {book.status === 'Borrowed' ? (
                            <button className="btn-action toggle-btn" onClick={() => handleReturnBook(book)}>
                              <CheckCircle2 size={16} /> Return Book
                            </button>
                          ) : (
                            <button className="btn-action toggle-btn" onClick={() => handleBorrowBook(book)}>
                              <UserRound size={16} /> Borrow Book
                            </button>
                          )}
                          <button
                            className="btn-action delete-btn"
                            onClick={() => handleDeleteBook(book)}
                            title="Remove book"
                            aria-label={`Remove ${book.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Security & Secrets Tab */}
        {showDocTab === 'security' && (
          <section className="doc-section">
            <div className="doc-header">
              <h2>Security Architecture, Secrets Handling & Least Privilege</h2>
              <p>Built-in security governance for cloud deployments and CI/CD pipelines</p>
            </div>

            <div className="security-grid">
              <div className="doc-card">
                <div className="doc-card-title">
                  <ShieldCheck size={20} className="icon-sec" />
                  <h3>1. Secrets Handling</h3>
                </div>
                <ul>
                  <li><strong>Zero Hardcoded Credentials:</strong> All sensitive credentials (DB passwords, AWS keys) are injected at runtime via environment variables.</li>
                  <li><strong>GitHub Secrets Management:</strong> Workflows consume encrypted repository secrets (<code>AWS_ACCESS_KEY_ID</code>, <code>DB_PASSWORD</code>, etc.).</li>
                  <li><strong>Production Pattern (AWS Secrets Manager / SSM):</strong> For multi-environment production, EC2 fetches secrets directly from AWS SSM Parameter Store at boot time.</li>
                  <li><strong>Automated Secret Scanning:</strong> Gitleaks and GitGuardian checks prevent accidental commits of keys and tokens.</li>
                </ul>
              </div>

              <div className="doc-card">
                <div className="doc-card-title">
                  <ShieldCheck size={20} className="icon-sec" />
                  <h3>2. Principle of Least Privilege (PoLP)</h3>
                </div>
                <ul>
                  <li><strong>OIDC Federation:</strong> Replace static, long-lived AWS IAM access keys with GitHub Actions OpenID Connect (OIDC) AssumeRoleWithWebIdentity.</li>
                  <li><strong>EC2 Instance Profile:</strong> EC2 instances use attached IAM role with <code>AmazonSSMManagedInstanceCore</code>. SSH port 22 is disabled to the public.</li>
                  <li><strong>Network Perimeter:</strong> EC2 instances accept HTTP traffic strictly from the Application Load Balancer Security Group.</li>
                  <li><strong>Container User:</strong> Docker images run under non-root unprivileged users (<code>appuser</code>), blocking container escape escalation.</li>
                </ul>
              </div>

              <div className="doc-card">
                <div className="doc-card-title">
                  <ShieldCheck size={20} className="icon-sec" />
                  <h3>3. Dependency & Image Scanning</h3>
                </div>
                <ul>
                  <li><strong>Trivy Vulnerability Scanner:</strong> Integrated into GitHub Actions to scan Docker images for OS and package CVEs before pushing to registry.</li>
                  <li><strong>npm audit in CI:</strong> Fails the build pipeline if High or Critical severity vulnerabilities are detected in npm dependencies.</li>
                  <li><strong>Minimal Base Images:</strong> Built on official <code>alpine</code> images to minimize attack surface and reduce image pull latency.</li>
                  <li><strong>Dependabot Automated Alerts:</strong> Continuous monitoring of upstream dependency security patches.</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Cost Optimization Tab */}
        {showDocTab === 'cost' && (
          <section className="doc-section">
            <div className="doc-header">
              <h2>Cost-Aware Path to Cloud Hosting</h2>
              <p>Practical roadmap from $0/month Free Tier exploration to high-availability production</p>
            </div>

            <div className="cost-table-container">
              <table className="cost-table">
                <thead>
                  <tr>
                    <th>Tier / Phase</th>
                    <th>Architecture</th>
                    <th>Estimated Monthly Cost</th>
                    <th>Pros & Trade-offs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Phase 1: Free Tier / Dev</strong></td>
                    <td>1x EC2 <code>t2.micro</code> (Free tier eligible 750h/mo) + Docker Compose + SQLite or single Postgres</td>
                    <td className="cost-val">$0.00 / mo (within 12-mo free tier)</td>
                    <td>Zero cost, quick setup. Single point of failure, no automated load balancer.</td>
                  </tr>
                  <tr>
                    <td><strong>Phase 2: Hybrid Serverless</strong></td>
                    <td>Frontend on AWS S3 + CloudFront CDN (~$0.50), Backend on AWS App Runner or Lightsail ($5/mo)</td>
                    <td className="cost-val">~$5.50 / mo</td>
                    <td>Global CDN caching, zero EC2 maintenance, automatic SSL certificates.</td>
                  </tr>
                  <tr>
                    <td><strong>Phase 3: Current Diagram (ALB + Multi-AZ EC2)</strong></td>
                    <td>AWS ALB ($16-22/mo LCU) + 2x <code>t2.micro</code> / <code>t3.micro</code> EC2 ($15/mo) + Containerized DB</td>
                    <td className="cost-val">~$32 - $38 / mo</td>
                    <td>High availability, health check failover, zero downtime rolling updates.</td>
                  </tr>
                  <tr>
                    <td><strong>Phase 4: Full Enterprise</strong></td>
                    <td>ALB + Auto Scaling Group + Multi-AZ RDS PostgreSQL + NAT Gateways + CloudWatch</td>
                    <td className="cost-val">~$85 - $120 / mo</td>
                    <td>Enterprise SLA, automated DB backups, autoscaling under heavy traffic.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="cost-tips">
              <h3>Key Cost Optimization Strategies Implemented:</h3>
              <div className="tips-grid">
                <div className="tip-card">
                  <h4>💡 Zero NAT Gateway Expense</h4>
                  <p>NAT Gateways cost $32.40/mo each. By placing EC2 instances in public subnets with secure ALB-only security groups, we eliminate NAT Gateway fees entirely while retaining tight ingress security.</p>
                </div>
                <div className="tip-card">
                  <h4>💡 t2.micro Free Tier Utilization</h4>
                  <p>Instances use <code>t2.micro</code> (1 vCPU, 1 GiB RAM), which qualifies under AWS 12-month Free Tier for 750 hours/month.</p>
                </div>
                <div className="tip-card">
                  <h4>💡 Automated Destruction & Lifecycle</h4>
                  <p>Includes single-command <code>terraform destroy</code> scripts and GitHub Actions teardown triggers to avoid idle cloud billing when tests finish.</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Full-Stack AWS Deployment Architecture • React + Node.js + PostgreSQL + Terraform + Docker + GitHub Actions</p>
      </footer>
    </div>
  );
}
