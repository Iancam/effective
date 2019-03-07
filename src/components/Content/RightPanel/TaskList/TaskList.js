import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { rpUpdateTaskListFilter, rpShowTaskDetails } from '../../../../actions';
import TaskDetailsTopbar from '../TaskDetails/TaskDetailsTopbar';
import FaTimes from 'react-icons/lib/fa/times-circle';
import Select from 'react-select';
import './TaskList.css';
import { uniqBy } from 'lodash';
import FilterSelector from './FilterSelector';

const PREFIX_TO_FIELD = {
  'due:': 'due_date',
  '@': 'assigned_to',
  'status:': 'status'
};

class TaskList extends Component {
  getMatchingTasks = () => {
    const {
      currentPursuanceId,
      tasks: { taskMap }
    } = this.props;

    // TODO: Make more efficient (only bother passing in tasks from
    // this pursuance, not all of taskMap)
    const taskMatches = this.taskMatches(taskMap);

    const tasksArr = [];
    let task;
    for (let gid in taskMap) {
      task = taskMap[gid];
      if (
        task.pursuance_id === currentPursuanceId ||
        task.assigned_to_pursuance_id === currentPursuanceId
      ) {
        if (taskMatches[gid]) {
          tasksArr.push(task);
        }
      }
    }

    tasksArr.sort((t1, t2) => {
      if (t1.due_date && !t2.due_date) {
        return -1000000;
      }
      if (t2.due_date && !t1.due_date) {
        return 1000000;
      }
      t1.due_date_parsed = t1.due_date_parsed || new Date(t1.due_date);
      t2.due_date_parsed = t2.due_date_parsed || new Date(t2.due_date);
      return t1.due_date_parsed - t2.due_date_parsed;
    });
    return tasksArr;
  };

  afterColon = field => {
    return field.split(/:/, 2)[1];
  };

  parseTaskListFilter = () => {
    const {
      rightPanel: { taskListFilter }
    } = this.props;
    const {
      user: { username }
    } = this.props;
    const parsed = {
      title: '',
      assigned_to: [],
      dueBefore: [],
      due_date: [],
      dueAfter: [],
      status: [],
      statusNot: []
    };
    const fields = taskListFilter.split(/ /g);
    let field;
    for (let i in fields) {
      field = fields[i];
      if (field === '') {
        continue;
      }
      if (field.startsWith('@')) {
        const assigned_to = field.slice(1);
        if (assigned_to === 'me') {
          parsed.assigned_to.push(username);
        } else {
          parsed.assigned_to.push(assigned_to);
        }
      } else if (field.startsWith('<')) {
        parsed.dueBefore.push(field.slice(1));
      } else if (field.startsWith('due:') || field.startsWith('d:')) {
        const due = this.afterColon(field);
        if (due.startsWith('<')) {
          parsed.dueBefore.push(due.slice(1));
        } else if (due.startsWith('>')) {
          parsed.dueAfter.push(due.slice(1));
        } else {
          parsed.due_date.push(due);
        }
      } else if (field.startsWith('>')) {
        parsed.dueAfter.push(field.slice(1));
      } else if (
        field.startsWith('status:') ||
        field.startsWith('st:') ||
        field.startsWith('s:')
      ) {
        const status = this.afterColon(field);
        if (status.startsWith('!')) {
          parsed.statusNot.push(status.slice(1));
        } else {
          parsed.status.push(status);
        }
      } else {
        if (parsed.title !== '') {
          parsed.title += ' ';
        }
        parsed.title += field;
      }
    }
    return parsed;
  };

  taskMatches = tasks => {
    const { taskListFilter } = this.props.rightPanel;
    const taskListFilterTrimmed = taskListFilter.trim();
    const filters = this.parseTaskListFilter();
    const matches = {};
    let task;
    let status;
    let statusNot;
    let assigned_to;
    let dueBefore;
    let due_date;
    let dueAfter;
    gidInTasks: for (let gid in tasks) {
      if (taskListFilterTrimmed === '') {
        matches[gid] = true;
        continue;
      }
      task = tasks[gid];

      let matchStatus = false;
      let matchAssignedTo = false;
      let matchDueDate = false;
      let matchTitle = false;

      const taskStatusLower = task.status.toLowerCase();
      for (let i in filters.status) {
        status = filters.status[i];
        if (taskStatusLower.startsWith(status.toLowerCase())) {
          matchStatus = true;
          break;
        }
      }

      if (!matchStatus && filters.status.length > 0) {
        // Status didn't match && filtering on status => Not an overall match
        continue;
      }

      for (let i in filters.statusNot) {
        statusNot = filters.statusNot[i];
        if (taskStatusLower.startsWith(statusNot.toLowerCase())) {
          // Not all anti-statuses matched && filtering on not-status
          // => Not an overall match
          continue gidInTasks;
        }
      }

      for (let i in filters.assigned_to) {
        assigned_to = filters.assigned_to[i];
        if (
          task.assigned_to_pursuance_id === null &&
          ((task.assigned_to || '').startsWith(assigned_to) ||
            (task.assigned_to === null && assigned_to === '-'))
        ) {
          matchAssignedTo = true;
          break;
        }
      }
      if (!matchAssignedTo && filters.assigned_to.length > 0) {
        // Assignee didn't match && filtering on assignee => Not an overall match
        continue;
      }

      for (let i in filters.due_date) {
        due_date = filters.due_date[i];
        if (
          (task.due_date || '').startsWith(due_date) ||
          (task.due_date === null && due_date === '-')
        ) {
          matchDueDate = true;
          break;
        }
      }
      if (!matchDueDate && filters.due_date.length > 0) {
        // Due date didn't match && filtering on due date => Not an overall match
        continue;
      }

      for (let i in filters.dueBefore) {
        dueBefore = filters.dueBefore[i];
        // Treating null as neither before nor after any date
        if (!task.due_date || task.due_date.localeCompare(dueBefore) >= 0) {
          continue gidInTasks;
        }
      }

      for (let i in filters.dueAfter) {
        dueAfter = filters.dueAfter[i];
        // Treating null as after all dates
        if (task.due_date && task.due_date.localeCompare(dueAfter) < 0) {
          continue gidInTasks;
        }
      }

      if (
        task.title.toLowerCase().indexOf(filters.title.toLowerCase()) !== -1
      ) {
        matchTitle = true;
      }
      if (!matchTitle && filters.title.length > 0) {
        // Title didn't match && filtering on title => Not an overall match
        continue;
      }

      matches[gid] = true;
    }
    return matches;
  };

  getAssignee = task => {
    return (
      <div>
        <strong>{'@' + task.assigned_to}</strong>
      </div>
    );
  };

  onChangeFilter = e => {
    const { rpUpdateTaskListFilter } = this.props;
    // console.log(e.target.value);

    rpUpdateTaskListFilter(e.target.value);
  };

  clearFilter = () => {
    const { rpUpdateTaskListFilter } = this.props;
    rpUpdateTaskListFilter('');
    this.rightFilterInput.focus();
  };

  // (exampleMatchObject = {
  //   gid: '3_5',
  //   pursuance_id: 3,
  //   id: 5,
  //   title: 'loose',
  //   title_enc: '',
  //   deliverables: '',
  //   deliverables_enc: '',
  //   assigned_to: null,
  //   assigned_to_pursuance_id: null,
  //   due_date: null,
  //   created: '2019-03 - 06T16: 35: 37.145858 - 08: 00',
  //   parent_task_gid: null,
  //   status: 'New',
  //   is_archived: false,
  //   subtask_gids: ['3_6', '3_7', '3_8', '3_9', '3_10', '3_11', '3_12'],
  //   due_date_parsed: '1970 - 01 - 01T00: 00: 00.000Z'
  // };)

  // selectOptionType = ({ label: match.assigned_to, value: match }))

  render() {
    const {
      rightPanel: { taskListFilter },
      rpShowTaskDetails
    } = this.props;

    const matches = this.getMatchingTasks();
    const filterOption =
      taskListFilter.length === 0 ? [] : [{ label: taskListFilter }];

    const Assignee = FilterSelector({
      prefix: '@',
      transformer: matches => {
        return uniqBy(matches, m => m.assigned_to)
          .filter(match => {
            return match.assigned_to;
          })
          .map(match => {
            return { label: match.assigned_to, value: match };
          })
          .filter(({ label }) => label);
      },
      onChangeFilter: this.onChangeFilter
    });

    const Status = FilterSelector({
      prefix: 'status:',
      transformer: matches => {
        const thing = uniqBy(matches, match => match.status).map(match => ({
          label: match.status,
          value: match
        }));
        return thing;
      },
      onChangeFilter: this.onChangeFilter
    });
    const match_to_task = ({ gid, title }) => {
      return (
        <div key={gid} className="task-item">
          <TaskDetailsTopbar taskGid={gid} />
          <div
            className="discuss-task-title-ctn"
            onClick={() => rpShowTaskDetails({ taskGid: gid })}
          >
            <span className="discuss-task-title">{title}</span>
          </div>
        </div>
      );
    };
    const selectOptions = { filterOption, matches };
    return (
      <div className="task-list-ctn">
        <div className="pursuance-tasks-ctn">
          <Assignee {...selectOptions} />
          <Status {...selectOptions} />
          <h2 className="task-list-title">Task List</h2>
          <div className="task-list-filter">
            <div className="filter-label">Filter</div>
            <input
              type="text"
              value={taskListFilter}
              placeholder="@me status:new due:2019-05"
              ref={input => {
                this.rightFilterInput = input;
              }}
              autoFocus={!window.hasVirtualKeyboard}
              onChange={this.onChangeFilter}
            />
            <Button
              className={
                taskListFilter.length > 0
                  ? 'clear-input'
                  : 'clear-input clear-input--hide'
              }
              onClick={this.clearFilter}
            >
              <FaTimes size={28} />
            </Button>
          </div>
          <ul className="task-list">{matches.map(match_to_task)}</ul>
        </div>
      </div>
    );
  }
}

export default connect(
  ({
    currentPursuanceId,
    rightPanel,
    tasks,
    user,
    publicPursuances,
    pursuances
  }) => ({
    currentPursuanceId,
    rightPanel,
    tasks,
    user,
    publicPursuances,
    pursuances
  }),
  { rpUpdateTaskListFilter, rpShowTaskDetails }
)(TaskList);
