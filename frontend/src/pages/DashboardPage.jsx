export default function DashboardPage({
  user,
  error,
  insights,
  topicForm,
  setTopicForm,
  handleAddTopic,
  doubtForm,
  setDoubtForm,
  handleAddDoubt,
  topics,
  topicSearch,
  setTopicSearch,
  editTopicId,
  editTopicForm,
  setEditTopicForm,
  handleSaveEditTopic,
  setEditTopicId,
  handleStartEditTopic,
  handleDeleteTopic,
  tasks,
  handleTaskStatus,
  doubts,
  aiLogForm,
  setAiLogForm,
  handleAddAiLog,
  handleGeneratePlan,
  handleLogout,
  aiLogs,
  aiExportMarkdown,
  handleExportAiLogs,
  handleCopyAiExport,
  handleDeleteAiLog,
}) {
  return (
    <>
      <div className="card">
        <p>
          Logged in as <strong>{user?.name}</strong> ({user?.role})
        </p>
        <div className="actions">
          <button onClick={handleGeneratePlan}>Generate AI Weekly Plan</button>
          <button className="secondary-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {insights && (
        <div className="metrics-grid">
          <div className="metric-card">
            <p className="metric-label">Completion Rate</p>
            <p className="metric-value">{insights.completion_rate}%</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Missed Tasks</p>
            <p className="metric-value">{insights.missed_tasks}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Open Doubts</p>
            <p className="metric-value">{insights.open_doubts}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Risk Level</p>
            <p className="metric-value">{insights.risk_level}</p>
          </div>
        </div>
      )}

      <div className="grid">
        <section className="card">
          <h2 className="section-title">Add Syllabus Topic</h2>
          <form onSubmit={handleAddTopic}>
            <label>Subject</label>
            <input
              value={topicForm.subject}
              onChange={(e) => setTopicForm({ ...topicForm, subject: e.target.value })}
              required
            />
            <label>Topic</label>
            <input
              value={topicForm.title}
              onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
              required
            />
            <label>Deadline</label>
            <input
              type="date"
              value={topicForm.deadline}
              onChange={(e) => setTopicForm({ ...topicForm, deadline: e.target.value })}
              required
            />
            <label>Difficulty (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={topicForm.difficulty}
              onChange={(e) => setTopicForm({ ...topicForm, difficulty: Number(e.target.value) })}
            />
            <button type="submit">Add Topic</button>
          </form>
        </section>

        <section className="card">
          <h2 className="section-title">Raise Doubt</h2>
          <form onSubmit={handleAddDoubt}>
            <label>Topic (optional)</label>
            <select value={doubtForm.topic_id} onChange={(e) => setDoubtForm({ ...doubtForm, topic_id: e.target.value })}>
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.subject} - {topic.title}
                </option>
              ))}
            </select>
            <label>Title</label>
            <input
              value={doubtForm.title}
              onChange={(e) => setDoubtForm({ ...doubtForm, title: e.target.value })}
              required
            />
            <label>Description</label>
            <textarea
              value={doubtForm.description}
              onChange={(e) => setDoubtForm({ ...doubtForm, description: e.target.value })}
              required
            />
            <button type="submit">Submit Doubt</button>
          </form>
        </section>
      </div>

      <div className="grid">
        <section className="card">
          <h2 className="section-title">Topics</h2>
          <label>Search by subject/title</label>
          <input value={topicSearch} onChange={(e) => setTopicSearch(e.target.value)} placeholder="e.g. Math, Arrays..." />
          {topics.length === 0 ? (
            <p>No topics found.</p>
          ) : (
            <ul>
              {topics.map((topic) => (
                <li key={topic.id}>
                  {editTopicId === topic.id ? (
                    <div>
                      <input
                        value={editTopicForm.subject}
                        onChange={(e) => setEditTopicForm({ ...editTopicForm, subject: e.target.value })}
                      />
                      <input value={editTopicForm.title} onChange={(e) => setEditTopicForm({ ...editTopicForm, title: e.target.value })} />
                      <input
                        type="date"
                        value={editTopicForm.deadline}
                        onChange={(e) => setEditTopicForm({ ...editTopicForm, deadline: e.target.value })}
                      />
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editTopicForm.difficulty}
                        onChange={(e) => setEditTopicForm({ ...editTopicForm, difficulty: Number(e.target.value) })}
                      />
                      <label className="checkbox-line">
                        <input
                          type="checkbox"
                          checked={editTopicForm.is_completed}
                          onChange={(e) => setEditTopicForm({ ...editTopicForm, is_completed: e.target.checked })}
                        />
                        Completed
                      </label>
                      <div className="actions">
                        <button onClick={() => handleSaveEditTopic(topic.id)}>Save</button>
                        <button className="secondary-btn" onClick={() => setEditTopicId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <strong>{topic.subject}</strong> - {topic.title} (deadline: {topic.deadline})
                      <div className="actions">
                        <button onClick={() => handleStartEditTopic(topic)}>Edit</button>
                        <button className="danger-btn" onClick={() => handleDeleteTopic(topic.id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">Weekly Tasks</h2>
          {tasks.length === 0 ? (
            <p>No tasks generated yet.</p>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li key={task.id}>
                  <div className="item-row">
                    <span>Task #{task.id}</span>
                    <span className={`status-chip status-${task.status}`}>{task.status}</span>
                  </div>
                  <p>
                    Topic #{task.topic_id} | {task.task_date}
                  </p>
                  <div className="actions">
                    <button onClick={() => handleTaskStatus(task.id, "completed")}>Complete</button>
                    <button onClick={() => handleTaskStatus(task.id, "missed")}>Missed</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid">
        <section className="card">
          <h2 className="section-title">Doubts</h2>
          {doubts.length === 0 ? (
            <p>No doubts raised.</p>
          ) : (
            <ul>
              {doubts.map((doubt) => (
                <li key={doubt.id}>
                  <div className="item-row">
                    <strong>{doubt.title}</strong>
                    <span className={`status-chip status-${doubt.status}`}>{doubt.status}</span>
                  </div>
                  <p>{doubt.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">Performance Insights</h2>
          {!insights ? (
            <p>No insights yet.</p>
          ) : (
            <ul>
              <li>Completion Rate: {insights.completion_rate}%</li>
              <li>Missed Tasks: {insights.missed_tasks}</li>
              <li>Open Doubts: {insights.open_doubts}</li>
              <li>Risk Level: {insights.risk_level}</li>
            </ul>
          )}
        </section>
      </div>

      <div className="grid">
        <section className="card">
          <h2 className="section-title">AI Usage Log (DB)</h2>
          <form onSubmit={handleAddAiLog}>
            <label>Tool Name</label>
            <input
              value={aiLogForm.tool_name}
              onChange={(e) => setAiLogForm({ ...aiLogForm, tool_name: e.target.value })}
              required
            />
            <label>Prompt Used</label>
            <textarea
              value={aiLogForm.prompt_text}
              onChange={(e) => setAiLogForm({ ...aiLogForm, prompt_text: e.target.value })}
              required
            />
            <label>Completion Summary</label>
            <textarea
              value={aiLogForm.completion_summary}
              onChange={(e) => setAiLogForm({ ...aiLogForm, completion_summary: e.target.value })}
              required
            />
            <label>Action Taken</label>
            <textarea
              value={aiLogForm.action_taken}
              onChange={(e) => setAiLogForm({ ...aiLogForm, action_taken: e.target.value })}
              required
            />
            <label>Files Impacted (comma separated)</label>
            <input
              value={aiLogForm.files_impacted}
              onChange={(e) => setAiLogForm({ ...aiLogForm, files_impacted: e.target.value })}
              placeholder="backend/app/main.py, frontend/src/App.jsx"
            />
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={aiLogForm.used_in_code}
                onChange={(e) => setAiLogForm({ ...aiLogForm, used_in_code: e.target.checked })}
              />
              AI output used in final code
            </label>
            <label>Notes (optional)</label>
            <textarea value={aiLogForm.notes} onChange={(e) => setAiLogForm({ ...aiLogForm, notes: e.target.value })} />
            <button type="submit">Save AI Log</button>
          </form>
        </section>

        <section className="card">
          <h2 className="section-title">Saved AI Logs</h2>
          <div className="actions">
            <button onClick={handleExportAiLogs}>Generate Markdown Export</button>
            <button className="secondary-btn" onClick={handleCopyAiExport} disabled={!aiExportMarkdown}>
              Copy Export
            </button>
          </div>
          {aiExportMarkdown && (
            <>
              <label>Markdown Preview (for LMS report)</label>
              <textarea className="mono-area" value={aiExportMarkdown} readOnly rows={10} />
            </>
          )}
          {aiLogs.length === 0 ? (
            <p>No AI logs recorded yet.</p>
          ) : (
            <ul>
              {aiLogs.map((log) => (
                <li key={log.id}>
                  <strong>{log.tool_name}</strong> - {log.used_in_code ? "Used" : "Not Used"}
                  <p>
                    <strong>Prompt:</strong> {log.prompt_text}
                  </p>
                  <p>
                    <strong>Completion:</strong> {log.completion_summary}
                  </p>
                  <p>
                    <strong>Action:</strong> {log.action_taken}
                  </p>
                  {log.files_impacted && (
                    <p>
                      <strong>Files:</strong> {log.files_impacted}
                    </p>
                  )}
                  {log.notes && (
                    <p>
                      <strong>Notes:</strong> {log.notes}
                    </p>
                  )}
                  <button className="danger-btn" onClick={() => handleDeleteAiLog(log.id)}>
                    Delete Log
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {error && <p className="error">{error}</p>}
    </>
  );
}
