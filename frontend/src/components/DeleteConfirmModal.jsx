export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
