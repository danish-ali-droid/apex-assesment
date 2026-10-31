import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onTaskUpdate }) => {
    if (tasks.length === 0) {
        return <div className="no-tasks">No tasks found. Add some tasks to get started!</div>;
    }

    return (
        <div className="task-list">
            {tasks.map(task => (
                <TaskItem 
                    key={task.id} 
                    task={task} 
                    onTaskUpdate={onTaskUpdate} 
                />
            ))}
        </div>
    );
};

export default TaskList;
