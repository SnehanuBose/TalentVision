const StarredCandidates = ({ candidates }) => {
  return (
    <div>
      {candidates.map((c) => (
        <div key={c._id}>
          <p>{c.name}</p>
        </div>
      ))}
    </div>
  );
};
export default StarredCandidates;