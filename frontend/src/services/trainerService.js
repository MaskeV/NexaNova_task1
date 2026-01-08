import axios from "axios";

const BASE_URL = "http://localhost:8080"; // backend URL

export const getAllTrainers = () =>
  axios.get(`${BASE_URL}/trainer`);

export const addTrainer = (trainer) =>
  axios.post(`${BASE_URL}/trainer`, trainer);

export const deleteTrainer = (id) =>
  axios.delete(`${BASE_URL}/trainer`, { data: { empId: id } });

export const getTrainerById = (id) =>
  axios.get(`${BASE_URL}/trainer/${id}`);

export const getTrainerBySubject = (subject) =>
  axios.get(`${BASE_URL}/trainer/${subject}/topic`);
