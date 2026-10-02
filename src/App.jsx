import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Clock3,
  CheckCircle2,
  Plus,
  Search,
  Bell,
  User,
  LogOut,
  MoreHorizontal,
  CalendarDays,
  Pencil,
  Trash2,
  X,
  Menu,
} from "lucide-react";

import "./index.css";

const API_URL = "http://localhost:5000";

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("taskflow_token")
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("taskflow_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleAuthSuccess = (data) => {
    localStorage.setItem("taskflow_token", data.token);
    localStorage.setItem(
      "taskflow_user",
      JSON.stringify(data.user)
    );

    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");

    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return (
      <AuthScreen
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <Dashboard
      token={token}
      user={user}
      onLogout={handleLogout}
    />
  );
}

/* =========================
   AUTH SCREEN
========================= */

function AuthScreen({ onAuthSuccess }) {
  const [showRegister, setShowRegister] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint = showRegister
        ? "/api/auth/register"
        : "/api/auth/login";

      const body = showRegister
        ? {
            name,
            email,
            password,
          }
        : {
            email,
            password,
          };

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Authentication failed"
        );
      }

      onAuthSuccess(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand-large">
          <div className="brand-icon">T</div>
          <span>TaskFlow</span>
        </div>

        <div className="auth-hero">
          <p className="eyebrow">
            SMART TASK MANAGEMENT
          </p>

          <h1>
            Organize work.
            <br />
            <span>Achieve more.</span>
          </h1>

          <p className="hero-description">
            A modern task management workspace designed
            to help individuals and teams plan, organize,
            and complete their work efficiently.
          </p>

          <div className="hero-features">
            <div>
              <CheckCircle2 size={18} />
              <span>Secure user authentication</span>
            </div>

            <div>
              <CheckCircle2 size={18} />
              <span>Complete task management</span>
            </div>

            <div>
              <CheckCircle2 size={18} />
              <span>Dynamic API-based workspace</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="mobile-brand">
            TaskFlow
          </div>

          <h2>
            {showRegister
              ? "Create your account"
              : "Welcome back"}
          </h2>

          <p className="auth-subtitle">
            {showRegister
              ? "Start organizing your work today."
              : "Sign in to continue to your workspace."}
          </p>

          {error && (
            <div
              style={{
                padding: "11px 13px",
                marginBottom: "16px",
                borderRadius: "9px",
                background: "rgba(239,68,68,0.10)",
                border:
                  "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {showRegister && (
              <div className="input-group">
                <label>Full name</label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label>Email address</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                minLength={6}
              />
            </div>

            {!showRegister && (
              <div className="form-options">
                <label className="remember">
                  <input type="checkbox" />
                  Remember me
                </label>

                <button
                  type="button"
                  className="forgot"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              className="primary-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : showRegister
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          <div className="auth-switch">
            {showRegister
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              onClick={() => {
                setShowRegister(!showRegister);
                setError("");
              }}
              type="button"
            >
              {showRegister
                ? "Sign in"
                : "Create account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({
  token,
  user,
  onLogout,
}) {
  const [tasks, setTasks] = useState([]);

  const [activeMenu, setActiveMenu] =
    useState("Dashboard");

  const [showModal, setShowModal] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState(null);

  const [showProfile, setShowProfile] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  /* =========================
     LOAD TASKS FROM API
  ========================= */

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/tasks`,
        {
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load tasks"
        );
      }

      setTasks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  /* =========================
     TASK COUNTS
  ========================= */

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const pending = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  /* =========================
     SEARCH + FILTER
  ========================= */

  const filteredTasks = tasks.filter((task) => {
    const searchText =
      search.toLowerCase();

    const matchesSearch =
      task.title
        .toLowerCase()
        .includes(searchText) ||
      task.description
        .toLowerCase()
        .includes(searchText);

    const matchesFilter =
      filter === "All" ||
      task.status === filter;

    return (
      matchesSearch &&
      matchesFilter
    );
  });

  /* =========================
     CREATE / UPDATE
  ========================= */

  const saveTask = async (taskData) => {
    try {
      setError("");

      const isEditing =
        Boolean(editingTask);

      const url = isEditing
        ? `${API_URL}/api/tasks/${editingTask.id}`
        : `${API_URL}/api/tasks`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: authHeaders,
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save task"
        );
      }

      if (isEditing) {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === editingTask.id
              ? data.task
              : task
          )
        );
      } else {
        setTasks((currentTasks) => [
          ...currentTasks,
          data.task,
        ]);
      }

      setShowModal(false);
      setEditingTask(null);
    } catch (error) {
      setError(error.message);
    }
  };

  /* =========================
     DELETE
  ========================= */

  const deleteTask = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/tasks/${id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete task"
        );
      }

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== id
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  /* =========================
     COMPLETE / STATUS
  ========================= */

  const toggleComplete = async (task) => {
    const newStatus =
      task.status === "Completed"
        ? "In Progress"
        : "Completed";

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/tasks/${task.id}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update task"
        );
      }

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === task.id
            ? data.task
            : item
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const currentDate = new Date();

  const greeting =
    currentDate.getHours() < 12
      ? "Good morning"
      : currentDate.getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  const formattedDate = currentDate
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon small">
            T
          </div>

          <span>TaskFlow</span>
        </div>

        <div className="workspace">
          <div className="workspace-avatar">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <strong>
              {user.name}'s Workspace
            </strong>

            <span>
              Personal workspace
            </span>
          </div>
        </div>

        <nav>
          <p className="nav-label">
            WORKSPACE
          </p>

          <button
            className={
              activeMenu === "Dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setActiveMenu("Dashboard");
              setFilter("All");
              setSidebarOpen(false);
            }}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            className={
              activeMenu === "Tasks"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setActiveMenu("Tasks");
              setFilter("All");
              setSidebarOpen(false);
            }}
          >
            <CheckSquare size={18} />
            My Tasks

            <span className="nav-count">
              {tasks.length}
            </span>
          </button>

          <button
            className="nav-item"
            onClick={() => {
              setFilter("In Progress");
              setActiveMenu("Tasks");
              setSidebarOpen(false);
            }}
          >
            <Clock3 size={18} />
            In Progress
          </button>

          <button
            className="nav-item"
            onClick={() => {
              setFilter("Completed");
              setActiveMenu("Tasks");
              setSidebarOpen(false);
            }}
          >
            <CheckCircle2 size={18} />
            Completed
          </button>

          <p className="nav-label second">
            ACCOUNT
          </p>

          <button
            className={
              showProfile
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              setShowProfile(true);
              setSidebarOpen(false);
            }}
          >
            <User size={18} />
            Profile
          </button>

          <button
            className="nav-item logout"
            onClick={onLogout}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="profile-mini">
            <div className="profile-avatar">
              {user.name
                ?.split(" ")
                .map((word) =>
                  word.charAt(0)
                )
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user.name}
              </strong>

              <span>
                {user.role || "User"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
          >
            <Menu size={22} />
          </button>

          <div>
            <p className="topbar-date">
              {formattedDate}
            </p>

            <h1>
              {greeting},{" "}
              {user.name?.split(" ")[0]} 👋
            </h1>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} />

              <input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <button className="icon-btn">
              <Bell size={19} />
              <span className="notification-dot"></span>
            </button>

            <button
              className="top-avatar"
              onClick={() =>
                setShowProfile(true)
              }
            >
              {user.name
                ?.split(" ")
                .map((word) =>
                  word.charAt(0)
                )
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </button>
          </div>
        </header>

        <section className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                YOUR WORKSPACE
              </p>

              <h2>
                Task Overview
              </h2>

              <p>
                Track your work and stay on top
                of your priorities.
              </p>
            </div>

            <button
              className="add-task-btn"
              onClick={() => {
                setEditingTask(null);
                setShowModal(true);
              }}
            >
              <Plus size={18} />
              New Task
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                marginBottom: "18px",
                borderRadius: "10px",
                background:
                  "rgba(239,68,68,0.10)",
                border:
                  "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          <div className="stats-grid">
            <StatCard
              title="Total Tasks"
              value={tasks.length}
              icon={
                <CheckSquare size={21} />
              }
              text="All tasks"
            />

            <StatCard
              title="In Progress"
              value={inProgress}
              icon={<Clock3 size={21} />}
              text="Currently working"
            />

            <StatCard
              title="Completed"
              value={completed}
              icon={
                <CheckCircle2 size={21} />
              }
              text="Successfully done"
            />

            <StatCard
              title="Pending"
              value={pending}
              icon={
                <CalendarDays size={21} />
              }
              text="Need attention"
            />
          </div>

          <section className="tasks-section">
            <div className="section-header">
              <div>
                <h3>
                  My Tasks
                </h3>

                <p>
                  Manage and organize your
                  current workload.
                </p>
              </div>

              <div className="filter-tabs">
                {[
                  "All",
                  "Pending",
                  "In Progress",
                  "Completed",
                ].map((item) => (
                  <button
                    key={item}
                    className={
                      filter === item
                        ? "filter active"
                        : "filter"
                    }
                    onClick={() =>
                      setFilter(item)
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="task-list">
              {loading ? (
                <div className="empty-state">
                  <CheckSquare size={40} />

                  <h3>
                    Loading tasks...
                  </h3>

                  <p>
                    Getting your tasks from the
                    TaskFlow API.
                  </p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <CheckSquare size={40} />

                  <h3>
                    No tasks found
                  </h3>

                  <p>
                    Create your first task to get
                    started.
                  </p>

                  <button
                    className="primary-btn"
                    onClick={() => {
                      setEditingTask(null);
                      setShowModal(true);
                    }}
                  >
                    <Plus size={17} />
                    Create Task
                  </button>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => {
                      setEditingTask(task);
                      setShowModal(true);
                    }}
                    onDelete={() =>
                      deleteTask(task.id)
                    }
                    onComplete={() =>
                      toggleComplete(task)
                    }
                  />
                ))
              )}
            </div>
          </section>
        </section>
      </main>

      {/* TASK MODAL */}

      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSave={saveTask}
        />
      )}

      {/* PROFILE */}

      {showProfile && (
        <div
          onClick={() =>
            setShowProfile(false)
          }
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#0b1220",
              color: "#f8fafc",
              border:
                "1px solid rgba(255,255,255,0.10)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow:
                "0 25px 80px rgba(0,0,0,0.55)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "25px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 7px",
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                    color: "#60a5fa",
                  }}
                >
                  ACCOUNT
                </p>

                <h2
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: "25px",
                    fontWeight: "700",
                  }}
                >
                  My Profile
                </h2>
              </div>

              <button
                onClick={() =>
                  setShowProfile(false)
                }
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  border:
                    "1px solid rgba(255,255,255,0.10)",
                  background:
                    "rgba(255,255,255,0.06)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={19} />
              </button>
            </div>

            <div
              style={{
                textAlign: "center",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  margin: "0 auto 15px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #2563eb, #7c3aed)",
                  color: "#ffffff",
                  fontSize: "26px",
                  fontWeight: "800",
                }}
              >
                {user.name
                  ?.split(" ")
                  .map((word) =>
                    word.charAt(0)
                  )
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <h3
                style={{
                  margin: "0 0 6px",
                  color: "#ffffff",
                  fontSize: "22px",
                  fontWeight: "700",
                }}
              >
                {user.name}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "14px",
                }}
              >
                {user.role || "User"}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              <ProfileRow
                label="Full Name"
                value={user.name}
              />

              <ProfileRow
                label="Email"
                value={user.email}
              />

              <ProfileRow
                label="Workspace"
                value={`${user.name}'s Workspace`}
              />

              <ProfileRow
                label="Account Type"
                value="Personal Workspace"
              />

              <ProfileRow
                label="Authorization"
                value="Authenticated User"
              />
            </div>

            <button
              onClick={() =>
                setShowProfile(false)
              }
              style={{
                width: "100%",
                marginTop: "22px",
                padding: "13px 18px",
                border: "none",
                borderRadius: "10px",
                background:
                  "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   PROFILE ROW
========================= */

function ProfileRow({
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "12px",
        background: "#111827",
        border:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "11px",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.7px",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#f8fafc",
          fontSize: "14px",
          fontWeight: "600",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  title,
  value,
  icon,
  text,
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon">
          {icon}
        </div>
      </div>

      <p>{title}</p>
      <h3>{value}</h3>
      <span>{text}</span>
    </div>
  );
}

/* =========================
   TASK CARD
========================= */

function TaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
}) {
  return (
    <article className="task-card">
      <div
        className={
          task.status === "Completed"
            ? "task-check completed"
            : "task-check"
        }
        onClick={onComplete}
      >
        {task.status === "Completed" && (
          <CheckCircle2 size={18} />
        )}
      </div>

      <div className="task-main">
        <div className="task-title-row">
          <h4
            className={
              task.status === "Completed"
                ? "done"
                : ""
            }
          >
            {task.title}
          </h4>

          <span
            className={`priority ${(
              task.priority || "Medium"
            ).toLowerCase()}`}
          >
            {task.priority}
          </span>
        </div>

        <p>
          {task.description}
        </p>

        <div className="task-meta">
          <span>
            <CalendarDays size={14} />
            Due {task.dueDate}
          </span>

          <span
            className={`status ${(
              task.status || "Pending"
            )
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {task.status}
          </span>
        </div>
      </div>

      <div className="task-actions">
        <button
          onClick={onEdit}
          title="Edit task"
        >
          <Pencil size={17} />
        </button>

        <button
          onClick={onDelete}
          title="Delete task"
        >
          <Trash2 size={17} />
        </button>

        <button title="More options">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </article>
  );
}

/* =========================
   TASK MODAL
========================= */

function TaskModal({
  task,
  onClose,
  onSave,
}) {
  const [title, setTitle] =
    useState(task?.title || "");

  const [description, setDescription] =
    useState(task?.description || "");

  const [priority, setPriority] =
    useState(task?.priority || "Medium");

  const [status, setStatus] =
    useState(task?.status || "Pending");

  const [dueDate, setDueDate] =
    useState(
      task?.dueDate || "2026-10-05"
    );

  const submit = (e) => {
    e.preventDefault();

    onSave({
      title,
      description,
      priority,
      status,
      dueDate,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {task
                ? "UPDATE TASK"
                : "NEW TASK"}
            </p>

            <h2>
              {task
                ? "Edit task"
                : "Create a new task"}
            </h2>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="input-group">
            <label>
              Task title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. Complete project documentation"
              required
            />
          </div>

          <div className="input-group">
            <label>
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe what needs to be completed..."
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="input-group">
              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>
              Due date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(e) =>
                setDueDate(e.target.value)
              }
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
            >
              {task
                ? "Save Changes"
                : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;