import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export const uploadVideo = async (file: File) => {
  const formData = new FormData();
  formData.append('video', file);
  const response = await api.post('/api/upload', formData);
  return response.data;
};

export const getVideo = async (videoId: string) => {
  const response = await api.get(`/api/videos/${videoId}`);
  return response.data;
};

export const listVideos = async () => {
  const response = await api.get('/api/videos');
  return response.data;
};
