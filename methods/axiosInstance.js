import axios from 'axios';

// 创建 Axios 实例
const axiosInstance = axios.create({
  baseURL: 'https://150.158.128.134:3000', // 设置你的基础 URL
  timeout: 50000,
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('token');
    console.log(token);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = token;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  function (response) {
    if (response.data.code === 201) {
      window.location.href = '/key';
    }
    return response.data;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// 导出 Axios 实例
export default axiosInstance;
