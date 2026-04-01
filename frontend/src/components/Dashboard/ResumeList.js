const ResumeList = ({ resumes }) => {
  return (
    <div>
      {resumes.map((r) => (
        <div key={r._id}>
          <p>{r.name}</p>
        </div>
      ))}
    </div>
  );
};
export default ResumeList;