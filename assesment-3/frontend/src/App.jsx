import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import './App.css';

function App() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://127.0.0.0:8000/api/tasks.php');
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="app-container">
            <header>
                <h1>Task Manager</h1>
                <p>Stay organized and productive</p>
            </header>
            <main>
                <section className="form-section">
                    <TaskForm onTaskAdded={fetchTasks} />
                </section>
                <section className="list-section">
                    <h2>Your Tasks</h2>
                    {loading ? (
                        <div className="loader">Loading tasks...</div>
                    ) : (
                        <TaskList tasks={tasks} onTaskUpdate={fetchTasks} />
                    )}
                </section>
            </main>
            <footer>
                <p>&copy; 2026 Premium Task App. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default App;
