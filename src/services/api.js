const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem("ra_token");

    const headers = {
      Accept: "application/json",
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail || `API request failed: ${response.status}`
      );
    }

    return data;
  },

  health() {
    return this.request("/health");
  },

  login(email, password) {
    return this.request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });
  },

  uploadResume(file) {
    const formData = new FormData();
    formData.append("file", file);

    return this.request("/api/v1/resume/upload", {
      method: "POST",
      body: formData,
    });
  },

  getMyResume() {
    return this.request("/api/v1/resume/my-resume");
  },

  getResumeAnalysis(resumeId) {
    return this.request(`/api/v1/resume/${resumeId}/analysis`);
  },

  improveResume(resumeId) {
    return this.request(`/api/v1/resume/${resumeId}/improve`, {
      method: "POST",
    });
  },

  getQuizSkills() {
    return this.request("/api/v1/quiz/skills");
  },

  generateQuiz(skillName) {
    return this.request(`/api/v1/quiz/generate/${encodeURIComponent(skillName)}`, {
      method: "POST",
    });
  },

  submitQuiz({ quiz_session_id, answers }) {
    return this.request("/api/v1/quiz/submit", {
      method: "POST",
      body: JSON.stringify({ quiz_session_id, answers }),
    });
  },

  getQuizScores() {
    return this.request("/api/v1/quiz/my-scores");
  },
};

export default api;