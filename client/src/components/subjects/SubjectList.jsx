import SubjectCard from "./SubjectCard";

export default function SubjectList({ subjects, onDelete, onEdit }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {subjects.map((sub) => (
        <SubjectCard
          key={sub._id}
          subject={sub}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}

    </div>
  );
}