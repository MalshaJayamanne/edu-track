export default function SubjectCard({ subject, onDelete, onEdit }) {
  return (
    <div className="border rounded p-4 shadow hover:shadow-lg">

      <h2 className="text-lg font-bold">{subject.title}</h2>

      <p className="text-sm text-gray-600">Code: {subject.code}</p>
      <p className="text-sm">Lecturer: {subject.lecturer}</p>
      <p className="text-sm">Semester: {subject.semester}</p>
      <p className="text-sm">Credits: {subject.credits}</p>

      <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-200 rounded">
        {subject.difficulty}
      </span>

      <div className="flex gap-2 mt-3">

        <button
          onClick={() => onEdit(subject)}
          className="text-blue-600"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(subject._id)}
          className="text-red-600"
        >
          Delete
        </button>

      </div>

    </div>
  );
}