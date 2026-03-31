import { useEffect, useState } from 'react'
import { useProjectStore, type Project } from '../store/projectStore'
import { loadProjects, deleteProject as dbDelete } from '../utils/db'
import { Plus, Globe, Trash2, Copy, ExternalLink } from 'lucide-react'

export default function Dashboard() {
  const { projects, setProjects, setCurrentProject, setView, createProject } = useProjectStore()
  const [showNewModal, setShowNewModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDomain, setNewDomain] = useState('')

  useEffect(() => {
    loadProjects().then((loaded) => setProjects(loaded as Project[]))
  }, [setProjects])

  const handleCreate = () => {
    if (!newName.trim()) return
    const project = createProject(newName.trim(), newDomain.trim())
    setCurrentProject(project)
    setView('editor')
    setShowNewModal(false)
    setNewName('')
    setNewDomain('')
  }

  const handleOpen = (project: Project) => {
    setCurrentProject(project)
    setView('editor')
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this project? This cannot be undone.')) return
    await dbDelete(id)
    setProjects(projects.filter((p) => p.id !== id))
  }

  const handleDuplicate = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    const dup = createProject(`${project.name} (Copy)`, project.domain)
    dup.editorData = project.editorData
    dup.pages = [...project.pages]
  }

  return (
    <div className="h-full bg-surface-dark text-white overflow-auto">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold">nssLocalWebBuilder</h1>
            <p className="text-neutral-500 text-sm mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* Project Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-6">
              <Globe size={28} className="text-neutral-600" />
            </div>
            <h2 className="text-lg font-medium mb-2">No projects yet</h2>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto">
              Create your first project to start building a website with the visual editor.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-6 py-3 bg-accent hover:bg-accent-hover rounded-lg text-sm font-medium transition-colors"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleOpen(project)}
                className="group bg-surface border border-surface-border rounded-xl overflow-hidden cursor-pointer hover:border-accent/50 transition-all"
              >
                {/* Preview */}
                <div className="h-40 bg-surface-dark flex items-center justify-center border-b border-surface-border">
                  <span className="text-neutral-600 text-sm">Preview</span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm truncate">{project.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        project.status === 'live'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {project.status === 'live' ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  {project.domain && (
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mb-3">
                      <Globe size={12} />
                      {project.domain}
                    </p>
                  )}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDuplicate(project, e)}
                      className="p-1.5 rounded hover:bg-surface-hover text-neutral-500 hover:text-white"
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-neutral-500 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                    {project.domain && (
                      <a
                        href={`https://${project.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded hover:bg-surface-hover text-neutral-500 hover:text-white ml-auto"
                        title="Visit Site"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* New Project Card */}
            <div
              onClick={() => setShowNewModal(true)}
              className="border border-dashed border-surface-border rounded-xl flex flex-col items-center justify-center min-h-[240px] cursor-pointer hover:border-accent/50 hover:bg-surface/50 transition-all"
            >
              <Plus size={24} className="text-neutral-600 mb-2" />
              <span className="text-sm text-neutral-500">New Project</span>
            </div>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowNewModal(false)}>
          <div
            className="bg-surface border border-surface-border rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-6">New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Awesome Site"
                  className="w-full px-3 py-2.5 bg-surface-dark border border-surface-border rounded-lg text-sm text-white placeholder-neutral-600 focus:border-accent focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Domain (optional)</label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2.5 bg-surface-dark border border-surface-border rounded-lg text-sm text-white placeholder-neutral-600 focus:border-accent focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
