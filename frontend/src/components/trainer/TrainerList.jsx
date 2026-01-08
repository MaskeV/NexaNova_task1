import React, { useEffect, useState } from "react";
import { getAllTrainers, deleteTrainer } from "../../services/trainerService";

const TrainerList = () => {
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    const response = await getAllTrainers();
    setTrainers(response.data);
  };

  const handleDelete = async (id) => {
    await deleteTrainer(id);
    loadTrainers();
  };

  return (
    <div>
      <h2>Trainer List</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Emp ID</th>
            <th>Name</th>
            <th>Subject</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {trainers.map((t) => (
            <tr key={t.empId}>
              <td>{t.empId}</td>
              <td>{t.name}</td>
              <td>{t.subject}</td>
              <td>
                <button onClick={() => handleDelete(t.empId)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrainerList;
