import { useState } from "react";
import "./App.css";

const initialStudents = [
  { id: 1, name: "Rahul Sharma", email: "rahul@example.com", department: "CSE", year: "3rd Year", status: "Active" },
  { id: 2, name: "Priya Patel", email: "priya@example.com", department: "IT", year: "2nd Year", status: "Active" },
  { id: 3, name: "Aarav Deshmukh", email: "aarav@example.com", department: "ENTC", year: "4th Year", status: "Inactive" },
  { id: 4, name: "Neha Verma", email: "neha@example.com", department: "CSE", year: "1st Year", status: "Active" },
];

const courses = [
  { id: 1, name: "Java Programming", department: "CSE" },
  { id: 2, name: "Web Development", department: "CSE" },
  { id: 3, name: "Database Management", department: "IT" },
  { id: 4, name: "Computer Networks", department: "CSE" },
  { id: 5, name: "Digital Electronics", department: "ENTC" },
];

function App() {
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem("students");
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [activePage, setActivePage] = useState("Dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    year: "",
    status: "Active",
  });

  function saveStudents(updatedStudents) {
    setStudents(updatedStudents);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
  }

  function openAddForm() {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      department: "",
      year: "",
      status: "Active",
    });
    setShowForm(true);
    setMessage("");
  }

  function openEditForm(student) {
    setEditingId(student.id);
    setForm({
      name: student.name,
      email: student.email,
      department: student.department,
      year: student.year,
      status: student.status,
    });
    setShowForm(true);
    setMessage("");
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const duplicateEmail = students.some(
      (student) =>
        student.email.toLowerCase() === form.email.trim().toLowerCase() &&
        student.id !== editingId
    );

    if (duplicateEmail) {
      setMessage("This email address is already registered.");
      return;
    }

    if (editingId !== null) {
      const updatedStudents = students.map((student) =>
        student.id === editingId
          ? {
              ...student,
              ...form,
              name: form.name.trim(),
              email: form.email.trim(),
            }
          : student
      );

      saveStudents(updatedStudents);
      setMessage("Student updated successfully!");
    } else {
      const newStudent = {
        ...form,
        id: Date.now(),
        name: form.name.trim(),
        email: form.email.trim(),
      };

      saveStudents([...students, newStudent]);
      setMessage("Student added successfully!");
    }

    setShowForm(false);
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      department: "",
      year: "",
      status: "Active",
    });
  }

  function deleteStudent(id) {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    saveStudents(students.filter((student) => student.id !== id));
    setMessage("Student deleted successfully!");
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());

    const matchesDepartment =
      departmentFilter === "All" ||
      student.department === departmentFilter;

    const matchesStatus =
      statusFilter === "All" || student.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const activeCount = students.filter(
    (student) => student.status === "Active"
  ).length;

  const departments = [...new Set(students.map((s) => s.department))];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>StudentHub</h2>
            <p>Management Portal</p>
          </div>
        </div>

        <p className="menu-label">MAIN MENU</p>

        <nav className="navigation">
          {["Dashboard", "Students", "Courses", "Settings"].map((page) => (
            <button
              key={page}
              className={`nav-link ${activePage === page ? "active" : ""}`}
              onClick={() => {
                setActivePage(page);
                setShowForm(false);
                setMessage("");
              }}
            >
              <span>
                {{
                  Dashboard: "▦",
                  Students: "♙",
                  Courses: "▤",
                  Settings: "⚙",
                }[page]}
              </span>
              {page}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">ZA</div>
          <div>
            <strong>Admin User</strong>
            <small>Administrator</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Pages / {activePage}</p>
            <h1>{activePage}</h1>
          </div>
          <div className="topbar-badge">Student Administration</div>
        </header>

        {message && (
          <div className="message" role="status">
            {message}
            <button onClick={() => setMessage("")} aria-label="Dismiss message">
              ×
            </button>
          </div>
        )}

        {activePage === "Dashboard" && (
          <>
            <section className="welcome-card">
              <div>
                <p className="eyebrow">OVERVIEW</p>
                <h2>Welcome to your dashboard!</h2>
                <p>Manage students and track your institution's records.</p>
              </div>
              <div className="welcome-icon">🎓</div>
            </section>

            <section className="stats-grid">
              <StatCard label="Total Students" value={students.length} icon="♙" color="blue" />
              <StatCard label="Active Students" value={activeCount} icon="✓" color="green" />
              <StatCard label="Courses" value={courses.length} icon="▤" color="purple" />
              <StatCard label="Departments" value={departments.length} icon="⌂" color="orange" />
            </section>

            <StudentTable
              students={students.slice(0, 5)}
              onEdit={openEditForm}
              onDelete={deleteStudent}
              onViewAll={() => setActivePage("Students")}
              dashboard
            />
          </>
        )}

        {activePage === "Students" && (
          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>Student Directory</h2>
                <p>Manage all student records.</p>
              </div>
              <button className="primary-btn" onClick={openAddForm}>
                + Add Student
              </button>
            </div>

            {showForm && (
              <form className="student-form" onSubmit={handleSubmit}>
                <h3>{editingId !== null ? "Edit Student" : "Add New Student"}</h3>

                <div className="form-grid">
                  <label>
                    Full Name
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                    />
                  </label>

                  <label>
                    Email Address
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                      required
                    />
                  </label>

                  <label>
                    Department
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select department</option>
                      {["CSE", "IT", "ENTC", "MECH", "CIVIL"].map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Academic Year
                    <select
                      name="year"
                      value={form.year}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select year</option>
                      {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Status
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>
                </div>

                <div className="form-actions">
                  <button className="primary-btn" type="submit">
                    {editingId !== null ? "Update Student" : "Save Student"}
                  </button>
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="filters">
              <input
                type="search"
                placeholder="Search by name or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
              >
                <option value="All">All Departments</option>
                {["CSE", "IT", "ENTC", "MECH", "CIVIL"].map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <StudentTable
              students={filteredStudents}
              onEdit={(student) => {
  setActivePage("Students");
  openEditForm(student);
}}
              onDelete={deleteStudent}
            />
          </section>
        )}

        {activePage === "Courses" && (
          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>Available Courses</h2>
                <p>Courses offered by different departments.</p>
              </div>
            </div>

            <div className="course-grid">
              {courses.map((course) => (
                <article className="course-card" key={course.id}>
                  <div className="course-icon">📘</div>
                  <p className="eyebrow">{course.department}</p>
                  <h3>{course.name}</h3>
                  <p>Academic course</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activePage === "Settings" && (
          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>Application Settings</h2>
                <p>Manage basic application information.</p>
              </div>
            </div>

            <div className="settings-row">
              <div>
                <strong>Application Name</strong>
                <p>StudentHub Management Portal</p>
              </div>
              <span className="settings-tag">React + Vite</span>
            </div>

            <div className="settings-row">
              <div>
                <strong>Student Data Storage</strong>
                <p>Student records are saved in this browser.</p>
              </div>
              <span className="settings-tag">Enabled</span>
            </div>

            <div className="settings-row">
              <div>
                <strong>Reset Student Data</strong>
                <p>Restore the original sample student records.</p>
              </div>
              <button
                className="danger-btn"
                onClick={() => {
                  if (window.confirm("Reset all student records?")) {
                    saveStudents(initialStudents);
                    setMessage("Sample student records restored.");
                  }
                }}
              >
                Reset Data
              </button>
            </div>
          </section>
        )}

        <footer className="footer">
          StudentHub © 2026 · Student Management System
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
      </div>
    </article>
  );
}

function StudentTable({ students, onEdit, onDelete, onViewAll, dashboard = false }) {
  return (
    <section className="panel table-panel">
      <div className="section-heading">
        <div>
          <h2>{dashboard ? "Recent Students" : "All Students"}</h2>
          <p>{students.length} student record(s) displayed</p>
        </div>

        {dashboard && (
          <button className="text-btn" onClick={onViewAll}>
            View all →
          </button>
        )}
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>STUDENT</th>
              <th>DEPARTMENT</th>
              <th>YEAR</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">No students found.</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{student.name}</strong>
                        <small>{student.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{student.department}</td>
                  <td>{student.year}</td>
                  <td>
                    <span className={`status ${student.status === "Active" ? "status-active" : "status-inactive"}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                   <div className="action-buttons">
  <button
    type="button"
    className="edit-btn"
    onClick={() => onEdit(student)}
  >
    Edit
  </button>

  <button
    type="button"
    className="delete-btn"
    onClick={() => onDelete(student.id)}
  >
    Delete
  </button>
</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default App;