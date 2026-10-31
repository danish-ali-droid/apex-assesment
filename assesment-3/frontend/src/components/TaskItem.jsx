import React from 'react';
import axios from 'axios';

const TaskItem = ({ task, onTaskUpdate }) => {
    const toggleComplete = async () => {
        try {
            await axios.put('http://127.0.0.0:8000/api/tasks.php', {
                ...task,
                status: task.status === 'completed' ? 'pending' : 'completed'
            });
            onTaskUpdate();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/tasks.php?id=${task.id}`);
            onTaskUpdate();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div className={`task-item ${task.status}`}>
            <div className="task-content">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <span className="timestamp">{new Date(task.created_at).toLocaleString()}</span>
            </div>
            <div className="task-actions">
                <button 
                    className={`btn-complete ${task.status === 'completed' ? 'undo' : ''}`}
                    onClick={toggleComplete}
                >
                    {task.status === 'completed' ? 'Undo' : 'Complete'}
                </button>
                <button className="btn-delete" onClick={deleteTask}>Delete</button>
            </div>
        </div>
    );
};

export default TaskItem;
