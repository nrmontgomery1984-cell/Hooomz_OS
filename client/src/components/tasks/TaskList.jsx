import { Card } from '../ui';
import { TaskItem } from './TaskItem';
import { useScopeData } from '../../hooks';

export function TaskList({ tasks, onToggle, onStartTimer, activeTimerTaskId, emptyMessage = 'No tasks yet', projectId, loopId }) {
  const { getCategoryName, getContactNames } = useScopeData(projectId);

  if (!tasks || tasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-400 text-sm">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <Card>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onStartTimer={onStartTimer}
          activeTimerTaskId={activeTimerTaskId}
          categoryName={task.category_code ? getCategoryName(task.category_code) : null}
          location={task.location}
          contactNames={task.contact_ids?.length > 0 ? getContactNames(task.contact_ids) : []}
          projectId={projectId}
          loopId={loopId || task.loop_id}
        />
      ))}
    </Card>
  );
}
